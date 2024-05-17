const mongoose = require('mongoose');
const { gameSchema } = require('./quizModel');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    games: [gameSchema] // stores game data/history
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
