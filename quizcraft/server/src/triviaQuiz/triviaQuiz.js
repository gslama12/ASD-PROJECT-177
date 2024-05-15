const TriviaQuestionGenerator = require("./triviaQuestionGenerator");
const TriviaQuestionSettings = require("./triviaQuestionSettings");
const {generateRandomUUID} = require("../utils/randomUtils");
const TriviaQuizPlayer = require("./triviaQuizPlayer");


class TriviaQuiz {
    constructor() {
        this.quizId = generateRandomUUID();

        this.questionSettings = undefined
        this.fetchedQuestions = undefined;
        this.activeQuestion = undefined;
        this.players = undefined // Can be fully implemented once actual playerIds are passed.

        this.gameComplete = false;
        this.numOfRounds = 10;
        this.currentRound = 1;
    }


    async initGameSettings(quizMode, category, difficulty) {
        // Possible values: 1-50. Retrieving multiple questions at once reduces number of API calls we need to make.
        const questionsPerRequest = this.numOfRounds +1;

        const apiSessionToken = await TriviaQuestionGenerator.getSessionToken();
        if (apiSessionToken === undefined) {
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

    initPlayers(playerIds) {
        this.players = playerIds.map((playerId) => new TriviaQuizPlayer(playerId));
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

    setPlayerAnswer(playerId, answer){
        if (!answer || !this.activeQuestion) {
            return false;
        }

        const player = this.getQuizPlayer(playerId);
        if (player === undefined) {
            console.error(`playerId ${playerId} answered in quizId ${this.quizId} but is not a player of it.`)
            return false
        }

        player.setAnswer(answer);
        return true;
    }

    getQuizPlayer(playerId) {
        return this.players.find(player => player.id === playerId);
    }


    allPlayersAnswered() {
        for (const player of this.players) {
            if (player.answer === undefined) {
                return false;
            }
        }
        return true;
    }

    evaluateAnswers() {
        if (this.activeQuestion === undefined) {
            console.error("Cannot evaluate player answers. No active question is set.");
            return undefined;
        }

        const playerAnswers = []
        for (const player of this.players) {
            const isCorrectAnswer = this.#isAnswerCorrect(player.getAnswer())
            if (isCorrectAnswer) {
                player.increaseScore();
            }

            const playerDetails = {
                id: player.id,
                answer: player.getAnswer(),
                isCorrectAnswer: isCorrectAnswer,
                score: player.getScore()
            }
            playerAnswers.push(playerDetails);
        }

        const roundResults =  {
            "correctAnswer": this.activeQuestion["correct_answer"],
            "playerAnswers": playerAnswers,
            "gameFinished": this.gameComplete
        };

        this.#questionComplete();
        return roundResults
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

    #isAnswerCorrect(answer) {
        return answer === this.activeQuestion["correct_answer"]
    }

    #questionComplete() {
        this.activeQuestion = undefined;
        this.currentRound += 1;

        for (const player of this.players) {
            player.resetAnswer();
        }

        this.#updateGameFinished();
    }

    #updateGameFinished() {
        if (this.currentRound === this.numOfRounds) {
            this.gameComplete = true;
        }
    }
}


async function triviaQuizFactory(gameMode, category, difficulty, playerIds) {
    const triviaQuiz = new TriviaQuiz(gameMode, category, difficulty);

    const initSettingsSuccess = await triviaQuiz.initGameSettings(gameMode, category, difficulty);
    if (!initSettingsSuccess) {
        return undefined;
    }

    const initQuestionsSuccess = await triviaQuiz.initQuestions();
    if (!initQuestionsSuccess) {
        return undefined;
    }

    triviaQuiz.initPlayers(playerIds);

    return triviaQuiz;
}


module.exports = {
    triviaQuizFactory
}
