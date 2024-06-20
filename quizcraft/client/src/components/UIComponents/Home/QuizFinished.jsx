import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../UserContext";
import Header from "../Generic/Header.jsx";
import { FaCheck, FaTimes, FaQuestion, FaHeart, FaClock } from 'react-icons/fa';
import '../../../styles/ProfileStyles.css';
import "../../../styles/QuizFinishedComponentStyle.css";

function QuizFinished({ socket }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const { state } = useLocation();
    const [numberCorrectAnswers, setNumberCorrectAnswers] = useState(0);
    const [numberIncorrectAnswers, setNumberIncorrectAnswers] = useState(0);
    const [numberQuestionsTotal, setNumberQuestionsTotal] = useState(0);
    const [questionAnswerHistory, setQuestionAnswerHistory] = useState([])
    const [startingLives, setStartingLives] = useState(null);
    const [startingTime, setStartingTime] = useState(null);
    const [multiplayer, setMultiplayer] = useState(null);

    useEffect(() => {
        socket.emit('quiz-get-game-info', { gameId: state.gameId });

        socket.on("quiz-get-game-info", (response) => {
            console.log(response.data);
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

    const correctAnswerRatio = numberQuestionsTotal ? (numberCorrectAnswers / numberQuestionsTotal * 100).toFixed(2) : 0;
    const incorrectAnswerRatio = numberQuestionsTotal ? (numberIncorrectAnswers / numberQuestionsTotal * 100).toFixed(2) : 0;


    return (
        <div className="page-container">
            <div className="quiz-finished-content">
                <div className="header">
                    <p>Quiz Finished</p>
                </div>
                <div className="content">
                    <div className="stats">
                        <div className="stats-values">
                            <div className="header">
                                <p>Stats</p>
                            </div>
                            <div className="stats-content-finished">
                                <div className="stat-item">
                                    <FaCheck className="stat-icon correct"/>
                                    <p className="stat-value">Correct
                                        Answers: {numberCorrectAnswers} </p>
                                </div>
                                <div className="stat-item">
                                    <FaCheck className="stat-icon correct-ratio"/>
                                    <p className="stat-value">Correct
                                        Answers Ratio: {correctAnswerRatio}%</p>
                                </div>
                                <div className="stat-item">
                                    <FaTimes className="stat-icon incorrect"/>
                                    <p className="stat-value">Incorrect
                                        Answers: {numberIncorrectAnswers} </p>
                                </div>
                                <div className="stat-item">
                                    <FaTimes className="stat-icon incorrect-ratio"/>
                                    <p className="stat-value">Incorrect
                                        Answers Ratio: {incorrectAnswerRatio}%</p>
                                </div>
                                <div className="stat-item">
                                    <FaQuestion className="stat-icon total"/>
                                    <p className="stat-value">Total Questions: {numberQuestionsTotal}</p>
                                </div>
                                {startingLives !== null && (
                                    <div className="stat-item">
                                        <FaHeart className="stat-icon lives"/>
                                        <p className="stat-value">Starting Lives: {startingLives}</p>
                                    </div>
                                )}
                                {startingTime !== null && (
                                    <div className="stat-item">
                                        <FaClock className="stat-icon time"/>
                                        <p className="stat-value">Starting Time: {startingTime} seconds</p>
                                    </div>
                                )}
                                {multiplayer !== null &&  (
                                    <div className="multiplayer">
                                        <FaUsers className="stat-icon people"/>
                                        <p className="stat-value">You won against: </p>
                                    </div>
                                    )}
                            </div>
                        </div>
                    </div>
                    <div className="question-history-content">
                        <div className="question-history">
                            <div className="header">
                                <p>Questions</p>
                            </div>
                            {questionAnswerHistory.length > 0 ? (
                                    questionAnswerHistory.map((obj, index) => (
                                        <div key={index} className="question-item">
                                            <div className="question-row">
                                                <p className="question">
                                                    {index + 1}. {obj.question.question}
                                                    {obj.question.correctAnswer === obj.answer
                                                        ? <FaCheck className="stat-icon correct-ratio"/>
                                                        : <FaTimes className="stat-icon incorrect"/>}
                                                </p>
                                            </div>
                                            <p className="question-answer">Your answer: {obj.answer}</p>
                                            <p className="question-answer">Correct
                                                answer: {obj.question.correctAnswer}</p>
                                        </div>
                                    ))
                            ) : (
                                <p>Loading...</p>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default QuizFinished;
