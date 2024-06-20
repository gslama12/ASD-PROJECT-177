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
     * @param rounds {String}
     * @returns {Promise<undefined|TriviaQuiz>} Undefined on fail.
     */
    async createSinglePlayerGame(gameMode, category, difficulty, playerId, rounds) {
        return await this.createQuizObject(gameMode, category, difficulty, [playerId], rounds, false)
    }

    /**
     * Creates a multiplayer game using the configuration defined in queueElement.
     * @param queueElement {TriviaQuizQueueElement}
     * @param roomId {String}
     * @param rounds
     * @returns {Promise<undefined|TriviaQuiz>} Undefined on fail.
     */
    async createMultiplayerGame(queueElement, roomId, rounds) {
        if (!queueElement || !queueElement?.gameSettings) {
            console.warn("queueElement or queueElement.gameSettings are undefined.")
            return undefined;
        }

        const gameMode = queueElement.gameSettings.quizMode;
        const category = queueElement.gameSettings.category;
        const difficulty = queueElement.gameSettings.difficulty;
        const playerIds = queueElement.playerIds;

        const quizObject =  await this.createQuizObject(gameMode, category, difficulty, playerIds, rounds, true);
        if (!quizObject) {
            return undefined;
        }

        this.deleteRoomQueueElement(roomId);
        return quizObject;
    }

    async createQuizObject(gameMode, category, difficulty, playerIds, rounds, type){
        try {
            const triviaQuiz = await triviaQuizFactory(gameMode, category, difficulty, playerIds, rounds, type);
            if (triviaQuiz === undefined) {
                console.error("Couldn't create quiz.")
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
     * Remove queue element after the multiplayer game was added.
     * @param roomId {String}
     */
    deleteRoomQueueElement(roomId) {
        if(!this.roomQueue.delete(roomId)) {
            console.error(`Tried to remove roomId '${roomId}' from the queue, but it isn't a key of queue.`);
        } else {
            console.info(`Deleted roomId '${roomId}' from the queue.`);
        }
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
                const wasPlayerAdded = queueElement.addPlayerId(playerId);
                if (!wasPlayerAdded) {
                    return undefined;
                }

                // Update map
                const roomId = queueElement.roomId;
                this.roomQueue.set(roomId, queueElement);
                return roomId;
            }
        }
        return undefined;
    }

    /**
     * @param roomId {String}
     * @return {undefined|TriviaQuizQueueElement}
     */
    getQueueElement(roomId) {
        const queueElement = this.roomQueue.get(roomId);
        if (!queueElement) {
            console.warn(`roomId ${roomId} doesn't exist`);
            return undefined;
        }
        return queueElement;
    }


    /**
     *
     * @param queueElement
     * @param playerId
     * @return {boolean}
     */
    joinMultiplayerGame(queueElement, playerId) {
        if (!queueElement) {
            return false;
        }

        return queueElement.addPlayerReadyToStartGame(playerId);
    }
}

// This is only run once
const triviaQuizManager = new TriviaQuizManager();

module.exports = triviaQuizManager;
