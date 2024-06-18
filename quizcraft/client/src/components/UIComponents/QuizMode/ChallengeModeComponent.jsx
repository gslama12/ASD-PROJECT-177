import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../../styles/ChallengeModeComponentStyle.css";
import he from 'he';
import { useUser } from "../../../UserContext.jsx";

function ChallengeModeComponent({ socket }) {
    const { challengeType } = useParams();
    const location = useLocation();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60); // default time for time-attack mode
    const navigate = useNavigate();
    const [challengeSettings, setChallengeSettings] = useState({});
    const { user } = useUser();
    const [buttonColors, setButtonColors] = useState(Array(answers.length).fill(''));

    useEffect(() => {
        const settings = location.state || { lives: 3, time: 60 }; // default values
        setChallengeSettings(settings);
        setLives(settings.lives);
        if (challengeType === 'timeattack') {
            setTimeLeft(settings.time || 60); // set time for time-attack mode
        }

        const gameMode = challengeType === 'timeattack' ? 'multiple' : 'multiple';
        socket.emit("quiz-new-single-player-game", { gameMode, userId: user._id });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestion(he.decode(question.question));
                setAnswers(shuffleArray(question.answers));
                setCorrectAnswer(question.correctAnswer);
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;
                const correctAnswer = question.correctAnswer;
                const isCorrectAnswer = getIsPlayerAnswerCorrect(response);

                setIsCorrectAnswer(isCorrectAnswer);
                setCorrectAnswer(correctAnswer);
                setIsAnswered(true);
                setFeedback(isCorrectAnswer ? "Correct!" : "Wrong!");

                if (!isCorrectAnswer) {
                    setLives(prevLives => prevLives - 1);
                }

                if (gameComplete) {
                    setTimeout(() => {
                        navigate("/quizfinished", { state: { gameId: response.data.gameInfo.gameId } });
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setButtonColors(Array(answers.length).fill(''));  // reset colors
                        setQuestion(he.decode(question.question));
                        setAnswers(shuffleArray(question.answers));
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                        setFeedback("");
                    }, 2000); // wait 2 seconds before showing the next question
                }
            }
        });

    }, [socket, navigate, challengeType, location.state, user._id]);

    useEffect(() => {
        if (lives <= 0) {
            setTimeout(() => {
                navigate("/quizfinished", { state: { gameId } });
            }, 2000);
        }
    }, [lives, navigate, gameId]);

    useEffect(() => {
        if (challengeType === 'timeattack' && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (challengeType === 'timeattack' && timeLeft === 0 && !isAnswered) {
        } else if ((challengeType === 'timeattack' && timeLeft === 0 && isAnswered) || lives <= 0) {
            navigate(`/quizfinished`, { state: { gameId } });
        }
    }, [timeLeft, navigate, gameId, challengeType, isAnswered, lives]);

    const handleAnswerClick = (answer, index) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        updateButtonColors(answer, index);
        socket.emit("quiz-answer-question", { gameId, answer, userId: user._id });
    };

    const getIsPlayerAnswerCorrect = (response) => {
        const playerId = user._id;
        for (const player of response.data.players) {
            if (player.id === playerId) {
                return player.isCorrectAnswer;
            }
        }
        return undefined;
    }

    const updateButtonColors = (answer, index) => {
        const newColors = buttonColors.slice();
        if (answer === correctAnswer) {
            newColors[index] = 'rgb(58,218,4)';
        } else {
            newColors[index] = 'rgba(255, 42, 42, 1)';
            const correctIndex = answers.indexOf(correctAnswer);
            if (correctIndex !== -1) {
                newColors[correctIndex] = 'rgba(119,255,110,0.34)';
            }
        }
        setButtonColors(newColors);
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    };

    const renderLives = () => {
        const hearts = [];
        for (let i = 0; i < lives; i++) {
            hearts.push(<span key={i} className="heart">❤️</span>);
        }
        return hearts;
    }

    const renderTimer = () => {
        return (
            <div className="lives-content">
                Time left: {timeLeft} seconds
            </div>
        );
    }

    return (
        <div className="challenge-mode-container">
            <div className={"challenge-lives-container"}>
                {challengeType !== 'timeattack' && (
                    <div className={"lives-content"}>
                        Lives: {renderLives()}
                    </div>
                )}
                {challengeType === 'timeattack' && renderTimer()}
            </div>
            <div className={"challenge-quiz-buttons-container"}>
                {question && (
                    <div className={"main-container"}>
                        <div className={"question-container"}>
                            <h2>{question}</h2>
                        </div>
                        <div className="answers-container">
                            {answers.map((answer, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerClick(answer, index)}
                                    disabled={isAnswered}
                                    style={{ backgroundColor: buttonColors[index] }}>
                                    {answer}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChallengeModeComponent;
