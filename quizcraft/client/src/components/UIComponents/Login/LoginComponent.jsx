import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import googleIcon from "../../../assets/google-icon.png";
import { io } from "socket.io-client";
import "../../../styles/LoginComponentStyle.css";

const socket = io("http://localhost:3001");

function LoginComponent() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");

    const handleLoginClick = () => {
        setAlertMessage(username);
        if (!username || !password) {
            setAlertMessage("Username or password cannot be empty");
            return;
        }
        socket.emit("authenticate-user", { username, password });
    };

    const handleSignUpClick = () => {
        if (!username || !email || !password) {
            setAlertMessage("Username, email, and password cannot be empty");
            return;
        }
        socket.emit("add-user-to-db", { username, email, password });
    };

    useEffect(() => {
        socket.on("user-authenticated-response", (response) => {
            if (response.success) {
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
        });

        socket.on("user-added-response", (response) => {
            if (response.success) {
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
        });

        return () => {
            socket.off("user-authenticated-response");
            socket.off("user-added-response");
        };
    }, [navigate]);

    return (
        <div className="loginContainer">
            <div className="loginForm">
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                {alertMessage && <div className="alert">{alertMessage}</div>}
                <div className="formGroup">
                    <input
                        type="text"
                        placeholder="Username"
                        className="formControl"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                {!isLogin && (
                    <div className="formGroup">
                        <input
                            type="email"
                            placeholder="Email"
                            className="formControl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}
                <div className="formGroup">
                    <input
                        type="password"
                        placeholder="Password"
                        className="formControl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {isLogin ? (
                    <div className="formGroup">
                        <button className="btn" onClick={handleLoginClick}>
                            LOGIN
                        </button>
                    </div>
                ) : (
                    <div className="formGroup">
                        <button className="btn" onClick={handleSignUpClick}>
                            SIGN UP
                        </button>
                    </div>
                )}
                {isLogin && (
                    <div className="forgotPassword">
                        <a href="#">Forgot password?</a>
                    </div>
                )}
                <div className="socialLogin">
                    <p>Or Sign Up Using</p>
                    <div className="socialButtons">
                        <button className="btnSocial">
                            <img src={googleIcon} alt="Google Icon" className="googleIcon" />
                        </button>
                    </div>
                </div>
                <div className="signup">
                    <p>{isLogin ? "Or Sign Up Using" : "Or Log In Using"}</p>
                    <button
                        className="btnSecondary"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "SIGN UP" : "LOG IN"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;