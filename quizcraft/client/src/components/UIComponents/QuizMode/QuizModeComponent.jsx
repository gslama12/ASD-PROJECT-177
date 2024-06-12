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
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
    const navigate = useNavigate();
    const [buttonColors, setButtonColors] = useState(Array(answers.length).fill(''));


    useEffect(() => {
        socket.emit("quiz-new-single-player-game", { gameMode: "multiple" });

        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                const { gameInfo, question } = response.data;
                setGameId(gameInfo.gameId);
                setQuestion(he.decode(question.question));
                setAnswers(question.answers);
                setCorrectAnswer(question.correctAnswer);
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;
                const correctAnswer = question.correctAnswer;
                const isCorrectAnswer = response.data.players[0].isCorrectAnswer; // TODO should access via playerId

                setIsCorrectAnswer(isCorrectAnswer);
                setCorrectAnswer(correctAnswer);
                setIsAnswered(true);
                setFeedback(isCorrectAnswer ? "Correct!" : "Wrong!");
                if (gameComplete) {
                    navigate("/quizfinished");
                } else {
                    setTimeout(() => {
                        setButtonColors(Array(answers.length).fill(''));  // reset colors
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

    const handleAnswerClick = (answer, index) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        updateButtonColors(answer, index);
        socket.emit("quiz-answer-question", { gameId, answer });
    };


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

    return (
        <div className="quiz-mode-container">
            <h1>Quiz Mode</h1>
            {question && (
                <div className={"main-container"}>
                    <div className={"question-container"}>
                        <h2>{question}</h2>
                    </div>
                    <div className="answers-container">
                        {shuffleArray(answers).map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerClick(answer, index)}
                                disabled={isAnswered}
                                style={{ backgroundColor: buttonColors[index] }}>
                                {answer}
                            </button>
                        ))}
                    </div>
{/*                    {feedback && <div className="feedback-message">{feedback}</div>}*/}
                </div>
            )}
        </div>
    );
}

export default QuizModeComponent;
