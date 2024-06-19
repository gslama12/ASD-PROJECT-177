import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/CommonStyles.css";
import { useUser } from "../../../UserContext.jsx";
import QuestionAnswerComponent from './QuestionAnswerComponent'; // Import the new component

function QuizModeComponent({ socket }) {
    const [questionData, setQuestionData] = useState(null);
    const [gameId, setGameId] = useState(null);
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        socket.emit("quiz-new-single-player-game", { gameMode: "multiple", userId: user._id });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestionData({
                    question: question.question,
                    answers: question.answers,
                    correctAnswer: question.correctAnswer
                });
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;

                if (gameComplete) {
                    setTimeout(() => {
                        navigate("/quizfinished", { gameId: gameId });
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setQuestionData({
                            question: question.question,
                            answers: question.answers,
                            correctAnswer: question.correctAnswer
                        });
                    }, 2000); // Reduced the delay for testing
                }
            }
        });
    }, [socket, navigate]);

    const handleAnswerSelected = (answer) => {
        socket.emit("quiz-answer-question", { gameId, answer, userId: user._id });
    };

    return (
        <div className="question-answer-container">
            <h1>Quiz Mode</h1>
            {questionData && (
                <QuestionAnswerComponent questionData={questionData} onAnswerSelected={handleAnswerSelected} />
            )}
        </div>
    );
}

export default QuizModeComponent;
