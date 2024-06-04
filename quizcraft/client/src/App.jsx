import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import io from "socket.io-client";
import { UserProvider, useUser } from "./UserContext";
import LoginComponent from "./components/UIComponents/Login/LoginComponent.jsx";
import HomeComponent from "./components/UIComponents/Home/HomeComponent.jsx";
import Profile from "./components/UIComponents/Profile/Profile.jsx";
import QuizFinished from "./components/UIComponents/Home/QuizFinished.jsx";
import QuizModeComponent from "./components/UIComponents/QuizMode/QuizModeComponent.jsx";
import TriviaModeComponent from "./components/UIComponents/QuizMode/TriviaModeComponent.jsx";
import "../src/styles/LoginComponentStyle.css";
import "./components/UIComponents/GenericStyles/CenteredHeader.css";
import quizMeImage from '../src/assets/quiz_me.png';

const WEBSOCKET_URL = "http://localhost:3001";

function App() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(WEBSOCKET_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    if (!socket) return <div>Loading...</div>;

    return (
        <UserProvider>
            <Routes>
                <Route path='/' element={<Navigate to="/login" />} />
                <Route path='/home' element={<HomeComponent socket={socket} />} />
                <Route path='/login' element={<LoginPage socket={socket} />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/quizfinished' element={<QuizFinished socket={socket} />} />
                <Route path='/quizmode' element={<QuizModeComponent socket={socket} />} />
                <Route path='/triviamode' element={<TriviaModeComponent socket={socket} />} />
            </Routes>
        </UserProvider>
    );
}

function LoginPage({ socket }) {
    const { setUser } = useUser();
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
