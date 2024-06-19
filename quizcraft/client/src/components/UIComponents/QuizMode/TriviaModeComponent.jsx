import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/CommonStyles.css";
import he from 'he';
import TriviaSelector from "./TriviaSelector.jsx";
import { useUser } from "../../../UserContext.jsx";
import { getLocalStorageRoomId, setLocalStorageRoomId } from "../../../utils/LocalStorageHelper.js";
import QuestionAnswerComponent from './QuestionAnswerComponent'; // Import the new component

function TriviaModeComponent({ socket }) {
    const [questionData, setQuestionDataState] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [showTriviaSelector, setShowTriviaSelector] = useState(true);
    const [isMultiplayer, setIsMultiplayer] = useState(null);
    const [numRounds, setNumRounds] = useState(null);
    const navigate = useNavigate();
    const { user } = useUser();

    const handleQuestionData = (response) => {
        const { gameInfo, question } = response.data;
        setGameId(gameInfo.gameId);
        setQuestionDataState({
            question: question.question,
            answers: question.answers,
            correctAnswer: question.correctAnswer
        });
    };

    useEffect(() => {
        socket.on("quiz-new-single-player-game", (response) => {
            if (response.data) {
                handleQuestionData(response);
            }
        });

        socket.on("quiz-join-multiplayer-queue", (response) => {
            if (response?.data?.roomId) {
                setLocalStorageRoomId(response.data.roomId);
            } else {
                console.error(`response '${response}' or roomId '${response?.data?.roomId}' are undefined.`);
            }
        });

        socket.on("quiz-multiplayer-queue-ready", () => {
            const roomId = getLocalStorageRoomId();
            if (!user._id || !roomId) {
                console.error(`userId '${user._id}' or roomId '${roomId}' are undefined.`);
                return;
            }
            const requestBody = { userId: user._id, roomId: roomId, rounds: localStorage.getItem('numRounds') };
            socket.emit("quiz-new-multiplayer-game", requestBody);
        });

        socket.on("quiz-new-multiplayer-game", (response) => {
            if (response.data) {
                handleQuestionData(response);
            }
        });

        socket.on("quiz-answer-question", (response) => {
            if (response.data) {
                const question = response.data.question;
                const gameComplete = response.data.gameInfo.gameComplete;
                const correctAnswer = question.correctAnswer;
                const isCorrectAnswer = getIsPlayerAnswerCorrect(response);

                if (gameComplete) {
                    setTimeout(() => {
                        navigate("/quizfinished", { state: { gameId: response.data.gameInfo.gameId } });
                    }, 2000);
                } else {
                    setTimeout(() => {
                        setQuestionDataState({
                            question: question.question,
                            answers: question.answers,
                            correctAnswer: question.correctAnswer
                        });
                    }, 500); // Reduced the delay for testing
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
    };

    const setSettings = (settings) => {
        setNumRounds(settings.rounds);
        if (settings.mode === "single-player") {
            setIsMultiplayer(false);
            socket.emit("quiz-new-single-player-game", { gameMode: "multiple", userId: user._id, rounds: settings.rounds });
        } else if (settings.mode === "multi-player") {
            setIsMultiplayer(true);
            socket.emit("quiz-join-multiplayer-queue", { gameMode: "multiple", userId: user._id, rounds: settings.rounds });
        }
        setShowTriviaSelector(false);
    };

    const handleAnswerSelected = (answer) => {
        const requestBody = { gameId, answer, userId: user._id };
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

    return (
        <div className={"trivia-mode-main"}>
            {showTriviaSelector && (
                <div className="trivia-selector">
                    <TriviaSelector onStart={setSettings} />
                </div>
            )}
            {!showTriviaSelector && (
                <div className="trivia-mode-container">
                    <h1>Trivia Mode</h1>
                    {questionData && (
                        <QuestionAnswerComponent questionData={questionData} onAnswerSelected={handleAnswerSelected} />
                    )}
                </div>
            )}
        </div>
    );
}

export default TriviaModeComponent;
