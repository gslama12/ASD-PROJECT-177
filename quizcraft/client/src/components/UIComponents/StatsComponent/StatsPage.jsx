import React, { useEffect, useState } from 'react';
import { useUser } from "../../../UserContext";
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';
import "../../../styles/StatsPageStyle.css";

const mockStats = [
    {
        questionsAnsweredCorrect: 7,
        questionsAnsweredWrong: 3,
        gameMode: "Quiz",
        difficulty: "Easy",
        category: "General Knowledge"
    },
    {
        questionsAnsweredCorrect: 5,
        questionsAnsweredWrong: 5,
        gameMode: "Trivia",
        difficulty: "Medium",
        category: "Science"
    },
    {
        questionsAnsweredCorrect: 4,
        questionsAnsweredWrong: 6,
        gameMode: "Trivia",
        difficulty: "Hard",
        category: "Science"
    },
    // Add more mock data as needed
];

const StatsPage = ({ socket }) => {
    const { user } = useUser();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            socket.emit('quiz-get-user-games', { username: user.username });

            socket.on('quiz-get-user-games', (response) => {
                if (response.success && response.data.userGames.length > 0) {
                    setStats(response.data.userGames);
                } else {
                    console.error(response.message);
                    setStats(mockStats); // Use mock data if no real stats available
                }
                setLoading(false);
            });

            return () => {
                socket.off('quiz-get-user-games');
            };
        } else {
            // Use mock data if no user is logged in
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

    return (
        <>
            <div className="top-bar">
                <div className="profile-icon-container">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="profile-dropdown-toggle">
                            <img src={profileIcon} alt="Profile" className="profile-icon" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.ItemText className="dropdown-username">{user ? user.username : "Guest"}</Dropdown.ItemText>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/home">Home</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/stats">Stats</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/login">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="stats-page">
                <h1 className="stats-header">Your Playing Statistic</h1>
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
