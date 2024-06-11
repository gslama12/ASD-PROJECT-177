import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/QuizModeComponentStyle.css";
import he from 'he';

function QuizModeComponent({ socket }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [gameId, setGameId] = useState(null);
    const navigate = useNavigate();

    function updateAnswerButtonClass(answer) {
        const buttonClassName = "answer-button";
        if (isAnswered && answer === correctAnswer) {
            console.log('Condition 1:', answer === correctAnswer); // for debugging
            return `${buttonClassName} correct`;
        }
        if (isAnswered && selectedAnswer === answer && answer !== correctAnswer) {
            console.log("Condition: wrong"); // Debugging log return
            return `${buttonClassName} wrong`;
        }
        if (selectedAnswer === answer) {
            console.log("Condition: selected"); // Debugging log return
            return `${buttonClassName} selected`;
        }
        console.log("Condition: default"); // Debugging log
        return buttonClassName;
    }

    useEffect(() => {
        socket.emit("quiz-new-single-player-game", { gameMode: "multiple" });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestion(he.decode(question.question));
                setAnswers(question.answers);
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;
                const correctAnswer = question.correctAnswer;
                const isCorrectAnswer = response.data.players[0].isCorrectAnswer; // TODO should access via playerId

                setCorrectAnswer(correctAnswer);
                setIsAnswered(true);
                setFeedback(isCorrectAnswer ? "Correct!" : "Wrong!");
                if (gameComplete) {
                    navigate("/quizfinished");
                } else {
                    setTimeout(() => {
                        setQuestion(he.decode(question.question));
                        setAnswers(question.answers); //not sure to decode here too, throws bug but works
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
                                className={updateAnswerButtonClass(answer)}
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
