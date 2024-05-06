const {parse} = require("nodemon/lib/cli");
TRIVIA_API_BASE_URL = "https://opentdb.com";

/**
 * Singleton class with the sole purpose of providing the Trivia API options.
 * Having
 */
class TriviaApiOptions {
    constructor() {
        if (TriviaApiOptions._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        TriviaApiOptions._instance = this;

        // Filtered categories
        this.categories = undefined;
    }

    async init() {
        if (!this.categories === undefined) {
            return;
        }
        const allCategories = await this.#getAllCategories();
        const questionCount = await this.#getQuestionCount();
        if (allCategories === undefined || questionCount === undefined) {
            return;
        }
        this.categories = filterCategories(allCategories, questionCount);
    }

    async #getAllCategories() {
        try {
            // This should always succeed, unless the Trivia API server is down.
            const response = await fetch(`${TRIVIA_API_BASE_URL}/api_category.php`);
            if (response.ok) {
                const body = await response.json();
                return body;
            }
            return undefined;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    async #getQuestionCount() {
        try {
            // This should always succeed, unless the Trivia API server is down.
            const response = await fetch(`${TRIVIA_API_BASE_URL}/api_count_global.php`);
            if (response.ok) {
                const body = await response.json();
                return body;
            }
            return undefined;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }
}

async function getTriviaApiOptions() {
    if (triviaApiOptions.categories === undefined) {
        await triviaApiOptions.init();
    }

    const quizTypes = ["boolean", "multiple"]
    const categories = triviaApiOptions.categories;
    const difficultyOptions = ["easy", "normal", "hard"];
    return {
        "quizTypes": quizTypes,
        "categories": categories,
        "difficultyOptions": difficultyOptions
    }
}

function filterCategories(allCategories, questionCount) {
    const questionCountArray = Object.entries(questionCount.categories);
    const filteredCategoriesTemp = questionCountArray.filter(([key, value]) => value["total_num_of_verified_questions"] >= 100)
    const filteredCategories = [];

    for ([key, value] of filteredCategoriesTemp) {
        const categoryId = parseInt(key)
        const categoryInfo = allCategories["trivia_categories"].find(category => category.id === categoryId)
        const categoryCombined = {
            "id": categoryId,
            "name": categoryInfo["name"],
            "question_count": value["total_num_of_verified_questions"]
        }
        filteredCategories.push(categoryCombined);
    }
    return filteredCategories;
}


const triviaApiOptions = new TriviaApiOptions();

module.exports = getTriviaApiOptions;
