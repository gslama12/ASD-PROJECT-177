import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/CommonStyles.css";
import QuizSelector from "./QuizSelector.jsx";
import { useUser } from "../../../UserContext.jsx";
import { getLocalStorageRoomId, setLocalStorageRoomId } from "../../../utils/LocalStorageHelper.js";
import QuestionAnswerComponent from './QuestionAnswerComponent';
import MultiplayerWaitingScreen from './MultiplayerWaitingScreen';

function QuizModeComponent({ socket }) {
    const [questionData, setQuestionDataState] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [showTriviaSelector, setShowTriviaSelector] = useState(true);
    const [isMultiplayer, setIsMultiplayer] = useState(null);
    // const [numRounds, setNumRounds] = useState(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const navigate = useNavigate();
    // const [selectedCategorie, setSelectedCategory] = useState(null);
    // const [selectedDifficulty, setSelectedDifficulty] = useState(null);
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
                setIsWaiting(true);
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
            const requestBody = { userId: user._id, roomId: roomId };
            socket.emit("quiz-new-multiplayer-game", requestBody);
            setIsWaiting(false);
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
                // const correctAnswer = question.correctAnswer;
                // const isCorrectAnswer = getIsPlayerAnswerCorrect(response);


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
                    }, 2000);
                }
            }
        });
    }, [socket, navigate]);

    // const getIsPlayerAnswerCorrect = (response) => {
    //     const playerId = user._id;
    //     for (const player of response.data.players) {
    //         if (player.id === playerId) {
    //             return player.isCorrectAnswer;
    //         }
    //     }
    //     return undefined;
    // };

    const setSettings = (settings) => {
        // setNumRounds(settings.rounds);
        // setSelectedDifficulty(settings.difficulty);
        // setSelectedCategory(settings.category);
        if (settings.mode === "single-player") {
            setIsMultiplayer(false);
            socket.emit("quiz-new-single-player-game", {
                gameMode: "multiple",
                userId: user._id,
                rounds: settings.rounds,
                category: settings.category,
                difficulty: settings.difficulty
            });
        } else if (settings.mode === "multi-player") {
            setIsMultiplayer(true);
            socket.emit("quiz-join-multiplayer-queue", {
                gameMode: "multiple",
                userId: user._id,
                rounds: settings.rounds,
                category: settings.category,
                difficulty: settings.difficulty
            });
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
                    <QuizSelector onStart={setSettings} />
                </div>
            )}
            {!showTriviaSelector && (
                <div className="trivia-mode-container">
                    <h1>Quiz Mode</h1>
                    {isWaiting ? (
                        <MultiplayerWaitingScreen />
                    ) : (
                        questionData && (
                            <QuestionAnswerComponent questionData={questionData} onAnswerSelected={handleAnswerSelected} />
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizModeComponent;