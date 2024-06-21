import { useState, useEffect } from "react";
import he from 'he';
import "../../../styles/CommonStyles.css";

const QuestionAnswerComponent = ({ questionData, onAnswerSelected }) => {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    // const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [buttonColors, setButtonColors] = useState([]);

    useEffect(() => {
        if (questionData) {
            setQuestion(he.decode(questionData.question));
            setAnswers(shuffleArray(questionData.answers));
            setCorrectAnswer(questionData.correctAnswer);
            // setSelectedAnswer(null);
            setIsAnswered(false);
            setButtonColors(Array(questionData.answers.length).fill(''));
        }
    }, [questionData]);

    const handleAnswerClick = (answer, index) => {
        if (isAnswered) return;
        // setSelectedAnswer(answer);
        setIsAnswered(true);
        updateButtonColors(answer, index);
        onAnswerSelected(answer);
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
        <div className="question-answer-container">
            {question && (
                <div className="main-container">
                    <div className="question-container">
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
    );
};

export default QuestionAnswerComponent;
