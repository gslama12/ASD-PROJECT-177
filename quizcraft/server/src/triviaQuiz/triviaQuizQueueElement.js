const {generateRandomUUID} = require("../utils/randomUtils");

class TriviaQuizQueueElement {
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

        return true;
    }

    addPlayerId(playerId) {
        this.playerIds.push(playerId);
        if (this.playerIds.length === this.maxRoomSize) {
            this.setRoomFull();
        }
    }

    setRoomFull() {
        this.roomFull = true;
    }

    isRoomFull() {
        return this.roomFull;
    }
}

module.exports = TriviaQuizQueueElement;