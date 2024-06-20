class TriviaQuizQueueElement {
    /**
     * @param gameSettings {TriviaQuestionSettings}
     * @param playerId {String}
     * @param roomId {String}
     */
    constructor(gameSettings, playerId, roomId) {
        if (!gameSettings || !gameSettings?.quizMode || !playerId) {
            console.error("Must call TriviaQuizQueueElement with TriviaQuestionSettings object and playerId.")
            return;
        }

        this.gameSettings = gameSettings; // has apiSessionToken set to undefined. We don't have that information.
        this.playerIds = [playerId];
        this.roomId = roomId; // roomId stored to make life easier
        this.roomFull = false;
        this.maxRoomSize = 2;

        this.playersReadyToStartGame = []; // list[playerId]
        this.allPlayersReady = false;
    }

    isEqualGameSettings(gameSettings) {
        if (this.gameSettings.quizMode !== gameSettings?.quizMode) {
            return false;
        }
        else if (this.gameSettings.category !== gameSettings?.category) {
            // Category is not used
            return false;
        }
        else if (this.gameSettings.difficulty !== gameSettings?.difficulty) {
            // Difficulty is not used (?)
            return false;
        }
        else if (this.gameSettings.questionsPerRequest !== gameSettings?.questionsPerRequest) {
            return false;
        }

        return true;
    }

    /**
     * Player joins queue. (JOIN_MULTIPLAYER_QUEUE event)
     * @param playerId {String}
     * @return {boolean}
     */
    addPlayerId(playerId) {
        if (this.playerIds.includes(playerId)) {
            console.warn(`Player ${playerId} already joined the queue ${this.roomId}.`)
            return false;
        }

        this.playerIds.push(playerId);
        if (this.playerIds.length === this.maxRoomSize) {
            this.setRoomFull();
        }

        return true;
    }

    setRoomFull() {
        this.roomFull = true;
    }

    isRoomFull() {
        return this.roomFull;
    }

    /**
     * Player is ready to actually start the multiplayer game. (NEW_MULTIPLAYER_GAME event)
     * @param playerId {String}
     * @return {boolean}
     */
    addPlayerReadyToStartGame(playerId) {
        if (!this.playerIds.includes(playerId)) {
            console.warn(`Player ${playerId} is ready to start game in roomId ${this.roomId} but isn't part of it.`)
            return false;
        }

        if (this.playersReadyToStartGame.includes(playerId)) {
            console.warn(`Player ${playerId} already ready to start game in roomId ${this.roomId}.`)
            return false;
        }

        this.playersReadyToStartGame.push(playerId);

        if (this.playerIds.length === this.playersReadyToStartGame.length) {
            this.allPlayersReady = true;
        }

        return true;
    }

    canStartGame() {
        return this.allPlayersReady;
    }

    getPlayerIds() {
        return this.playerIds;
    }
}

module.exports = TriviaQuizQueueElement;