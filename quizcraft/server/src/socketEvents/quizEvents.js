const getTriviaApiOptions = require("../triviaQuiz/triviaQuizOptions");
const triviaQuizManager = require("../triviaQuiz/triviaQuizManager");
const {constructErrorResponse, constructDataResponse} = require("./messageHelper");
const { getGameStats, getUserGames} = require("../controllers/gameStatsController");
const TriviaQuestionSettings = require("../triviaQuiz/triviaQuestionSettings");
const mongoose = require("mongoose");


const EVENTS = {
    NEW_SINGLE_PLAYER_GAME: "quiz-new-single-player-game",
    JOIN_MULTIPLAYER_QUEUE: "quiz-join-multiplayer-queue",
    MULTIPLAYER_QUEUE_READY: "quiz-multiplayer-queue-ready", // To notify clients that queue is ready
    NEW_MULTIPLAYER_GAME: "quiz-new-multiplayer-game",
    GET_NEXT_QUESTION: "quiz-get-next-question",
    ANSWER_QUESTION: "quiz-answer-question",
    GET_GAME_OPTIONS: "quiz-get-game-options",
    GET_GAME_INFO: "quiz-get-game-info",
    GAME_COMPLETE: "quiz-game-complete", // For serving stats to client.
    GET_GAME_STATS: "quiz-get-game-stats",
    GET_USER_GAMES: "quiz-get-user-games",
}

// TODO: player IDs not implemented yet. Note: Is it possible to make socket-ids persistent?
// const playerId = new mongoose.Types.ObjectId();

// TODO Authorization for roomId
module.exports = (socket, io) => {

    /*
    Creates a new single player game.
     */
    socket.on(EVENTS.NEW_SINGLE_PLAYER_GAME, async (body) => {
        // Technically, all question settings are optional.
        const gameMode = body?.gameMode;
        const category = body?.category;
        const difficulty = body?.difficulty;
        const playerId = body?.userId; // insecure solution (should use JWT and verify with database)
        const rounds = body?.rounds;

        if (!gameMode || (gameMode !== "multiple" && gameMode !== "boolean")) {
            const errorObject = constructErrorResponse("gameMode must be set to either 'multiple' or 'boolean'.");
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, errorObject);
            return;
        }

        if (!playerId) {
            const errorObject = constructErrorResponse("Need 'usedId' parameter.");
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, errorObject);
            return;
        }

        const quizObject = await triviaQuizManager.createSinglePlayerGame(gameMode, category, difficulty, playerId, rounds)

        if (quizObject === undefined) {
            const errorObject = constructErrorResponse("Couldn't create new game.");
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, errorObject);
            return;
        }

        // Send initial question to client upon creating a new game
        const question = await quizObject.getNextQuestion();
        if (!question) {
            const errorObject = constructErrorResponse("Couldn't retrieve initial question.");
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, errorObject);
            return;
        }

        const gameData = quizObject.getAllGameData(); // sending all game info, not only question
        console.info(`Created single player game for userId '${playerId}'.`)
        socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, constructDataResponse(gameData));
    });


    /*
    1) Call multiplayer queue event and check if other players with *same* settings are waiting.
    1a) If nobody is waiting, you are first: Create a new UUID roomId and send it to client.
    Server stores roomId with game settings in "queue object" (userId doesn't need to be stored?).
    1b) If someone is waiting, you are second or later: Use the UUID stored from 1a) and send it to client.
    2) You and matching player join the same socket room! Use roomId to communicate within multiplayer game.
    Note that joining the room doesn't start the multiplayer game.
     */
    socket.on(EVENTS.JOIN_MULTIPLAYER_QUEUE, async (body) => {
        // TODO Technically, the same player can join multiple queues
        const gameMode = body?.gameMode;
        const category = body?.category;
        const difficulty = body?.difficulty;
        const playerId = body?.userId;
        const rounds = body?.rounds;

        if (!gameMode || (gameMode !== "multiple" && gameMode !== "boolean")) {
            const errorObject = constructErrorResponse("gameMode must be set to either 'multiple' or 'boolean'.");
            socket.emit(EVENTS.JOIN_MULTIPLAYER_QUEUE, errorObject);
            return;
        }

        if (!playerId) {
            const errorObject = constructErrorResponse("Need 'usedId' parameter.");
            socket.emit(EVENTS.JOIN_MULTIPLAYER_QUEUE, errorObject);
            return;
        }

        const gameSettings = new TriviaQuestionSettings(gameMode, category, difficulty, undefined, rounds);


        let roomId = triviaQuizManager.findMatchingPlayerInQueue(gameSettings, playerId);

        if (!roomId) {
            // You are the first player in the queue with your gameSettings -> Add new entry
            // Wait for other player to join queue before calling
            console.info(`First to join multiplayer queue with gameSettings ${gameSettings}`);
            roomId = triviaQuizManager.insertRoomQueueElement(gameSettings, playerId);
            socket.join(roomId);
            socket.emit(EVENTS.JOIN_MULTIPLAYER_QUEUE, constructDataResponse({"roomId": roomId}));
            return;
        } else {
            console.info(`Found matching player in queue with gameSettings ${gameSettings}`);
        }

        const queueElement = triviaQuizManager.getQueueElement(roomId);
        if (!queueElement.isRoomFull()) {
            socket.join(roomId);
            socket.emit(EVENTS.JOIN_MULTIPLAYER_QUEUE, constructDataResponse({"roomId": roomId}));
            return;
        }


        // Join room
        // TODO Edge case: What happens if player refreshes their browser? -> Need new event to join roomId and call it from client-side.
        //  Also, how to handle TriviaQuizManager.roomQueue in such a case?
        socket.join(roomId);
        socket.emit(EVENTS.JOIN_MULTIPLAYER_QUEUE, constructDataResponse({"roomId": roomId}));

        io.to(roomId).emit(EVENTS.MULTIPLAYER_QUEUE_READY);
    });


    /*
    Preliminary: You called JOIN_MULTIPLAYER_QUEUE and have received a roomId.
    1) Once both players joined, a new TriviaQuiz object is created with the queue settings.
    2) Queue object is deleted.
    3) Play as usual, with the difference that responses aren't sent immediately, but only if last player made an answer.
     */
    socket.on(EVENTS.NEW_MULTIPLAYER_GAME, async (body) => {
        const playerId = body?.userId;
        const roomId = body?.roomId;
        const rounds = (body?.rounds) ? body.rounds : 10;  // default num rounds = 10

        if (!playerId || !roomId) {
            const errorObject = constructErrorResponse("Need playerId and roomId parameters.");
            socket.emit(EVENTS.NEW_MULTIPLAYER_GAME, errorObject);
            return;
        }

        const queueElement = triviaQuizManager.getQueueElement(roomId);
        if (!queueElement) {
            const errorObject = constructErrorResponse(`No queue entry with roomId ${roomId} exists.`);
            socket.emit(EVENTS.NEW_MULTIPLAYER_GAME, errorObject);
            return;
        }

        // Inform queue you are ready to start game
        if (!triviaQuizManager.joinMultiplayerGame(queueElement, playerId)) {
            const errorObject = constructErrorResponse("Couldn't join a new multiplayer game.");
            socket.emit(EVENTS.NEW_MULTIPLAYER_GAME, errorObject);
            return;
        }

        // If you are not the last player, wait for other players to be ready to start the game
        if(!queueElement.canStartGame()) {
            console.log(`playerId ${playerId} is waiting for other players to start multiplayer game (roomId ${roomId})`);
            return;
        }

        // You are the last player to join, create multiplayer game and inform all players of the room
        const quizObject = await triviaQuizManager.createMultiplayerGame(queueElement, roomId, rounds)
        if (quizObject === undefined) {
            const errorObject = constructErrorResponse("Couldn't create new multiplayer game.");
            socket.emit(EVENTS.NEW_MULTIPLAYER_GAME, errorObject);
            return;
        }

        // Send initial question to client upon creating a new game
        const question = await quizObject.getNextQuestion();
        if (!question) {
            const errorObject = constructErrorResponse("Couldn't retrieve initial multiplayer question.");
            socket.emit(EVENTS.NEW_MULTIPLAYER_GAME, errorObject);
            return;
        }

        const gameData = quizObject.getAllGameData(); // sending all game info, not only question
        console.info(`Created multiplayer game for userIds '${queueElement.playerIds.join(", ")}'.`)
        io.to(roomId).emit(EVENTS.NEW_MULTIPLAYER_GAME, constructDataResponse(gameData));
    })


    // Note: this event is typically not used. You get next question from <EVENTS.ANSWER_QUESTION>
    socket.on(EVENTS.GET_NEXT_QUESTION, async (body) => {
        // TODO how to handle to support multiplayer? Wait until all players clicked "next question" before you do anything? (similar to answer question event)
        const gameId = body?.gameId;

        if (!gameId) {
            const errorObject = constructErrorResponse("Request needs 'gameId' parameter.");
            socket.emit(EVENTS.GET_NEXT_QUESTION, errorObject);
            return;
        }

        const quizObject = triviaQuizManager.getGame(gameId);
        if (!quizObject) {
            const errorObject = constructErrorResponse(`Couldn't find game for gameId ${gameId}.`);
            socket.emit(EVENTS.GET_NEXT_QUESTION, errorObject);
            return;
        }

        const question = await quizObject.getNextQuestion();
        if (!question) {
            const errorObject = constructErrorResponse("Couldn't retrieve next question.");
            socket.emit(EVENTS.GET_NEXT_QUESTION, errorObject);
            return;
        }

        const gameData = quizObject.getAllGameData(); // sending all game info, not only question
        socket.emit(EVENTS.GET_NEXT_QUESTION, constructDataResponse(gameData));
    });


    // TODO Comment with explanations
    socket.on(EVENTS.ANSWER_QUESTION, async (body) => {
        const gameId = body?.gameId;
        const answer = body?.answer;
        const playerId = body?.userId; // insecure solution (should use JWT and verify with database)
        const roomId = body?.roomId; // only used if multiplayer
        let isMultiplayerGame = false;

        if (!gameId || !answer || !playerId) {
            const errorObject = constructErrorResponse("Request requires 'gameId', 'answer' and 'userId' parameters.");
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        const quizObject = triviaQuizManager.getGame(gameId);
        if (!quizObject) {
            const errorObject = constructErrorResponse(`Couldn't find game for gameId ${gameId}.`);
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        if (quizObject.players.length > 1) {
            isMultiplayerGame = true;
            if (!roomId) {
                const errorObject = constructErrorResponse(`Trying to answer a multiplayer game without roomId parameter.`);
                socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
                return;
            }
            if (!io.sockets.adapter.rooms.get(roomId)) {
                const errorObject = constructErrorResponse(`roomId ${roomId} doesn't exist.`);
                socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
                return;
            }
        }

        if(!quizObject.setPlayerAnswer(playerId, answer)) {
            const errorObject = constructErrorResponse(`Couldn't answer for gameId ${gameId} and playerId ${playerId}.`);
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        if (!quizObject.allPlayersAnswered()) {
            // You need to wait for other players to make an answer
            console.info(`playerId ${playerId} is waiting for other players to answer a question in multiplayer game (roomId ${roomId})`);
            return;
        }

        // You are the final player to make an answer, emit roundResults to all players of the game.
        let gameData = quizObject.evaluateAnswers(); // sending all game info, not only answer results

        // Check if the game is complete
        if (gameData.gameInfo.gameComplete) {
            // If the game is complete, emit the 'game-complete' event. Note that game stats are already saved
            // in TriviaQuiz.#questionComplete() by calling quizObject.evaluateAnswers().
            if (isMultiplayerGame) {
                io.to(roomId).emit(EVENTS.GAME_COMPLETE, constructDataResponse(gameData));
            } else {
                socket.emit(EVENTS.GAME_COMPLETE, constructDataResponse(gameData));
            }
        } else {
            // If game not complete, get next question
            const question = await quizObject.getNextQuestion();
            if (!question) {
                // No question. Client needs to call GET_NEXT_QUESTION event?! (What about multiplayer)
            }

            // to preserve question answer details
            const playerDataBackup = gameData["players"];
            gameData = quizObject.getAllGameData(); // get gameData with new question

            // add new score to the backup
            for (let playerIndex = 0; playerIndex < gameData["players"].length; playerIndex++) {
                playerDataBackup[playerIndex]["score"] = gameData["players"][playerIndex]["score"];
            }
            gameData["players"] = playerDataBackup;
        }

        if (isMultiplayerGame) {
            io.to(roomId).emit(EVENTS.ANSWER_QUESTION, constructDataResponse(gameData));
        } else {
            socket.emit(EVENTS.ANSWER_QUESTION, constructDataResponse(gameData));
        }
    });


    // TODO Comment with explanations
    socket.on(EVENTS.GET_GAME_OPTIONS, async () => {
        const categoryOptions = await getTriviaApiOptions();
        socket.emit(EVENTS.GET_GAME_OPTIONS, constructDataResponse(categoryOptions));
    });


    // TODO Comment with explanations
    socket.on(EVENTS.GET_GAME_INFO, async (body) => {
        const gameId = body?.gameId;

        if (!gameId) {
            const errorObject = constructErrorResponse("Request needs 'gameId' parameter.");
            socket.emit(EVENTS.GET_GAME_INFO, errorObject);
            return;
        }

        const quizObject = triviaQuizManager.getGame(gameId);
        if (!quizObject) {
            const errorObject = constructErrorResponse(`Couldn't find game for gameId ${gameId}.`);
            socket.emit(EVENTS.GET_GAME_INFO, errorObject);
            return;
        }

        const gameData = quizObject.getAllGameData();
        socket.emit(EVENTS.GET_GAME_INFO, constructDataResponse(gameData));
    });

    // This event is triggered when a game is completed.
    // Triggered from within the ANSWER_QUESTION event, in case all players answeared and game is over!
    // Emits the game statistics data to all players in the game.
    // socket.on(EVENTS.GAME_COMPLETE, async (gameStatsData) => {
    //     socket.emit(EVENTS.GAME_COMPLETE, constructDataResponse(gameStatsData));
    //});

    // This event is triggered when the game statistics for a specific game are requested.
    // Used to fetch game data from databse for a specific game#
    // Calls getGameStats() from gameStatsController.js
    socket.on(EVENTS.GET_GAME_STATS, async (body) => {
        console.log("Get Game Stats");
        const gameId = body?.gameId;

        if (!gameId) {
            const errorObject = constructErrorResponse("Request needs 'gameId' parameter.");
            socket.emit(EVENTS.GET_GAME_STATS, errorObject);
            return;
        }

        const result = await getGameStats(gameId);
        socket.emit(EVENTS.GET_GAME_STATS, constructDataResponse(result));
    });

    // This event is triggered when the games played by a specific user are requested.
    // Used to fetch all game data for a user form db
    // Calls getUserGames() from gameStatsController.js
    socket.on(EVENTS.GET_USER_GAMES, async (body) => {
        console.log("Get User Games");
        const username = body?.username;

        if (!username) {
            const errorObject = constructErrorResponse("Request needs 'username' parameter.");
            socket.emit(EVENTS.GET_USER_GAMES, errorObject);
            return;
        }

        const result = await getUserGames(username);
        socket.emit(EVENTS.GET_USER_GAMES, constructDataResponse(result));
    });

};

