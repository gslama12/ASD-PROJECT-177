import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resetButtonText, setResetButtonText] = useState("RESET PASSWORD");

    const handleLoginClick = () => {
        if (!username || !password) {
            setAlertMessage("Username or password cannot be empty");
            return;
        }
        setFeedbackMessage("Logging in...");
        socket.emit("authenticate-user", { username, password });
    };

    const handleSignUpClick = () => {
        if (!username || !email || !password) {
            setAlertMessage("Username, email, and password cannot be empty");
            return;
        }
        setFeedbackMessage("Signing up...");
        socket.emit("add-user-to-db", { username, email, password });
    };

    const handleForgotPasswordClick = () => {
        if (resetButtonText === "LOG IN") {
            setForgotPasswordMode(false);
            setIsLogin(true);
            setAlertMessage("");
            setFeedbackMessage("");
            setResetButtonText("RESET PASSWORD");
            return;
        }
        if (!email) {
            setAlertMessage("Please enter your email to reset your password.");
            return;
        }
        setFeedbackMessage("Sending reset email...");
        socket.emit("forgot-password", { email });
        setCanResend(false);
        setTimeout(() => setCanResend(true), 60000); // 1 minute
    };

    const handleResendEmailClick = () => {
        if (!email) {
            setAlertMessage("Please enter your email to resend the password reset link.");
            return;
        }
        setFeedbackMessage("Resending reset email...");
        socket.emit("forgot-password", { email });
        setCanResend(false);
        setTimeout(() => setCanResend(true), 60000); // 1 minute
    };

    useEffect(() => {
        socket.on("user-authenticated-response", (response) => {
            if (response.success) {
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
            setFeedbackMessage("");
        });

        socket.on("user-added-response", (response) => {
            if (response.success) {
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
            setFeedbackMessage("");
        });

        socket.on("forgot-password-response", (response) => {
            setAlertMessage(response.message);
            setFeedbackMessage("");
            if (response.success) {
                setResetButtonText("LOG IN");
            }
        });

        return () => {
            socket.off("user-authenticated-response");
            socket.off("user-added-response");
            socket.off("forgot-password-response");
        };
    }, [navigate]);

    return (
        <div className="loginContainer">
            <div className="loginForm">
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                {alertMessage && <div className="alert">{alertMessage}</div>}
                {feedbackMessage && <div className="feedback">{feedbackMessage}</div>}
                {forgotPasswordMode ? (
                    <div className="formGroup">
                        <input
                            type="email"
                            placeholder="Email"
                            className="formControl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="buttonGroup">
                            <button className="btnMain" onClick={handleForgotPasswordClick} disabled={!canResend && resetButtonText !== "LOG IN"}>
                                {resetButtonText}
                            </button>
                            <button className="btnSecondary" onClick={handleResendEmailClick} disabled={!canResend}>
                                RESEND EMAIL
                            </button>
                        </div>
                        <button className="btnSecondary" onClick={() => setForgotPasswordMode(false)}>
                            CANCEL
                        </button>
                    </div>
                ) : (
                    <>
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
                                <button className="btnLogin" onClick={handleLoginClick}>
                                    LOGIN
                                </button>
                            </div>
                        ) : (
                            <div className="formGroup">
                                <button className="btnMain" onClick={handleSignUpClick}>
                                    SIGN UP
                                </button>
                            </div>
                        )}
                        {isLogin && (
                            <div className="forgotPassword">
                                <a href="#" onClick={() => setForgotPasswordMode(true)}>Forgot password?</a>
                            </div>
                        )}
                    </>
                )}
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
