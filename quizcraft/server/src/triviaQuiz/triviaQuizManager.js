const {triviaQuizFactory} = require("./triviaQuiz");
const {generateRandomUUID} = require("../utils/randomUtils");
const TriviaQuizQueueElement = require("./triviaQuizQueueElement");

/**
 * Singleton class to keep track of ongoing matches.
 */
class TriviaQuizManager {
    constructor() {
        if (TriviaQuizManager._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        TriviaQuizManager._instance = this;

        this.games = new Map(); // Map<String, TriviaQuiz>, String = gameId. TODO delete entries after game ended/cancelled.
        this.roomQueue = new Map(); // Map<String, TriviaQuizQueueElement>, String = roomId. Entries deleted after game joined.
    }

    /**
     * @param gameMode {String}
     * @param category {String}
     * @param difficulty {String}
     * @param playerId {String}
     * @returns {Promise<undefined|TriviaQuiz>} Undefined on fail.
     */
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

    /**
     * @param quizId {String}
     * @returns {undefined|TriviaQuiz} Undefined on fail.
     */
    getGame(quizId) {
        if (!quizId) {
            return undefined;
        }

        return this.games.get(quizId);
    }

    /**
     * Check if game with gameId exists, then check if userId is part of game.
     @param gameId {String}
     @param playerId {String}
     * @returns {boolean}
     */
    isPlayerInGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return false;
        }

        for (const player of game.players) {
            if (player.id === playerId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Insert only happens if no waiting players (with matching gameSettings) are found in queue.
     * -> Create a new roomId and join the queue.
     * @param gameSettings {TriviaQuestionSettings}
     * @param playerId {String}
     * @returns {String} roomId
     */
    insertRoomQueueElement(gameSettings, playerId) {
        const roomId = generateRandomUUID();
        const queueElement = new TriviaQuizQueueElement(gameSettings, playerId, roomId)
        this.roomQueue.set(roomId, queueElement);
        return roomId;
    }

    /**
     * @param roomId {String}
     */
    deleteRoomQueueElement(roomId) {
        this.roomQueue.delete(roomId);
    }

    /**
     * Check if another player already joined the queue with the same gameSettings.
     * If that is the case, add playerId and return roomId.
     * @param gameSettings {TriviaQuestionSettings}
     * @param playerId {String}
     * @returns {undefined|string}
     */
    findMatchingPlayerInQueue(gameSettings, playerId) {
        for (const queueElement of this.roomQueue.values()) {
            if (queueElement.isRoomFull()) {
                continue;
            }

            if (queueElement.isEqualGameSettings(gameSettings)) {
                const roomId = queueElement.roomId;
                // Update map
                queueElement.addPlayerId(playerId);
                this.roomQueue.set(roomId, queueElement);
                return roomId;
            }
        }
        return undefined;
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;
