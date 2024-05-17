const mongoose = require('mongoose');

// Player Schema
const playerSchema = new mongoose.Schema({
    playerId: String,
    score: { type: Number, default: 0 },
    answers: [{
        question: String,
        answer: String,
        correctAnswer: String,
        isCorrect: Boolean
    }]
});

// Question Schema
const questionSchema = new mongoose.Schema({
    questionId: String,
    question: String,
    correctAnswer: String,
    options: [String]
});

// Game Schema
const gameSchema = new mongoose.Schema({
    gameId: String,
    players: [playerSchema],
    questions: [questionSchema],
    currentRound: { type: Number, default: 0 },
    numOfRounds: { type: Number, default: 10 },
    gameComplete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = { Game, gameSchema };
