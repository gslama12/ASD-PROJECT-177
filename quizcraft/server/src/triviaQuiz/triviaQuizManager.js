const { triviaQuizFactory } = require("./triviaQuiz");
const { Game } = require("../models/quizModel");

/**
 * Singleton class to keep track of ongoing matches.
 */
class TriviaQuizManager {
    constructor() {
        if (TriviaQuizManager._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.");
        }
        TriviaQuizManager._instance = this;

        this.games = new Map();
    }

    async createSinglePlayerGame(gameMode, category, difficulty, playerId) {
        try {
            const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty, [playerId]);
            if (triviaQuiz === undefined) {
                return undefined;
            }

            const quizId = triviaQuiz.quizId;
            if (this.games.has(quizId)) {
                console.error("Duplicate UUID; or bug in code.");
                return undefined;
            }

            this.games.set(quizId, triviaQuiz);
            await triviaQuiz.saveGameState(); // Save the initial game state to the database
            return this.games.get(quizId);
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    async getGame(quizId) {
        if (!quizId) {
            return undefined;
        }

        if (this.games.has(quizId)) {
            return this.games.get(quizId);
        } else {
            // Fetch from the database if not present in the in-memory store
            const gameData = await Game.findOne({ gameId: quizId });
            if (gameData) {
                const triviaQuiz = new TriviaQuiz();
                triviaQuiz.quizId = gameData.gameId;
                triviaQuiz.players = gameData.players.map(player => new TriviaQuizPlayer(player.playerId, player.score, player.answers));
                triviaQuiz.fetchedQuestions = gameData.questions;
                triviaQuiz.currentRound = gameData.currentRound;
                triviaQuiz.numOfRounds = gameData.numOfRounds;
                triviaQuiz.gameComplete = gameData.gameComplete;
                this.games.set(quizId, triviaQuiz);
                return triviaQuiz;
            } else {
                return undefined;
            }
        }
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;
