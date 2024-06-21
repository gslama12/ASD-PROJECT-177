import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../../styles/CommonStyles.css";
import { useUser } from "../../../UserContext.jsx";
import QuestionAnswerComponent from './QuestionAnswerComponent'; // Import the new component

function ChallengeModeComponent({ socket }) {
    const { challengeType } = useParams();
    const location = useLocation();
    const [questionData, setQuestionData] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [lives, setLives] = useState(3);
    const [notDone, setNotDone] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // default time for time-attack mode
    const navigate = useNavigate();
    // const [challengeSettings, setChallengeSettings] = useState({});
    const { user } = useUser();

    useEffect(() => {
        const settings = location.state || { lives: 3, time: 60 }; // default values
        // setChallengeSettings(settings);
        let challengeTypeModifier = null;
        if (challengeType === 'liveschallenge' && !notDone) {
            setLives(settings.lives || 3);
            challengeTypeModifier = settings.lives || 3;
            setNotDone(true);
        } else if (challengeType === 'timeattack' && !notDone) {
            setTimeLeft(settings.time || 60);
            challengeTypeModifier = settings.time || 60;
            setNotDone(true);
        }
        const gameMode = 'multiple'; // assuming multiple choice is the default game mode
        socket.emit("quiz-new-single-player-game", { gameMode, userId: user._id, challengeType, challengeTypeModifier });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestionData({
                    question: question.question,
                    answers: question.answers,
                    correctAnswer: question.correctAnswer,
                    challengeType: question.challengeType
                });
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;
                const isCorrectAnswer = getIsPlayerAnswerCorrect(response);

                if (challengeType === 'liveschallenge' && !isCorrectAnswer) {
                    setLives(prevLives => prevLives - 1);
                }

                if (gameComplete || (challengeType === 'liveschallenge' && lives <= 0) ||
                    (challengeType === 'timeattack' && timeLeft <= 0)) {
                    navigate("/quizfinished", { state: { gameId: response.data.gameInfo.gameId } });
                } else {
                    setTimeout(() => {
                        setQuestionData({
                            question: question.question,
                            answers: question.answers,
                            correctAnswer: question.correctAnswer,
                            challengeType: question.challengeType
                        });
                    }, 1000);
                }
            }
        });

        return () => {
            socket.off("quiz-new-single-player-game");
            socket.off("quiz-answer-question");
        };
    }, [socket, navigate, challengeType, location.state, user._id]);

    useEffect(() => {
        if (challengeType === 'timeattack' && questionData) {
            const timer = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
            if (timeLeft <= 0) {
                setTimeout(() => {
                    navigate("/quizfinished", { state: { gameId } });
                }, 1000);
            }
            return () => clearInterval(timer);
        }
    }, [timeLeft, navigate, challengeType, questionData, gameId]);

    useEffect(() => {
        if (challengeType === 'liveschallenge' && lives <= 0) {
            setTimeout(() => {
                navigate("/quizfinished", { state: { gameId } });
            }, 1000);
        }
    }, [lives, navigate, gameId, challengeType]);

    const getIsPlayerAnswerCorrect = (response) => {
        const playerId = user._id;
        for (const player of response.data.players) {
            if (player.id === playerId) {
                return player.isCorrectAnswer;
            }
        }
        return undefined;
    };

    const handleAnswerSelected = (answer) => {
        socket.emit("quiz-answer-question", { gameId, answer, userId: user._id });
    };

    const renderLives = () => {
        const hearts = [];
        for (let i = 0; i < lives; i++) {
            hearts.push(<span key={i} className="heart">❤️</span>);
        }
        return hearts;
    };

    const renderTimer = () => {
        return (
            <div className="lives-content">
                Time left: {timeLeft} seconds
            </div>
        );
    };

    return (
        <div className="challenge-mode-container">
            <h1>Challenge Mode</h1>
            <div className={"lives-container"}>
                {challengeType === 'liveschallenge' && (
                    <div className={"lives-content"}>
                        Lives: {renderLives()}
                    </div>
                )}
                {challengeType === 'timeattack' && renderTimer()}
            </div>
            {questionData && (
                <QuestionAnswerComponent questionData={questionData} onAnswerSelected={handleAnswerSelected} />
            )}
        </div>
    );
}

export default ChallengeModeComponent;
