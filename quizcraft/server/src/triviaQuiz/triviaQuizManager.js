const {triviaQuizFactory} = require("./triviaQuiz");

/**
 * Singleton class to keep track of ongoing matches.
 */
class TriviaQuizManager {
    constructor() {
        if (TriviaQuizManager._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        TriviaQuizManager._instance = this;

        this.singlePlayerGames = new Map()
        this.multiPlayerGames = new Map()
    }

    async createSinglePlayerGame(gameMode, category, difficulty, playerId) {
        try {
            const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty, [playerId])
            if (triviaQuiz === undefined) {
                return false;
            }

            const quizId = triviaQuiz.quizId;
            if (this.singlePlayerGames.has(quizId)) {
                console.error("Duplicate UUID; or bug in code.")
                return undefined;
            }

            this.singlePlayerGames.set(quizId, triviaQuiz);
            return this.singlePlayerGames.get(quizId);
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    getSinglePlayerGame(quizId) {
        if (!quizId) {
            return undefined;
        }

        return this.singlePlayerGames.get(quizId);
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;