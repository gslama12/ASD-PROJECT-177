
// COPIED FROM QUIZ MODE COMPONTENT
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/QuizModeComponentStyle.css";
import he from 'he';
import TriviaSelector from "./TriviaSelector.jsx";
import {useUser} from "../../../UserContext.jsx";
import {getLocalStorageRoomId, setLocalStorageRoomId} from "../../../utils/LocalStorageHelper.js";

function TriviaModeComponent({ socket }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
    const navigate = useNavigate();
    const {user} = useUser();
    const [buttonColors, setButtonColors] = useState(Array(answers.length).fill(''));
    const [showTriviaSelector, setShowTriviaSelector] = useState(true);
    const [isMultiplayer, setIsMultiplayer] = useState(null);

    function setQuestionData(response) {
        const { gameInfo, question } = response.data;
        setGameId(gameInfo.gameId);
        setQuestion(he.decode(question.question));
        setAnswers(shuffleArray(question.answers));
        setCorrectAnswer(question.correctAnswer);
    }

    useEffect(() => {
        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                setQuestionData(response)
            }
        });

        socket.on("quiz-join-multiplayer-queue", (response) => {
            console.log(`in quiz-join-multiplayer-queue.`);
            if (response?.data?.roomId) {
                setLocalStorageRoomId(response.data.roomId)
            } else {
                console.error(`response '${response}' or roomId '${response?.data?.roomId}' are undefined.`)
            }
        });

        socket.on("quiz-multiplayer-queue-ready", () => {
            const roomId = getLocalStorageRoomId();
            if (!user._id || !roomId) {
                console.error(`userId '${user._id}' or roomId '${roomId}' are undefined.`);
                return;
            }
            const requestBody = {"userId": user._id, "roomId": roomId};
            socket.emit("quiz-new-multiplayer-game", requestBody);
        });

        socket.on("quiz-new-multiplayer-game", (response) => {
            if (response.data) {
                setQuestionData(response)
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
                if (gameComplete) {
                    setTimeout(() => {
                        setButtonColors(Array(answers.length).fill(''));  // reset colors
                        navigate("/quizfinished", { state: {gameId: response.data.gameInfo.gameId}});
                    }, 2000); // wait 2 seconds before redirect
                } else {
                    setTimeout(() => {
                        setButtonColors(Array(answers.length).fill(''));  // reset colors
                        setQuestion(he.decode(question.question));
                        setAnswers(shuffleArray(question.answers)); //not sure to decode here too, throws bug but works
                        setSelectedAnswer(null);
                        setIsAnswered(false);
                        setFeedback("");
                    }, 2000); // wait 2 seconds before showing the next question
                }
            }
        });
    }, [socket, navigate]);

    const getIsPlayerAnswerCorrect = (response) => {
        const playerId = user._id;
        for (const player of response.data.players) {
            if (player.id === playerId) {
                return player.isCorrectAnswer;
            }
        }
        return undefined;
    }

    const setSettings = (settings) => {
        if (settings.mode === "single-player") {
            setIsMultiplayer(false);
            console.log("Starting single player game");
            socket.emit("quiz-new-single-player-game", { gameMode: "multiple", userId: user._id, rounds: settings.rounds});
        } else if (settings.mode === "multi-player") {
            setIsMultiplayer(true);
            console.log(`User '${user._id}' is joining multiplayer queue.`);
            socket.emit("quiz-join-multiplayer-queue", { gameMode: "multiple", userId: user._id});
        } else {
            console.error(`Invalid mode selected: '${settings.mode}'`);
            return;
        }
        setShowTriviaSelector(false);
    };


    const handleAnswerClick = (answer, index) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        updateButtonColors(answer, index);

        const requestBody = { gameId, answer, userId: user._id }
        if (isMultiplayer) {
            const roomId = getLocalStorageRoomId();
            if (!roomId) {
                console.error("Trying to answer question in multiplayer game but no roomId was found.");
                return;
            }
            requestBody["roomId"] = roomId;
        }

        socket.emit("quiz-answer-question", requestBody);
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
            {showTriviaSelector && (
                <div>
                    <TriviaSelector onStart={setSettings}/>
                </div>
            )}

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
                                style={{backgroundColor: buttonColors[index]}}>
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

export default TriviaModeComponent;
