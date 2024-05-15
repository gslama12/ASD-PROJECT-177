const {triviaQuizFactory} = require("../triviaQuiz/triviaQuiz");
const getTriviaApiOptions = require("../triviaQuiz/triviaQuizOptions");
const triviaQuizManager = require("../triviaQuiz/triviaQuizManager");


module.exports = (socket, io) => {
    socket.on("quiz-new-single-player-game", async (body
    ) => {
        // Technically, all question options are optional.
        const clientId = socket.id;
        const gameMode = body?.mode;
        const category = body?.category;
        const difficulty = body?.difficulty;

        // TODO verify client input

        const quizObject = await triviaQuizManager.createSinglePlayerGame(clientId)

        if (quizObject === undefined) {
            io.to(clientId).emit("quiz-new-single-player-game", {error: "Couldn't create new game."})
            return;
        }

        // Send question to client upon creating a new game




        // The TriviaQuiz object should be created for each individual game and stored somewhere else.
        const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty);

        const question = await triviaQuiz.getNextQuestion();
        if (!question) {
            io.to(clientId).emit("quiz-new-single-player-game", {error: "Couldn't retrieve question"})
        } else {
            io.to(clientId).emit("quiz-new-single-player-game", {message: question})
        }
    });

    socket.on("quiz-get-next-question", async (body) => {
      // TODO create
    });

    socket.on("quiz-answer-question", async (body) => {
        // body not used right now, may be relevant to pass socket roomId.
    })

    socket.on("quiz-get-game-options", async () => {
        const categoryOptions = await getTriviaApiOptions();
        socket.emit("quiz-get-game-options", {message: categoryOptions});
    });
}

