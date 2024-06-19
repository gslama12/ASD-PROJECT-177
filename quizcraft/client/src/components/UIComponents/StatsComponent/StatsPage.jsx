import React, { useEffect, useState } from 'react';
import { useUser } from "../../../UserContext";
import "../../../styles/StatsPageStyle.css";

const mockStats = [
    {
        questionsAnsweredCorrect: 7,
        questionsAnsweredWrong: 3,
        gameMode: "standard",
        difficulty: "easy",
        category: "Science",
        numOfRounds: 10,
        createdAt: new Date(),
        startingLives: 3,
        startingTime: null
    },
    {
        questionsAnsweredCorrect: 5,
        questionsAnsweredWrong: 5,
        gameMode: "multiple",
        difficulty: "medium",
        category: "General Knowledge",
        numOfRounds: 10,
        createdAt: new Date(),
        startingLives: null,
        startingTime: 60
    },
];

const StatsPage = ({ socket }) => {
    const { user } = useUser();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("StatsPage component mounted");

        if (user) {
            console.log("Fetching games for user:", user.username);
            socket.emit('quiz-get-user-games', { username: user.username });

            const handleUserGames = (response) => {
                console.log("Received response from 'quiz-get-user-games':", response);
                if (response.data.success && response.data.userGames.length > 0) {
                    console.log("Found Game data to display");
                    const userGames = response.data.userGames.map(game => ({
                        ...game,
                        gameMode: game.gameId.gameMode,
                        difficulty: game.gameId.difficulty,
                        category: game.gameId.category,
                        numOfRounds: game.gameId.numOfRounds,
                        createdAt: game.gameId.createdAt,
                        type: game.gameId.type,
                        startingLives: game.startingLives,
                        startingTime: game.startingTime
                    }));
                    console.log("Processed userGames:", userGames);
                    setStats(userGames);
                } else {
                    console.error("Error fetching games:", response.message);
                    setStats(mockStats); // Use mock data if no real stats available
                }
                setLoading(false);
            };

            socket.on('quiz-get-user-games', handleUserGames);

            return () => {
                console.log("Cleaning up socket event listeners");
                socket.off('quiz-get-user-games', handleUserGames);
            };
        } else {
            console.log("No user logged in, using mock stats.");
            setStats(mockStats);
            setLoading(false);
        }
    }, [user, socket]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!stats || stats.length === 0) {
        return <div>No stats available.</div>;
    }

    const singlePlayerStats = stats.filter(game => game.type === false);
    const multiplayerStats = stats.filter(game => game.type === true);

    const totalSinglePlayerGames = singlePlayerStats.length;
    const totalCorrectAnswers = singlePlayerStats.reduce((sum, game) => sum + game.questionsAnsweredCorrect, 0);
    const totalWrongAnswers = singlePlayerStats.reduce((sum, game) => sum + game.questionsAnsweredWrong, 0);
    const correctWrongRatio = totalCorrectAnswers + totalWrongAnswers ? ((totalCorrectAnswers / (totalCorrectAnswers + totalWrongAnswers)) * 100).toFixed(2) : 0;

    const totalMultiplayerGames = multiplayerStats.length;
    const totalWins = multiplayerStats.filter(game => game.questionsAnsweredCorrect > game.questionsAnsweredWrong).length;
    const totalLosses = totalMultiplayerGames - totalWins;
    const winLossRatio = totalMultiplayerGames ? ((totalWins / totalMultiplayerGames) * 100).toFixed(2) : 0;

    console.log("Rendering stats");

    return (
        <>
            <div className="stats-page">
                <h1 className="stats-header">Your Statistics</h1>
                <div className="stats-content">
                    <div className="stats-summary-container">
                        <div className="stats-summary">
                            <h2>Single-Player</h2>
                            <p>Played Games: {totalSinglePlayerGames}</p>
                            <p>Correct Answers: {totalCorrectAnswers}</p>
                            <p>Wrong Answers: {totalWrongAnswers}</p>
                            <p>Ratio: {correctWrongRatio}%</p>
                        </div>
                        <div className="stats-summary">
                            <h2>Multiplayer</h2>
                            <p>Played Games: {totalMultiplayerGames}</p>
                            <p>Won Games: {totalWins}</p>
                            <p>Lost Games: {totalLosses}</p>
                            <p>Win/Loss Ratio: {winLossRatio}%</p>
                        </div>
                    </div>
                    <h2 className="history-header">History of Last 10 Games</h2>
                    <div className="game-history">
                        {stats.map((game, index) => (
                            <div key={index} className={`game-result ${game.questionsAnsweredCorrect > game.questionsAnsweredWrong ? 'win' : 'loss'}`}>
                                <p>Game #{index + 1}</p>
                                <p>Mode: {game.gameMode}</p>
                                <p>Category: {game.category}</p>
                                <p>Difficulty: {game.difficulty}</p>
                                <p>Type: {game.type ? 'Multiplayer' : 'Single-Player'}</p>
                                <p>Questions Correct: {game.questionsAnsweredCorrect}</p>
                                <p>Questions Wrong: {game.questionsAnsweredWrong}</p>
                                {game.startingLives !== null && (
                                    <p>Starting Lives: {game.startingLives}</p>
                                )}
                                {game.startingTime !== null && (
                                    <p>Starting Time: {game.startingTime} seconds</p>
                                )}
                                {game.type && (
                                    <p>Result: {game.questionsAnsweredCorrect > game.questionsAnsweredWrong ? 'Win' : 'Lose'}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatsPage;
