const getTriviaApiOptions = require("../triviaQuiz/triviaQuizOptions");
const triviaQuizManager = require("../triviaQuiz/triviaQuizManager");
const {constructErrorResponse, constructDataResponse} = require("./messageHelper");
const { getGameStats, getUserGames} = require("../controllers/gameStatsController");


const EVENTS = {
    NEW_SINGLE_PLAYER_GAME: "quiz-new-single-player-game",
    GET_NEXT_QUESTION: "quiz-get-next-question",
    ANSWER_QUESTION: "quiz-answer-question",
    GET_GAME_OPTIONS: "quiz-get-game-options",
    GET_GAME_INFO: "quiz-get-game-info",
    GAME_COMPLETE: "game-complete" // For serving stats to client.
}


// TODO Authorization for roomId
module.exports = (socket, io) => {
    socket.on(EVENTS.NEW_SINGLE_PLAYER_GAME, async (body) => {
        // Technically, all question settings are optional.
        const gameMode = body?.gameMode;
        const category = body?.category;
        const difficulty = body?.difficulty;
        // TODO verify client input

        const playerId ="PlayerId";
        const quizObject = await triviaQuizManager.createSinglePlayerGame(gameMode, category, difficulty, playerId)

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
        socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, constructDataResponse(gameData));
    });


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


    socket.on(EVENTS.ANSWER_QUESTION, async (body) => {
        const playerId = "PlayerId";

        const gameId = body?.gameId;
        const answer = body?.answer;

        if (!gameId || !answer) {
            const errorObject = constructErrorResponse("Request requires 'gameId' and 'answer' parameters.");
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        const quizObject = triviaQuizManager.getGame(gameId);
        if (!quizObject) {
            const errorObject = constructErrorResponse(`Couldn't find game for gameId ${gameId}.`);
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        if(!quizObject.setPlayerAnswer(playerId, answer)) {
            const errorObject = constructErrorResponse(`Couldn't answer for gameId ${gameId} and playerId ${playerId}.`);
            socket.emit(EVENTS.ANSWER_QUESTION, errorObject);
            return;
        }

        if (!quizObject.allPlayersAnswered()) {
            // You need to wait for other players to make an answer
            return;
        }

        // You are the final player to make an answer, emit roundResults to all players of the game.
        // TODO For multiplayer, need to use socket rooms
        const gameData = quizObject.evaluateAnswers(); // sending all game info, not only answer results

        // Check if the game is complete
        if (gameData.gameInfo.gameComplete) {
            // If the game is complete, save the game stats and emit the 'game-complete' event
            const gameStatsData = await quizObject.saveGameStats();
            socket.emit(EVENTS.GAME_COMPLETE, constructDataResponse(gameStatsData));
        }

        socket.emit(EVENTS.ANSWER_QUESTION, constructDataResponse(gameData));
    });


    socket.on(EVENTS.GET_GAME_OPTIONS, async () => {
        const categoryOptions = await getTriviaApiOptions();
        socket.emit(EVENTS.GET_GAME_OPTIONS, constructDataResponse(categoryOptions));
    });


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
    socket.on(EVENTS.GAME_COMPLETE, async (gameStatsData) => {
        socket.emit(EVENTS.GAME_COMPLETE, constructDataResponse(gameStatsData));
    });

    // This event is triggered when the game statistics for a specific game are requested.
    socket.on("get-game-stats", async (body) => {
        const gameId = body?.gameId;

        if (!gameId) {
            const errorObject = constructErrorResponse("Request needs 'gameId' parameter.");
            socket.emit("get-game-stats-response", errorObject);
            return;
        }

        const result = await getGameStats(gameId);
        socket.emit("get-game-stats-response", constructDataResponse(result));
    });

    // This event is triggered when the games played by a specific user are requested.
    socket.on("get-user-games", async (body) => {
        const username = body?.username;

        if (!username) {
            const errorObject = constructErrorResponse("Request needs 'username' parameter.");
            socket.emit("get-user-games-response", errorObject);
            return;
        }

        const result = await getUserGames(username);
        socket.emit("get-user-games-response", constructDataResponse(result));
    });
};

