const mongoose = require('mongoose');

/**
 * Schema to represent each attempt(turn) a user makes on a question for a quiz.
 * Tracks the question ID, if the answer was correct, the answer given by the user, and the correct answer.
 */
const attemptSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Question'  // This is assuming that there will be a qeustion model that is to be referenced.
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    answerGiven: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    } // WIP
});

/**
 * Schema to track each quiz done by the user.
 * Includes the total score for the quiz and a log of attempts(Array) for each question.
 */
const quizScoreSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz'  // This is assuming that there will be a quiz model that is to be referenced.
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    attempts: [attemptSchema]  // Array of attemptSchema for tracking the questions of a quiz
});

module.exports = { attemptSchema, quizScoreSchema };