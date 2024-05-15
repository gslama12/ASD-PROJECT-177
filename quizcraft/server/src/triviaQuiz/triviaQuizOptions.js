TRIVIA_API_BASE_URL = "https://opentdb.com";

/**
 * Singleton class with the sole purpose of providing the Trivia API options.
 */
class TriviaQuizOptions {

    static #instance;

    constructor() {
        if (TriviaQuizOptions.#instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        TriviaQuizOptions.#instance = this;

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

async function getTriviaQuizOptions() {
    if (triviaQuizOptions.categories === undefined) {
        await triviaQuizOptions.init();
    }

    const gameModes = [
        {"id": 1, "name": "multiple"},
        {"id": 2, "name": "boolean"}
    ]
    const categories = triviaQuizOptions.categories;
    const difficulties = [
        {"id": 1, "name": "easy"},
        {"id": 2, "name": "normal"},
        {"id": 3, "name": "hard"}
    ];
    return {
        "gameModes": gameModes,
        "categories": categories,
        "difficulties": difficulties
    }
}

/**
 * Filter categories in that only those with insufficient questions are removed.
 * @param allCategories Array of category objects. Only needed because it has category IDs.
 * @param questionCount Array of category objects with question count. Doesn't include category ID.
 * @returns {*[]} Array of objects of structure {id, name, questionCount}
 */
function filterCategories(allCategories, questionCount) {
    const minimumNumOfQuestions = 100

    const questionCountArray = Object.entries(questionCount.categories);
    const filteredCategoriesTemp = questionCountArray.filter(([key, value]) => {
        return value["total_num_of_verified_questions"] >= minimumNumOfQuestions
    })
    const filteredCategories = [];

    for ([key, value] of filteredCategoriesTemp) {
        const categoryId = parseInt(key)
        const categoryInfo = allCategories["trivia_categories"].find(category => category.id === categoryId)
        const categoryCombined = {
            "id": categoryId,
            "name": categoryInfo["name"],
            "questionCount": value["total_num_of_verified_questions"]
        }
        filteredCategories.push(categoryCombined);
    }
    return filteredCategories;
}

// This is only run once
const triviaQuizOptions = new TriviaQuizOptions();

module.exports = getTriviaQuizOptions;
