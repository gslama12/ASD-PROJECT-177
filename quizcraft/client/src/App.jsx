import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { UserProvider, useUser } from "./UserContext";
import LoginComponent from "./components/UIComponents/Login/LoginComponent.jsx";
import HomeComponent from "./components/UIComponents/Home/HomeComponent.jsx";
import Profile from "./components/UIComponents/Profile/Profile.jsx";
import QuizFinished from "./components/UIComponents/Home/QuizFinished.jsx";
import QuizModeComponent from "./components/UIComponents/QuizMode/QuizModeComponent.jsx";
import TriviaModeComponent from "./components/UIComponents/QuizMode/TriviaModeComponent.jsx";
import ChallengeModeComponent from "./components/UIComponents/QuizMode/ChallengeModeComponent.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/UIComponents/GenericStyles/Header";
import "../src/styles/LoginComponentStyle.css";
import "./components/UIComponents/GenericStyles/CenteredHeader.css";
import quizMeImage from '../src/assets/quiz_me.png';
import ChallengeSelectionComponent from "./components/UIComponents/QuizMode/ChallengeSelectionComponent.jsx";

const WEBSOCKET_URL = "http://localhost:3001";

function App() {
    const [socket, setSocket] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const newSocket = io(WEBSOCKET_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    if (!socket) return <div>Loading...</div>;

    // if the header should be shown based on the current path
    const showHeader = !['/login', '/quizmode', '/triviamode', '/challengemode'].includes(location.pathname);

    return (
        <UserProvider>
            {showHeader && <Header />} {/* Conditionally render Header */}
            <Routes>
                <Route path='/' element={<Navigate to="/login" />} />
                <Route path='/login' element={<LoginPage socket={socket} />} />
                <Route path='/home' element={<ProtectedRoute><HomeComponent socket={socket} /></ProtectedRoute>} />
                <Route path='/profile' element={<ProtectedRoute><Profile socket={socket} /></ProtectedRoute>} />
                <Route path='/quizfinished' element={<ProtectedRoute><QuizFinished socket={socket} /></ProtectedRoute>} />
                <Route path='/quizmode' element={<ProtectedRoute><QuizModeComponent socket={socket} /></ProtectedRoute>} />
                <Route path='/triviamode' element={<ProtectedRoute><TriviaModeComponent socket={socket} /></ProtectedRoute>} />
                <Route path='/challengemode' element={<ProtectedRoute><ChallengeSelectionComponent socket={socket} /></ProtectedRoute>} />
                <Route path="/challenge/:challengeType" element={<ProtectedRoute><ChallengeModeComponent socket={socket}/></ProtectedRoute>} />
            </Routes>
        </UserProvider>
    );
}

function LoginPage({ socket }) {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className="loginPageContainer">
            <div className="quoteContainer">
                <img src={quizMeImage} alt="Quiz Me" className="quizImage"/>
            </div>
            <div className="loginContainer">
                <LoginComponent socket={socket} setUser={setUser} />
            </div>
        </div>
    );
}

export default App;
