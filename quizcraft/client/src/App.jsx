import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import io from "socket.io-client";
import LoginComponent from "./components/UIComponents/Login/LoginComponent.jsx";
import HomeComponent from "./components/UIComponents/Home/HomeComponent.jsx";
import Profile from "./components/UIComponents/NavBar/Profile.jsx";
import QuizFinished from "./components/UIComponents/Home/QuizFinished.jsx";
import "../src/styles/LoginComponentStyle.css";
import quizMeImage from '../src/assets/quiz_me.png'; // Adjust the path as necessary

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
        <>
            <Routes>
                <Route path='/' element={<Navigate to="/login" />} />
                <Route path='/home' element={<HomeComponent socket={socket} />} />
                <Route path='/login' element={<LoginPage socket={socket} />} />
                <Route path='/profile' element={<Profile socket={socket} />} />
                <Route path='/quizfinished' element={<QuizFinished socket={socket} />} />
            </Routes>
        </>
    );
}

function LoginPage({ socket }) {
    return (
        <div className="mainContainer">
            <div className="quoteContainer">
                <img src={quizMeImage} alt="Quiz Me" className="quizImage"/>
            </div>
            <div className="loginContainer">
                <LoginComponent socket={socket} />
            </div>
        </div>
    );
}

export default App;
