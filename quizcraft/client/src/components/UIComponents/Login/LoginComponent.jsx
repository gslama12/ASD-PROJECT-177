import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/LoginComponentStyle.css";

function LoginComponent({ socket }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

    const handleLoginClick = () => {
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

    const handleForgotPasswordClick = () => {
        if (!email) {
            setAlertMessage("Please enter your email to reset your password.");
            return;
        }
        socket.emit("forgot-password", { email });
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

        socket.on("forgot-password-response", (response) => {
            setAlertMessage(response.message);
        });

        return () => {
            socket.off("user-authenticated-response");
            socket.off("user-added-response");
            socket.off("forgot-password-response");
        };
    }, [navigate, socket]);

    return (
        <div className="loginForm">
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>
            {alertMessage && <div className="alert">{alertMessage}</div>}
            {forgotPasswordMode ? (
                <div className="formGroup">
                    <input
                        type="email"
                        placeholder="Email"
                        className="formControl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="btn" onClick={handleForgotPasswordClick}>
                        RESET PASSWORD
                    </button>
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
    );
}

export default LoginComponent;
