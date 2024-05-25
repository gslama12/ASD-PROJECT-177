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

        this.games = new Map()
    }

    async createSinglePlayerGame(gameMode, category, difficulty, playerId) {
        try {
            const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty, [playerId])
            if (triviaQuiz === undefined) {
                return undefined;
            }

            const quizId = triviaQuiz.quizId;
            if (this.games.has(quizId)) {
                console.error("Duplicate UUID; or bug in code.")
                return undefined;
            }

            this.games.set(quizId, triviaQuiz);
            return this.games.get(quizId);
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    getGame(quizId) {
        if (!quizId) {
            return undefined;
        }

        return this.games.get(quizId);
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;
