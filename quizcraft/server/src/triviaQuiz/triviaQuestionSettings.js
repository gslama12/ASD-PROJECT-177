class TriviaQuestionSettings {
    MAX_QUESTION_LIMIT = 50;
    DEFAULT_NUM_QUESTIONS = 5;

    constructor(quizMode, category, difficulty, apiSessionToken, questionsPerRequest) {
        this.quizMode = quizMode;
        this.category = category;
        this.difficulty = difficulty;
        this.apiSessionToken = apiSessionToken;

        let numQuestions = questionsPerRequest;
        numQuestions =  numQuestions <= this.MAX_QUESTION_LIMIT ? numQuestions : this.MAX_QUESTION_LIMIT;
        numQuestions = numQuestions > 0 ? numQuestions : this.DEFAULT_NUM_QUESTIONS;

        this.questionsPerRequest = numQuestions;
    }
}

module.exports = TriviaQuestionSettings;