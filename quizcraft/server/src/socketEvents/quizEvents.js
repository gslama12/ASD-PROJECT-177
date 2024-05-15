const getTriviaApiOptions = require("../triviaQuiz/triviaQuizOptions");
const triviaQuizManager = require("../triviaQuiz/triviaQuizManager");


const EVENTS = {
    NEW_SINGLE_PLAYER_GAME: "quiz-new-single-player-game",
    GET_NEXT_QUESTION: "quiz-get-next-question",
    ANSWER_QUESTION: "quiz-answer-question",
    GET_GAME_OPTIONS: "quiz-get-game-options"
}


// TODO Authorization for roomId
module.exports = (socket, io) => {
    socket.on(EVENTS.NEW_SINGLE_PLAYER_GAME, async (body) => {
        // Technically, all question settings are optional.
        const gameMode = body?.mode;
        const category = body?.category;
        const difficulty = body?.difficulty;
        // TODO verify client input

        const playerId ="PlayerId";
        const quizObject = await triviaQuizManager.createSinglePlayerGame(gameMode, category, difficulty, playerId)

        if (quizObject === undefined) {
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, {error: "Couldn't create new game."})
            return;
        }

        // Send initial question to client upon creating a new game
        const question = await quizObject.getNextQuestion();
        if (!question) {
            socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, {error: "Couldn't retrieve initial question."})
            return;
        }


        const responseData = {
            gameId: quizObject.quizId,
            question: question
        }
        socket.emit(EVENTS.NEW_SINGLE_PLAYER_GAME, {data: responseData});
    });


    socket.on(EVENTS.GET_NEXT_QUESTION, async (body) => {
        // TODO how to handle to support multiplayer? Wait until all players clicked "next question" before you do anything?
        const gameId = body?.gameId;

        if (!gameId) {
            socket.emit(EVENTS.GET_NEXT_QUESTION, {error: "Request needs 'gameId' parameter."})
            return;
        }

        const quizObject = triviaQuizManager.getSinglePlayerGame(gameId); // currently "hardcoded" for single player
        if (!quizObject) {
            socket.emit(EVENTS.GET_NEXT_QUESTION, {error: `Couldn't find game for gameId ${gameId}.`})
            return;
        }

        const question = await quizObject.getNextQuestion();
        if (!question) {
            socket.emit(EVENTS.GET_NEXT_QUESTION, {error: "Couldn't retrieve next question."})
            return;
        }

        socket.emit(EVENTS.GET_NEXT_QUESTION, {data: question})
    });


    socket.on(EVENTS.ANSWER_QUESTION, async (body) => {
        const playerId = "PlayerId";

        const gameId = body?.gameId;
        const answer = body?.answer;

        if (!gameId || !answer) {
            socket.emit(EVENTS.ANSWER_QUESTION, {error: "Request needs 'gameId' and 'answer' parameters."});
            return;
        }

        const quizObject = triviaQuizManager.getSinglePlayerGame(gameId); // currently "hardcoded" for single player
        if (!quizObject) {
            socket.emit(EVENTS.ANSWER_QUESTION, {error: `Couldn't find game for gameId ${gameId}.`});
            return;
        }

        if(!quizObject.setPlayerAnswer(playerId, answer)) {
            socket.emit(EVENTS.ANSWER_QUESTION, {error: `Couldn't answer for gameId ${gameId} and playerId ${playerId}.`});
            return;
        }

        if (!quizObject.allPlayersAnswered()) {
            // You need to wait for other players to make an answer
            return;
        }

        // You are the final player to make an answer, emit roundResults to all players of the game.
        // TODO For multiplayer, need to use socket rooms
        const roundResults = quizObject.evaluateAnswers();
        socket.emit(EVENTS.ANSWER_QUESTION, {data: roundResults});
    });


    socket.on(EVENTS.GET_GAME_OPTIONS, async () => {
        const categoryOptions = await getTriviaApiOptions();
        socket.emit(EVENTS.GET_GAME_OPTIONS, {data: categoryOptions});
    });
}

