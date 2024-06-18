const { GameStats } = require('../models/quizModels');
const {User} = require("../models/userModel");

/**
 * This function retrieves the game statistics for a specific game.
 */
async function getGameStats(gameId) {
    try {
        const gameStats = await GameStats.find({ gameId }).populate('playerId', 'username');
        console.log("Game Stats '${gameId}': ", gameStats);
        return { success: true, gameStats };
    } catch (err) {
        console.error('Error retrieving game stats:', err);
        return { success: false, message: err.message };
    }
}

/**
 * This function retrieves the games played by a specific user.
 */
async function getUserGames(username) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        const userGames = await GameStats.find({ playerId: user._id }).populate('gameId');
        console.log("User: ", username);
        console.log("Games played: ", userGames);
        return { success: true, userGames };
    } catch (err) {
        console.error('Error retrieving user games:', err);
        return { success: false, message: err.message };
    }
}

module.exports = {
    getGameStats,
    getUserGames
};
