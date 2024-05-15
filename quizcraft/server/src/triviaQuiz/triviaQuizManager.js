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

    async createSinglePlayerGame(socketId) {
        if (!this.singlePlayerGames.has(socketId)) {
            try {
                const triviaQuiz = await triviaQuizFactory()
                this.singlePlayerGames[socketId] = triviaQuiz;
            } catch (err) {
                console.error(err);
                return undefined;
            }
        }

        return this.singlePlayerGames[socketId];
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;