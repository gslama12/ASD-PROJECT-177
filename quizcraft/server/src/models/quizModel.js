const mongoose = require('mongoose');

/**
 * Quiz schema to represent a quiz.
 * Includes a title, description, and an array of questions.
 * PLACEHOLDER!!!!!!!!!!
 * quizId not implemented yet!!! check trackingModel.js
 */
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Quiz title is required"],
        unique: true  // Assuming each quiz title should be unique ¯\_(ツ)_/¯
    },
    description: {
        type: String,
        required: false  // This is optional
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'  // References to the Question model
    }]
});

module.exports = mongoose.model("Quiz", quizSchema);