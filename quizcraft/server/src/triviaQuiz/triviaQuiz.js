const TriviaQuestionGenerator = require("./triviaQuestionGenerator");
const TriviaQuestionSettings = require("./triviaQuestionSettings");
const { generateRandomUUID } = require("../utils/randomUtils");
const { Game } = require("../models/quizModel");
const TriviaQuizPlayer = require("./triviaQuizPlayer");

class TriviaQuiz {
    constructor() {
        this.quizId = generateRandomUUID();

        this.questionSettings = undefined;
        this.fetchedQuestions = undefined;
        this.activeQuestion = undefined;
        this.players = undefined; // Can be fully implemented once actual playerIds are passed.

        this.gameComplete = false;
        this.numOfRounds = 10;
        this.currentRound = 0;
    }

    async initGameSettings(quizMode, category, difficulty) {
        const questionsPerRequest = this.numOfRounds;

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
        return true;
    }

    initPlayers(playerIds) {
        this.players = playerIds.map((playerId) => new TriviaQuizPlayer(playerId));
    }

    async getNextQuestion() {
        if (this.activeQuestion !== undefined || this.gameComplete) {
            return false;
        }

        const questionsLeft = Array.isArray(this.fetchedQuestions) && this.fetchedQuestions.length;
        if (!questionsLeft) {
            const questionsFetched = await this.#fetchQuestions();
            if (!questionsFetched) {
                return false;
            }
        }

        this.currentRound += 1;
        this.activeQuestion = this.fetchedQuestions.shift();
        return this.activeQuestion;
    }

    setPlayerAnswer(playerId, answer) {
        if (!answer || !this.activeQuestion || this.gameComplete) {
            return false;
        }

        const player = this.getQuizPlayer(playerId);
        if (player === undefined) {
            console.error(`playerId ${playerId} answered in quizId ${this.quizId} but is not a player of it.`);
            return false;
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

    async evaluateAnswers() {
        if (this.activeQuestion === undefined || this.gameComplete) {
            console.error("Cannot evaluate player answers. No active question is set or game already completed.");
            return undefined;
        }

        for (const player of this.players) {
            const isCorrectAnswer = this.#isAnswerCorrect(player.getAnswer());
            if (isCorrectAnswer) {
                player.increaseScore();
            }
        }

        const roundResults = this.getAllGameData();
        this.#questionComplete();
        roundResults["gameInfo"] = this.#getGameInfo();

        // Save game state to database
        await this.saveGameState();

        return roundResults;
    }

    // Saves the current game state to the database
    // tries to find a game with same id
    // if found, updates the game data with current data
    // if not found create new game in database
    async saveGameState() {
        try {
            const game = await Game.findOne({ gameId: this.quizId });
            if (game) {
                // Update existing game
                game.players = this.players.map(player => ({
                    playerId: player.id,
                    score: player.getScore(),
                    answers: player.answers
                }));
                game.questions = this.fetchedQuestions;
                game.currentRound = this.currentRound;
                game.gameComplete = this.gameComplete;
                await game.save();
            } else {
                // Create new game
                const newGame = new Game({
                    gameId: this.quizId,
                    players: this.players.map(player => ({
                        playerId: player.id,
                        score: player.getScore(),
                        answers: player.answers
                    })),
                    questions: this.fetchedQuestions,
                    currentRound: this.currentRound,
                    numOfRounds: this.numOfRounds,
                    gameComplete: this.gameComplete
                });
                await newGame.save();
            }
        } catch (err) {
            console.error("Error saving game state:", err);
        }
    }

    getAllGameData() {
        const gameData = {
            "gameInfo": this.#getGameInfo(),
            "players": this.#getPlayersInfo(),
        };

        if (this.activeQuestion !== undefined) {
            gameData["question"] = this.activeQuestion;
        }

        return gameData;
    }

    #getGameInfo() {
        return {
            "gameId": this.quizId,
            "gameComplete": this.gameComplete,
            "numOfRounds": this.numOfRounds,
            "currentRound": this.currentRound
        };
    }

    #getPlayersInfo() {
        const playersInfo = [];
        for (const player of this.players) {
            const playerDetails = {
                id: player.id,
                score: player.getScore()
            };

            if (player.answer !== undefined) {
                const isCorrectAnswer = this.#isAnswerCorrect(player.getAnswer());
                playerDetails["answer"] = player.getAnswer();
                playerDetails["isCorrectAnswer"] = isCorrectAnswer;
            }

            playersInfo.push(playerDetails);
        }
        return playersInfo;
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
        return answer === this.activeQuestion["correctAnswer"];
    }

    #questionComplete() {
        this.activeQuestion = undefined;

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
};
