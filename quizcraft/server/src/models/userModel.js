const mongoose = require('mongoose');
const { quizScoreSchema } = require('./trackingModel'); // The schema for tracking

/**
 * User schema to manage user data.
 * Includes username, password, and (*NEW*) tracking of quiz scores and attempts.
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    scores: [quizScoreSchema]  // (NEW*) Quiz Data
});

module.exports = mongoose.model("User", userSchema);