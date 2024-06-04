import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/QuizModeComponentStyle.css";

function QuizModeComponent({ socket }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [gameId, setGameId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit("quiz-new-single-player-game", { gameMode: "multiple" });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestion(question.question);
                setAnswers(question.answers);
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const { correctAnswer, isCorrect, question, gameComplete } = response.data;
                setCorrectAnswer(correctAnswer);
                setIsAnswered(true);
                setFeedback(isCorrect ? "Correct!" : "Wrong!");
                if (gameComplete) {
                    navigate("/quizfinished");
                } else {
                    setTimeout(() => {
                        setQuestion(question.question);
                        setAnswers(question.answers);
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                        setFeedback("");
                    }, 2000); // wait 2 seconds before showing the next question
                }
            }
        });
    }, [socket, navigate]);

    const handleAnswerClick = (answer) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        socket.emit("quiz-answer-question", { gameId, answer });
    };

    return (
        <div className="quiz-mode-container">
            <h1>Quiz Mode</h1>
            {question && (
                <>
                    <h2>{question}</h2>
                    <div className="answers-container">
                        {answers.map((answer, index) => (
                            <button
                                key={index}
                                className={`answer-button ${selectedAnswer === answer ? 'selected' : ''} 
                                            ${isAnswered && answer === correctAnswer ? 'correct' : ''} 
                                            ${isAnswered && selectedAnswer === answer && answer !== correctAnswer ? 'wrong' : ''}`}
                                onClick={() => handleAnswerClick(answer)}
                                disabled={isAnswered}
                            >
                                {answer}
                            </button>
                        ))}
                    </div>
                    {feedback && <div className="feedback-message">{feedback}</div>}
                </>
            )}
        </div>
    );
}

export default QuizModeComponent;
