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

    async createSinglePlayerGame(userId, gameMode, category, difficulty) {
        if (!this.singlePlayerGames.has(userId)) {
            try {
                const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty)
                this.singlePlayerGames.set(userId, triviaQuiz);
            } catch (err) {
                console.error(err);
                return undefined;
            }
        }

        return this.singlePlayerGames.get(userId);
    }

    getSinglePlayerGame(userId) {
        // TODO we don't have game IDs as of now
        if (!this.singlePlayerGames.has(userId)) {
            return undefined;
        }
        return this.singlePlayerGames.get(userId);
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;