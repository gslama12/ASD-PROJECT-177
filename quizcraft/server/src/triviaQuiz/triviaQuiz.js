const TriviaQuestionGenerator = require("./triviaQuestionGenerator");
const TriviaQuestionSettings = require("./triviaQuestionSettings");
const {generateRandomUUID} = require("../utils/randomUtils");


class TriviaQuiz {
    constructor() {
        this.questionSettings = undefined
        this.fetchedQuestions = undefined;
        this.activeQuestion = undefined;
        this.quizId = generateRandomUUID();
        // TODO game status
    }


    async initGameSettings(quizMode, category, difficulty) {
        // Possible values: 1-50. Retrieving multiple questions at once reduces number of API calls we need to make.
        const questionsPerRequest = 50;

        const apiSessionToken = await TriviaQuestionGenerator.getSessionToken();
        if (!apiSessionToken) {
            return false;
        }

        this.questionSettings = new TriviaQuestionSettings(
            quizMode, category, difficulty, apiSessionToken, questionsPerRequest
        );
        return true;
    }

    async initQuestions() {
        const questionsFetched = await this.#fetchQuestions();
        if (!questionsFetched) {
            return false;
        }

        return true
    }

    async getNextQuestion() {
        const questionsLeft = Array.isArray(this.fetchedQuestions) && this.fetchedQuestions.length;
        if (!questionsLeft) {
            const questionsFetched = await this.#fetchQuestions();
            if (!questionsFetched) {
                return false;
            }
        }

        this.activeQuestion = this.fetchedQuestions.shift();
        return this.activeQuestion;
    }

    checkAnswer(userAnswer){
        if (!userAnswer || !this.activeQuestion) {
            return undefined;
        }
        return userAnswer === this.activeQuestion["correct_answer"];
    }

    async #fetchQuestions() {
        try {
            const questions = await TriviaQuestionGenerator.fetchQuestions(this.questionSettings);

            if (questions === undefined) {
                return false;
            }

            this.fetchedQuestions = questions;
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}


async function triviaQuizFactory(gameMode, category, difficulty) {
    const triviaQuiz = new TriviaQuiz(gameMode, category, difficulty);

    const initSettingsSuccess = await triviaQuiz.initGameSettings(gameMode, category, difficulty);
    if (!initSettingsSuccess) {
        return undefined;
    }

    const initQuestionsSuccess = await triviaQuiz.initQuestions();
    if (!initQuestionsSuccess) {
        return undefined;
    }

    return triviaQuiz;
}


module.exports = {
    triviaQuizFactory
}
