import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';
import '../Profile/ProfileStyles.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../UserContext";
import "../../../styles/QuizFinishedComponentStyle.css";

function QuizFinished({socket}) {
    const navigate = useNavigate();
    const { user } = useUser();
    const { state } = useLocation();
    const [numberCorrectAnswers, setNumberCorrectAnswers] = useState(null);
    const [numberIncorrectAnswers, setNumberIncorrectAnswers] = useState(null);
    const [numberQuestionsTotal, setNumberQuestionsTotal] = useState(null);
    const [questionAnswerHistory, setQuestionAnswerHistory] = useState(null);

    useEffect(() => {
        socket.emit('quiz-get-game-info', { gameId: state.gameId});

        socket.on("quiz-get-game-info", (response) => {
            console.log("GAME INFO:", response);
            console.log("USER", user);
            setNumberCorrectAnswers(response.data.gameInfo.correctAnswers);
            setNumberIncorrectAnswers(response.data.gameInfo.wrongAnswers);
            setNumberQuestionsTotal(response.data.gameInfo.numOfRounds);
            setQuestionAnswerHistory(response.data.questionAnswerHistory);
        });
    }, [socket, navigate]); // Empty dependency array to run the effect only once on mount



/*  // TODO: player IDs not implemented yet
    const getQuestionsForPlayer = () =>{
        if (questionAnswerHistory && questionAnswerHistory.length > 0) {
            let questions = [];
            questionAnswerHistory.forEach((question) => {
                if (question.playerId === user._id){
                questions.push(question);
            }
            });
            console.log("q", user);
            return questions;
        }
    }
*/

    return (
        <div className="page-container">
            <div className="top-bar">
                <div className="profile-icon-container">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="profile-dropdown-toggle">
                            <img src={profileIcon} alt="Profile" className="profile-icon" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.ItemText className="dropdown-username">{user ? user.username : "Guest"}</Dropdown.ItemText>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/login">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
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
