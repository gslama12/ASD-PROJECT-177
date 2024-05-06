const {shuffleArrayInPlace} = require("../utils/arrayUtils");
const getTriviaApiOptions = require("./triviaApiOptions");

TRIVIA_API_BASE_URL = "https://opentdb.com";

// number of questions for a category https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE
// number of questions: https://opentdb.com/api_count_global.php

class TriviaApi {
    // TODO Support TriviaAPI response codes.
    constructor(quizType, category, difficulty) {
        // Possible values: 1-50. Retrieving multiple questions at once reduces number of API calls we need to make.
        this.questionsPerRequests = 50;
        this.apiSessionToken = undefined;

        // To get questions from any type, category or difficulty, don't specify the respective field.
        // E.g. If category is undefined, questions from any category are used.
        this.quizType = quizType;
        this.category = category;
        this.difficulty = difficulty;

        this.fetchedQuestions = undefined;
        this.activeQuestion = undefined;
    }

    async init() {
        this.apiSessionToken = await getTriviaApiSessionToken();
        if (!this.apiSessionToken) {
            return false;
        }

        this.fetchedQuestions = await this.#fetchQuestions();
        if (!this.fetchedQuestions) {
            return false;
        }

        return true;
    }

    async getNextQuestion() {
        let questionsLeft = Array.isArray(this.fetchedQuestions) && this.fetchedQuestions.length
        if (!questionsLeft) {
            this.fetchedQuestions = await this.#fetchQuestions();
            if (!this.fetchedQuestions) {
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
        let api_url = `${TRIVIA_API_BASE_URL}/api.php?amount=${this.questionsPerRequests}`;
        if (this.quizType) {
            api_url = `${api_url}&type=${this.quizType}`;
        }
        if (this.category) {
            api_url = `${api_url}&category=${this.category}`;
        }
        if (this.difficulty) {
            api_url = `${api_url}&difficulty=${this.difficulty}`;
        }
        if (this.apiSessionToken) {
            api_url = `${api_url}&token=${this.apiSessionToken}`;
        }

        try {
            const response = await fetch(api_url);
            const responseBody = await response.json();

            if (response.ok) {
                const questions = responseBody["results"].map((item) => {
                    // Replace incorrect_answers with answers and shuffle the answers.
                    const newObject = {
                        ...item,
                        answers:[...item["incorrect_answers"], item["correct_answer"]]
                    };
                    delete newObject["incorrect_answers"];
                    shuffleArrayInPlace(newObject["answers"]);
                    return newObject;
                });
                return questions;
            }

            // TODO handle response codes
            const responseCode = responseBody["response_code"];
            // Fetch fails if Trivia API is called twice within 5 seconds by the same IP address.
            // Fetch also fails if this.questionsPerRequests is higher than the number of "new" question left on server.

            return undefined;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }
}


async function triviaApiFactory(quizType, category, difficulty) {
    const triviaApi = new TriviaApi(quizType, category, difficulty);
    await triviaApi.init()
    return triviaApi;
}


async function getTriviaApiSessionToken() {
    try {
        // This should always succeed, unless the Trivia API server is down.
        const response = await fetch(`${TRIVIA_API_BASE_URL}/api_token.php?command=request`);
        if (response.ok) {
            const data = await response.json();
            return data.token;
        }
        return undefined;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

// async function test() {
//     console.log(await TriviaApi.getTriviaApiOptions());
//
//     // const categories = await getTriviaApiOptions()
//
//     // console.log(categories);
//     //     // console.log(await getTriviaApiOptions());
//     //     const triviaApi = await triviaApiFactory("multiple");
//     //     for (let i = 0; i < 7; i++) {
//     //         const nextQuestion = await triviaApi.getNextQuestion();
//     //         // console.log(nextQuestion);
//     //         // const answer = nextQuestion["answers"][0];
//     //         // console.log(`Answer '${answer}' is ${triviaApi.checkAnswer(answer)}`)
// }
//
// test()


module.exports = {
    triviaApiFactory
}
