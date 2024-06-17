import React, { useEffect, useState } from 'react';
import { useUser } from "../../../UserContext";
import "../../../styles/StatsPageStyle.css";

const mockStats = [
    {
        questionsAnsweredCorrect: 7,
        questionsAnsweredWrong: 3,
        gameMode: "multiple",
        difficulty: "easy",
        category: "Science",
        numOfRounds: 10,
        createdAt: new Date()
    },
    {
        questionsAnsweredCorrect: 5,
        questionsAnsweredWrong: 5,
        gameMode: "multiple",
        difficulty: "medium",
        category: "General Knowledge",
        numOfRounds: 10,
        createdAt: new Date()
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
                        gameMode: game.gameId.gameMode === 'NOT_SPECIFIED' ? 'Trivia' : game.gameId.gameMode,
                        difficulty: game.gameId.difficulty === 'NOT_SPECIFIED' ? 'Trivia' : game.gameId.difficulty,
                        category: game.gameId.category === 'NOT_SPECIFIED' ? 'Trivia' : game.gameId.category,
                        numOfRounds: game.gameId.numOfRounds,
                        createdAt: game.gameId.createdAt,
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
            // Use mock data if no user is logged in
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

    const totalGames = stats.length;
    const totalWins = stats.filter(game => game.questionsAnsweredCorrect > game.questionsAnsweredWrong).length;
    const totalLosses = totalGames - totalWins;
    const winRatio = totalGames ? ((totalWins / totalGames) * 100).toFixed(2) : 0;

    console.log("Rendering stats");

    return (
        <>
            <div className="stats-page">
                <h1 className="stats-header">Your Statistics</h1>
                <div className="stats-content">
                    <div className="stats-summary">
                        <p>Played Games: {totalGames}</p>
                        <p>Won Games: {totalWins}</p>
                        <p>Lost Games: {totalLosses}</p>
                        <p>Win Ratio: {winRatio}%</p>
                    </div>
                    <h2 className="history-header">History of Last 10 Games</h2>
                    <div className="game-history">
                        {stats.map((game, index) => (
                            <div key={index} className={`game-result ${game.questionsAnsweredCorrect > game.questionsAnsweredWrong ? 'win' : 'loss'}`}>
                                <p>Game #{index + 1}</p>
                                <p>Mode: {game.gameMode}</p>
                                <p>Category: {game.category}</p>
                                <p>Difficulty: {game.difficulty}</p>
                                <p>Questions Correct: {game.questionsAnsweredCorrect}</p>
                                <p>Questions Wrong: {game.questionsAnsweredWrong}</p>
                                <p>Result: {game.questionsAnsweredCorrect > game.questionsAnsweredWrong ? 'Win' : 'Lose'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatsPage;
