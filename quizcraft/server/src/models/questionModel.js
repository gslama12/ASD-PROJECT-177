const mongoose = require('mongoose');

/**
 * Question schema to store question data for quizzes.
 * Tracks the question text, correct answer, and multiple choice options.
 * PLACEHOLDER!!!!!!!!!!
 * questionId not implemented yet!!! check trackingModel.js
 */
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Question text is required"]
    },
    correctAnswer: {
        type: String,
        required: [true, "Correct answer is required"]
    },
    options: [String]  // Array of options for multiple choice question
    /**
     * Example for Multible Choice Question:
     * text: "What is the capital of France?",
     * correctAnswer: "Paris",
     * options: ["Paris", "London", "Berlin", "Madrid"]
     */
});

module.exports = mongoose.model("Question", questionSchema);