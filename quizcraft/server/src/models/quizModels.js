const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema for the game model
 */
const gameSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    gameMode: { type: String, required: true },
    difficulty: { type: String, required: true },
    category: { type: String, required: true },
    numOfRounds: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now } // Automatically set to the current date
});

/**
 * Schema for the game stats model
 */
const gameStatsSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionsAnsweredCorrect: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    questionsAnsweredWrong: { type: Number, required: true }
});

const Game = mongoose.model('Game', gameSchema);
const GameStats = mongoose.model('GameStats', gameStatsSchema);

module.exports = { Game, GameStats };
