class TriviaQuestionSettings {
    MAX_QUESTION_LIMIT = 50;

    /**
     * @param quizMode {String}
     * @param category {String | undefined}
     * @param difficulty {String | undefined}
     * @param apiSessionToken {String | undefined} Undefined if used as TriviaQuizQueueElement (hacky)
     * @param numberOfRounds {number | undefined} Undefined if used as TriviaQuizQueueElement (hacky)
     * @param challengeType {String} timeattack, liveschallenge,
     */
    constructor(quizMode, category, difficulty, apiSessionToken, numberOfRounds, challengeType = "") {
        this.quizMode = quizMode;
        this.category = category;
        this.difficulty = difficulty;
        this.apiSessionToken = apiSessionToken;
        this.numberOfRounds = numberOfRounds;
        this.challengeType = challengeType; // only relevant for single player

        // This controls how many questions are fetched from the API with a single request.
        this.questionsPerRequest = this.MAX_QUESTION_LIMIT;
        // If there are very specific question settings, reduce that limit.
        if (quizMode === "boolean") {
            // I don't think there are that many boolean questions.
            this.questionsPerRequest = 10;
        }

        if (category && difficulty) {
            // If both category and difficulty are defined, there are not that many questions.
            // Since max number of rounds is set to 20, it should be fine to use an api session token.
            this.questionsPerRequest = 10;
        }
    }
}

module.exports = TriviaQuestionSettings;