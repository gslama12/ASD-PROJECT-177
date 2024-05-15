const getTriviaApiOptions = require("../triviaQuiz/triviaQuizOptions");
const triviaQuizManager = require("../triviaQuiz/triviaQuizManager");


const EVENTS = {
    NEW_SINGLE_PLAYER_GAME: "quiz-new-single-player-game",
    GET_NEXT_QUESTION: "quiz-get-next-question",
    ANSWER_QUESTION: "quiz-answer-question",
    GET_GAME_OPTIONS: "quiz-get-game-options"
}



// TODO Don't use socket.id.: https://stackoverflow.com/questions/49338970/how-to-send-data-to-a-users-socket-id-after-they-have-refreshed-socket-io
// TODO Authorization for roomId
module.exports = (socket, io) => {
    socket.on(EVENTS.NEW_SINGLE_PLAYER_GAME, async (body) => {
        // Technically, all question settings are optional.
        const gameMode = body?.mode;
        const category = body?.category;
        const difficulty = body?.difficulty;

        // TODO verify client input

        const quizObject = await triviaQuizManager.createSinglePlayerGame(gameMode, category, difficulty)

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
        const gameId = body?.gameId;

        if (!gameId) {
            socket.emit(EVENTS.GET_NEXT_QUESTION, {error: "Request needs 'gameId' parameter."})
            return;
        }

        const quizObject = triviaQuizManager.getSinglePlayerGame(gameId);
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
        // body not used right now, may be relevant to pass socket roomId.
    })

    socket.on(EVENTS.GET_GAME_OPTIONS, async () => {
        const categoryOptions = await getTriviaApiOptions();
        socket.emit(EVENTS.GET_GAME_OPTIONS, {data: categoryOptions});
    });
}

