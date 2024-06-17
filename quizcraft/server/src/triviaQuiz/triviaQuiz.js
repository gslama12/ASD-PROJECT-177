const TriviaQuestionGenerator = require("./triviaQuestionGenerator");
const TriviaQuestionSettings = require("./triviaQuestionSettings");
const {generateRandomUUID} = require("../utils/randomUtils");
const TriviaQuizPlayer = require("./triviaQuizPlayer");
const { Game, GameStats } = require('../models/quizModels');


class TriviaQuiz {
    constructor(questionGenerator, questionSettings) {
        this.quizId = generateRandomUUID();

        // dependency injection for testing
        this.questionGenerator = questionGenerator || TriviaQuestionGenerator;
        this.questionSettings = questionSettings || TriviaQuestionSettings;

        this.fetchedQuestions = undefined;
        this.activeQuestion = undefined;
        this.players = undefined;

        this.gameComplete = false;
        this.numOfRounds = 10;
        this.currentRound = 0;

        this.correctAnswers = 0; // For tracking
        this.wrongAnswers = 0; // For tracking

        this.questionAnswerHistory = []; // Tracks player answers for each question in detail.
    }

    async initGameSettings(quizMode, category, difficulty, rounds) {
        // Possible values: 1-50. Retrieving multiple questions at once reduces number of API calls we need to make.
        this.numOfRounds = rounds;
        const questionsPerRequest = this.numOfRounds;

        const apiSessionToken = await this.questionGenerator.getSessionToken();
        if (apiSessionToken === undefined) {
            return false;
        }

        this.questionSettings = new TriviaQuestionSettings(
            quizMode, category, difficulty, apiSessionToken, questionsPerRequest
        );

        console.log('Initialized game settings:', this.questionSettings);

        return true;
    }


    async initQuestions() {
        console.log('Fetching questions...');
        const questionsFetched = await this.questionGenerator.fetchQuestions(this.questionSettings);
        if (!questionsFetched) {
            console.error('Failed to fetch questions.');
            return false;
        }
        this.fetchedQuestions = questionsFetched;
        console.log('Questions fetched successfully.');
        return true;
    }

    initPlayers(playerIds) {
        this.players = playerIds.map((playerId) => new TriviaQuizPlayer(playerId));
    }

    async getNextQuestion() {
        if (this.activeQuestion !== undefined || this.gameComplete) {
            // Current question is not answered or game already completed
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

    /**
     * Sets player answer for a game.
     * @param playerId {String}
     * @param answer {String}
     * @return {boolean}
     */
    setPlayerAnswer(playerId, answer) {
        if (!answer || !this.activeQuestion || this.gameComplete) {
            return false;
        }

        const player = this.getQuizPlayer(playerId);
        if (player === undefined) {
            console.error(`playerId ${playerId} answered in quizId ${this.quizId} but is not a player of it.`);
            return false;
        }

        if (player.hasPlayerAnswered()) {
            console.warn(`playerId ${playerId} already answered in quizId ${this.quizId}.`);
            return false;
        }

        player.setAnswer(answer);
        return true;
    }

    /**
     * @param playerId {String}
     * @return {TriviaQuizPlayer | undefined}
     */
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
        if (this.activeQuestion === undefined || this.gameComplete) {
            console.error("Cannot evaluate player answers. No active question is set or game already completed.");
            return undefined;
        }

        for (const player of this.players) {
            const isCorrectAnswer = this.#isAnswerCorrect(player.getAnswer());

            // Store the question, player's answer, and whether it was correct
            this.questionAnswerHistory.push({
                question: this.activeQuestion,
                playerId: player.id,
                answer: player.answer,
                isCorrect: isCorrectAnswer
            });

            // If the player's answer is correct, add the correct answer to the player's details for tracking
            if (isCorrectAnswer) {
                player.increaseScore();
                this.correctAnswers += 1;
            } else {
                this.wrongAnswers += 1;
            }
        }

        const roundResults = this.getAllGameData();
        this.#questionComplete();
        // needed since "gameComplete" is set in #questionComplete (kinda hacky)
        roundResults["gameInfo"] = this.#getGameInfo();

        return roundResults;
    }

    getQuestionAnswerHistory() {
        return this.questionAnswerHistory;
    }

    getAllGameData() {
        const gameData = {
            "gameInfo": this.#getGameInfo(),
            "players": this.#getPlayersInfo(),
            "questionAnswerHistory": this.getQuestionAnswerHistory()
        }

        if (this.activeQuestion !== undefined) {
            gameData["question"] = this.activeQuestion
        }

        return gameData;
    }

    #getGameInfo() {
        return {
            "gameId": this.quizId,
            "gameComplete": this.gameComplete,
            "numOfRounds": this.numOfRounds,
            "currentRound": this.currentRound,
            "correctAnswers": this.correctAnswers,
            "wrongAnswers": this.wrongAnswers
        }
    }

    #getPlayersInfo() {
        const playersInfo = []
        for (const player of this.players) {
            const playerDetails = {
                id: player.id,
                score: player.getScore()
            }

            if (player.answer !== undefined) {
                const isCorrectAnswer = this.#isAnswerCorrect(player.getAnswer())
                playerDetails["answer"] = player.getAnswer();
                playerDetails["isCorrectAnswer"] = isCorrectAnswer;
                // If the player's answer is not correct, add the correct answer to the player's details
                if (!isCorrectAnswer) {
                    playerDetails["correctAnswer"] = this.activeQuestion["correctAnswer"];
                }
            }

            playersInfo.push(playerDetails);
        }
        return playersInfo
    }

    async #fetchQuestions() {
        try {
            console.log('Fetching questions from TriviaQuestionGenerator...');
            const questions = await TriviaQuestionGenerator.fetchQuestions(this.questionSettings);

            if (questions === undefined) {
                console.error('No questions received from TriviaQuestionGenerator.');
                return false;
            }

            this.fetchedQuestions = questions;
            console.log('Questions received:', questions);
            return true;
        } catch (err) {
            console.error('Error fetching questions:', err);
            return false;
        }
    }

    #isAnswerCorrect(answer) {
        return answer === this.activeQuestion["correctAnswer"]
    }

    #questionComplete() {
        this.activeQuestion = undefined;

        for (const player of this.players) {
            player.resetAnswer();
        }

        this.#updateGameFinished();

        // save game data to database
        if (this.gameComplete) {
            this.saveGameStats();
        }
    }

    #updateGameFinished() {
        if (this.currentRound === this.numOfRounds) {
            this.gameComplete = true;
        }
    }

    /**
     *  saves the game statistics to the database.
     *  returns a promise array of game statisitcs
     */
    async saveGameStats() {
        try {
            // Set default values for difficulty and category if they don't exist TODO: HACK
            const gameMode = this.questionSettings.difficulty || 'NOT_SPECIFIED';
            const difficulty = this.questionSettings.difficulty || 'NOT_SPECIFIED';
            const category = this.questionSettings.category || 'NOT_SPECIFIED';


            // console.log("- - - STATS REPORT: - - -");
            //     console.log('quizId:', this.quizId);
            //     console.log('questionGenerator:', this.questionGenerator);
            //     console.log('questionSettings:', this.questionSettings);
            //     console.log('fetchedQuestions:', this.fetchedQuestions);
            //     console.log('activeQuestion:', this.activeQuestion);
            //     console.log('players:', this.players);
            //     console.log('gameComplete:', this.gameComplete);
            //     console.log('numOfRounds:', this.numOfRounds);
            //     console.log('currentRound:', this.currentRound);
            //     console.log('correctAnswers:', this.correctAnswers);
            //     console.log('wrongAnswers:', this.wrongAnswers);
            //     console.log('questionAnswerHistory:', this.questionAnswerHistory);
            // console.log("- - - - - -");


            const gameData = new Game({
                gameMode: gameMode,
                difficulty: difficulty,
                category: category,
                numOfRounds: this.numOfRounds
            });
            const savedGame = await gameData.save();

            const gameStatsData = [];

            for (const player of this.players) {
                const gameStats = new GameStats({
                    gameId: savedGame._id,
                    playerId: player.id,
                    questionsAnsweredCorrect: this.correctAnswers,
                    totalQuestions: this.numOfRounds,
                    questionsAnsweredWrong: this.wrongAnswers
                });

                // console.log("GAME STATS");
                // console.log(gameStats);

                await gameStats.save();
                gameStatsData.push(gameStats);
            }
            console.log('Game stats saved successfully.');

            // Return the game stats data to event
            return gameStatsData;
        } catch (err) {
            console.error('Error saving game stats:', err);
        }
    }
}


async function triviaQuizFactory(gameMode, category, difficulty, playerIds, rounds) {
    // Calling with undefined twice to work with new TriviaQuiz constructor.
    // questionGenerator will be set to singleton class instance
    // questionSettings is set via initGameSettings.
    const triviaQuiz = new TriviaQuiz(undefined, undefined);

    const initSettingsSuccess = await triviaQuiz.initGameSettings(gameMode, category, difficulty, rounds);
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
