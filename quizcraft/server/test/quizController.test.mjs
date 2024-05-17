import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { expect } from 'chai';
import { addGame, updateGame, getGames } from '../src/controllers/quizController.js';
import { Game } from '../src/models/quizModel.js';
import { User } from '../src/models/userModel.js';


/**
 * Quiz Controller Tests
 * It includes tests for adding a new game, updating a game, and fetching games for a user.
 * Mocha, Chai, ECM, mongodb-memory-server, mongoose
 */
describe('Quiz Controller Tests', function() {
    let mongoServer;

    before(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Game.deleteMany({});
    });

    it('should add a new game', async () => {
        const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
        await user.save();

        const gameData = {
            gameId: '1234',
            players: [],
            questions: [],
            currentRound: 0,
            numOfRounds: 10,
            gameComplete: false,
        };

        const result = await addGame(user._id, gameData);
        expect(result.success).to.be.true;
        expect(result.game).to.have.property('gameId', '1234');
    });

    it('should update a game', async () => {
        const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
        await user.save();

        const game = new Game({
            gameId: '1234',
            players: [],
            questions: [],
            currentRound: 0,
            numOfRounds: 10,
            gameComplete: false,
        });
        await game.save();

        user.games.push(game);
        await user.save();

        const gameData = { currentRound: 1 };
        const result = await updateGame(user._id, '1234', gameData);

        expect(result.success).to.be.true;
        expect(result.game).to.have.property('currentRound', 1);
    });

    it('should fetch games for a user', async () => {
        const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123' });
        await user.save();

        const game = new Game({
            gameId: '1234',
            players: [],
            questions: [],
            currentRound: 0,
            numOfRounds: 10,
            gameComplete: false,
        });
        await game.save();

        user.games.push(game);
        await user.save();

        const result = await getGames(user._id);
        expect(result.success).to.be.true;
        expect(result.games).to.have.lengthOf(1);
        expect(result.games[0]).to.have.property('gameId', '1234');
    });
});
