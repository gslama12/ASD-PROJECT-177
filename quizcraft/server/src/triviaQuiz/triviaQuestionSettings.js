class TriviaQuestionSettings {
    MAX_QUESTION_LIMIT = 50;
    DEFAULT_NUM_QUESTIONS = 5;

    /**
     * @param quizMode {String}
     * @param category {String | undefined}
     * @param difficulty {String | undefined}
     * @param apiSessionToken {String | undefined} Undefined if used as TriviaQuizQueueElement (hacky)
     * @param questionsPerRequest {number | undefined} Undefined if used as TriviaQuizQueueElement (hacky)
     */
    constructor(quizMode, category, difficulty, apiSessionToken, questionsPerRequest, challengeType = "") {
        this.quizMode = quizMode;
        this.category = category;
        this.difficulty = difficulty;
        this.apiSessionToken = apiSessionToken;
        this.challengeType = challengeType;

        // let numQuestions = questionsPerRequest;
        // numQuestions =  numQuestions <= this.MAX_QUESTION_LIMIT ? numQuestions : this.MAX_QUESTION_LIMIT;
        // numQuestions = numQuestions > 0 ? numQuestions : this.DEFAULT_NUM_QUESTIONS;
        //
        // this.questionsPerRequest = numQuestions;
        this.questionsPerRequest = 50; // just set it to 50 for now.
    }
}

module.exports = TriviaQuestionSettings;