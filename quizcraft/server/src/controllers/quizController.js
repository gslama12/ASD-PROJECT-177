const { User } = require('../models/userModel');
const { Game } = require('../models/quizModel');

// add a new game
async function addGame(userId, gameData) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }
        const newGame = new Game(gameData);
        await newGame.save();
        user.games.push(newGame);
        await user.save();
        return { success: true, game: newGame };
    } catch (error) {
        console.error('Error adding game:', error.message);
        return { success: false, message: error.message };
    }
}

// update game data
async function updateGame(userId, gameId, gameData) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }
        const game = await Game.findOneAndUpdate({ gameId: gameId }, gameData, { new: true });
        if (!game) {
            return { success: false, message: "Game not found" };
        }
        return { success: true, game };
    } catch (error) {
        console.error('Error updating game:', error.message);
        return { success: false, message: error.message };
    }
}

// fetch game data
async function getGames(userId) {
    try {
        const user = await User.findById(userId).populate('games');
        if (!user) {
            return { success: false, message: "User not found" };
        }
        return { success: true, games: user.games };
    } catch (error) {
        console.error('Error fetching games:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = {
    addGame,
    updateGame,
    getGames
};
