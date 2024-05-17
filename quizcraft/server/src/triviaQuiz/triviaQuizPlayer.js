class TriviaQuizPlayer {
    constructor(playerId) {
        this.id = playerId;
        this.answer = undefined;
        this.score = 0;
    }

    resetAnswer() {
        this.answer = undefined;
    }

    getAnswer() {
        return this.answer;
    }

    setAnswer(answer) {
        this.answer = answer;
    }

    increaseScore() {
        this.score += 1;
    }

    getScore() {
        return this.score;
    }

}

module.exports = TriviaQuizPlayer;