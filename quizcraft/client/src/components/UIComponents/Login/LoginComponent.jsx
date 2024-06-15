import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../UserContext";
import "../../../styles/LoginComponentStyle.css";

function LoginComponent({ socket }) {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [resetButtonText, setResetButtonText] = useState("RESET PASSWORD");
    const [errorFields, setErrorFields] = useState({});

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|\-<>_´=§/+]/.test(password);
        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumber &&
            hasSpecialChar
        );
    };

    const validateEmail = (email) => {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    };

    const handleLoginClick = () => {
        setFeedbackMessage("")
        setAlertMessage("")
        const errors = {};
        if (!username) {
            errors.username = "Username cannot be empty";
        }
        if (!password) {
            errors.password = "Password cannot be empty";
        }
        if (Object.keys(errors).length > 0) {
            setErrorFields(errors);
            return;
        }
        setErrorFields({});
        setFeedbackMessage("Logging in...");
        socket.emit("authenticate-user", { username, password });
    };

    const handleSignUpClick = () => {
        setAlertMessage("");
        setFeedbackMessage("");
        const errors = {};
        if (!username) {
            errors.username = "Username cannot be empty";
        }
        if (!email) {
            errors.email = "Email cannot be empty";
        } else if (!validateEmail(email)) {
            errors.email = "Invalid email format";
        }
        if (!password) {
            errors.password = "Password cannot be empty";
        }
        if (!confirmPassword) {
            errors.confirmPassword = "Confirm password cannot be empty";
        }
        if (password && confirmPassword && password !== confirmPassword) {
            errors.password = "Passwords do not match";
            errors.confirmPassword = "Passwords do not match";
        }
        if (password && !validatePassword(password)) {
            errors.password = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character";
        }
        if (Object.keys(errors).length > 0) {
            setErrorFields(errors);
            return;
        }
        setFeedbackMessage("Signing up...");
        setErrorFields({});
        socket.emit("add-user-to-db", { username, email, password });
    };

    const handleForgotPasswordClick = () => {
        setAlertMessage("");
        setFeedbackMessage("");
        if (resetButtonText === "LOG IN") {
            setForgotPasswordMode(false);
            setIsLogin(true);
            setAlertMessage("");
            setFeedbackMessage("");
            setResetButtonText("RESET PASSWORD");
            return;
        }
        const errors = {};
        if (!email) {
            errors.email = "Please enter your email to reset your password";
        } else if (!validateEmail(email)) {
            errors.email = "Invalid email format";
        }
        if (Object.keys(errors).length > 0) {
            setErrorFields(errors);
            return;
        }
        setErrorFields({});
        setFeedbackMessage("Sending reset email...");
        socket.emit("forgot-password", { email });
        setCanResend(false);
        setTimeout(() => setCanResend(true), 10000);
    };

    const handleResendEmailClick = () => {
        if (!email) {
            setAlertMessage("Please enter your email to resend the password reset link.");
            return;
        }
        setFeedbackMessage("Resending reset email...");
        socket.emit("forgot-password", { email });
        setCanResend(false);
        setTimeout(() => setCanResend(true), 10000);
    };

    useEffect(() => {
        socket.on("user-authenticated-response", (response) => {
            if (response.success) {
                setUser(response.user);
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
            setFeedbackMessage("");
        });

        socket.on("user-added-response", (response) => {
            if (response.success) {
                setUser(response.user);
                navigate("/home");
            } else {
                setAlertMessage(response.message);
            }
            setFeedbackMessage("");
        });

        socket.on("forgot-password-response", (response) => {
            setAlertMessage("");
            setFeedbackMessage(response.message);
            if (response.success) {
                setResetButtonText("LOG IN");
            }
        });

        return () => {
            socket.off("user-authenticated-response");
            socket.off("user-added-response");
            socket.off("forgot-password-response");
        };
    }, [navigate, socket, setUser]);

    const switchMode = () => {
        setIsLogin(!isLogin);
        setAlertMessage("");
        setErrorFields({});
    };

    const handleCancelClick = () => {
        setForgotPasswordMode(false);
        setAlertMessage("");
        setFeedbackMessage("");
        setResetButtonText("RESET PASSWORD")
    };

    const handleForgotPasswordLinkClick = () => {
        setForgotPasswordMode(true);
        setAlertMessage("");
        setFeedbackMessage("");
    }

    return (
        <div className="loginContainer">
            <div className="loginForm">
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                {feedbackMessage && <div className="feedback">{feedbackMessage}</div>}
                {alertMessage && <div className="alertMessage">{alertMessage}</div>}
                {forgotPasswordMode ? (
                    <div className="formGroup">
                        <input
                            type="email"
                            placeholder="Email"
                            className={`formControl ${errorFields.email ? 'error' : ''}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errorFields.email && <div className="errorMessage">{errorFields.email}</div>}
                        <button className="btnMain" onClick={handleForgotPasswordClick}>
                            {resetButtonText}
                        </button>
                        <button className="btnSecondary" onClick={handleResendEmailClick} disabled={!canResend}>
                            RESEND EMAIL
                        </button>
                        <button className="btnSecondary" onClick={handleCancelClick}>
                            CANCEL
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="formGroup">
                            <input
                                type="text"
                                placeholder="Username"
                                className={`formControl ${errorFields.username ? 'error' : ''}`}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {errorFields.username && <div className="errorMessage">{errorFields.username}</div>}
                        </div>
                        {!isLogin && (
                            <div className="formGroup">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={`formControl ${errorFields.email ? 'error' : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errorFields.email && <div className="errorMessage">{errorFields.email}</div>}
                            </div>
                        )}
                        <div className="formGroup">
                            <input
                                type="password"
                                placeholder="Password"
                                className={`formControl ${errorFields.password ? 'error' : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errorFields.password && <div className="errorMessage">{errorFields.password}</div>}
                        </div>
                        {!isLogin && (
                            <div className="formGroup">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className={`formControl ${errorFields.confirmPassword ? 'error' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                {errorFields.confirmPassword && <div className="errorMessage">{errorFields.confirmPassword}</div>}
                            </div>
                        )}
                        {isLogin ? (
                            <div className="formGroup">
                                <button className="btnMain" onClick={handleLoginClick}>
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
                                <a href="#" onClick={handleForgotPasswordLinkClick}>Forgot password?</a>
                            </div>
                        )}
                    </>
                )}
                <div className="signup">
                    <p>{isLogin ? "Or Sign Up Using" : "Or Log In Using"}</p>
                    <button
                        className="btnSecondary"
                        onClick={switchMode}
                    >
                        {isLogin ? "SIGN UP" : "LOG IN"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;
