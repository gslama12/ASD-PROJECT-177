import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import '../../../styles/ProfileStyles.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../UserContext";
import "../../../styles/QuizFinishedComponentStyle.css";
import Header from "../Generic/Header.jsx";

function QuizFinished({ socket }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const { state } = useLocation();
    const [numberCorrectAnswers, setNumberCorrectAnswers] = useState(null);
    const [numberIncorrectAnswers, setNumberIncorrectAnswers] = useState(null);
    const [numberQuestionsTotal, setNumberQuestionsTotal] = useState(null);
    const [questionAnswerHistory, setQuestionAnswerHistory] = useState(null);
    const [startingLives, setStartingLives] = useState(null);
    const [startingTime, setStartingTime] = useState(null);

    useEffect(() => {
        socket.emit('quiz-get-game-info', { gameId: state.gameId });

        socket.on("quiz-get-game-info", (response) => {
            setNumberCorrectAnswers(response.data.gameInfo.correctAnswers);
            setNumberIncorrectAnswers(response.data.gameInfo.wrongAnswers);
            setNumberQuestionsTotal(response.data.questionAnswerHistory.length);
            setQuestionAnswerHistory(response.data.questionAnswerHistory);
            if (response.data.gameInfo.challengeType === "liveschallenge") {
                setStartingLives(response.data.gameInfo.challengeTypeModifier);
            }
            else if (response.data.gameInfo.challengeType === "timeattack") {
                setStartingTime(response.data.gameInfo.challengeTypeModifier);
            }
        });
    }, [socket, navigate]);

    return (
        <div className="page-container">
            <Header />
            <div className="quiz-finished-content">
                <div className="header">
                    <p>Quiz Overview</p>
                </div>
                <div className="stats">
                    <div className="stats-values">
                        <div className="header">
                            <p>Stats</p>
                        </div>
                        <div className="stats-content">
                            <p className="stat-value">Questions Answered Correctly: {numberCorrectAnswers}</p>
                            <p className="stat-value">Questions Answered Incorrectly: {numberIncorrectAnswers}</p>
                            <p className="stat-value">Number of Answered Questions: {numberQuestionsTotal}</p>
                            {startingLives !== null && (
                                <p className="stat-value">Starting Lives: {startingLives}</p>
                            )}
                            {startingTime !== null && (
                                <p className="stat-value">Starting Time: {startingTime} seconds</p>
                            )}
                        </div>
                    </div>
                    <div className="question-history">
                        <div className="header">
                            <p>Questions</p>
                        </div>
                        <div className="question-history-content">
                            {questionAnswerHistory ? (
                                questionAnswerHistory.map((obj, index) => (
                                    <div key={index}>
                                        <p className="question">{obj.question.question}</p>
                                    </div>
                                ))
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="footer">
                    <Link to="/quizmode" className="start-host-button">Play Quiz Mode Again</Link>
                    <Link to="/triviamode" className="start-host-button">Play Trivia Mode Again</Link>
                    <Link to="/home" className="start-host-button">Back To Home</Link>
                </div>
            </div>
        </div>
    );
}

export default QuizFinished;
