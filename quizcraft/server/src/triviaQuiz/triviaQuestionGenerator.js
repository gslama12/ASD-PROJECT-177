const {shuffleArrayInPlace} = require("../utils/arrayUtils");
const ApiRateLimiter = require("./apiRateLimiter");

// number of questions for a category https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE
// number of questions: https://opentdb.com/api_count_global.php

class TriviaQuestionGenerator {
    static REQUEST_QUESTION_LIMIT = 50;
    static TRIVIA_API_BASE_URL = "https://opentdb.com";

    static async fetchQuestions(questionSettings) {
        // To get questions from any type, category or difficulty, don't specify the respective parameter.
        // E.g. If category is undefined, questions from any category are used.

        let numQuestions = questionSettings.questionsPerRequest
        numQuestions = numQuestions <= this.REQUEST_QUESTION_LIMIT ? numQuestions : this.REQUEST_QUESTION_LIMIT;
        numQuestions = numQuestions > 0 ? numQuestions : 5;

        let api_url = `${this.TRIVIA_API_BASE_URL}/api.php?amount=${numQuestions}`;
        if (questionSettings.quizMode) {
            api_url = `${api_url}&type=${questionSettings.quizMode}`;
        }
        if (questionSettings.category) {
            api_url = `${api_url}&category=${questionSettings.category}`;
        }
        if (questionSettings.difficulty) {
            api_url = `${api_url}&difficulty=${questionSettings.difficulty}`;
        }
        if (questionSettings.apiSessionToken) {
            api_url = `${api_url}&token=${questionSettings.apiSessionToken}`;
        }

        console.log('Fetching questions with URL:', api_url);

        try {
            let response;
            // While loop may not be a clean approach, but it works. However, there is no way to cancel it.
            while (true) {
                // Use mutex to prevent race conditions
                response = await ApiRateLimiter.mutex.runExclusive(async () => {
                    if (ApiRateLimiter.canMakeApiCall()) {
                        const responseTemp = await fetch(api_url);
                        ApiRateLimiter.updateLastApiCallTimeStamp();
                        return responseTemp;
                    } else {
                        return undefined;
                    }
                });

                if (response) {
                    break;
                }

                // Wait a second and try again
                console.log(`Cannot make multiple API requests within ${ApiRateLimiter.timeBetweenApiCalls} seconds. Time since last API call: ${Date.now() - ApiRateLimiter.lastApiCallTimestamp} - let's try again in a second.`)
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            const responseBody = await response.json();

            console.log('API response:', responseBody);

            if (response.ok) {
                const questions = responseBody["results"].map((item) => {
                    // Replace incorrect_answers with answers
                    const newObject = {
                        ...item,
                        answers: [...item["incorrect_answers"], item["correct_answer"]],
                        correctAnswer: item["correct_answer"]
                    };
                    delete newObject["incorrect_answers"];
                    delete newObject["correct_answer"];
                    return newObject;
                });
                shuffleArrayInPlace(questions)
                return questions;
            }

            // TODO handle error response codes
            const responseCode = responseBody["response_code"];
            // Fetch fails if Trivia API is called twice within 5 seconds by the same IP address.
            // Fetch also fails if this.questionsPerRequests is higher than the number of "new" question left on server.
            console.error('Trivia API error, response code:', responseCode);

            return undefined;
        } catch (err) {
            console.error('Error fetching questions:', err);
            return undefined;
        }
    }

    static async getSessionToken() {
        try {
            // This should always succeed, unless the Trivia API server is down.
            const response = await fetch(`${this.TRIVIA_API_BASE_URL}/api_token.php?command=request`);
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
}

module.exports = TriviaQuestionGenerator