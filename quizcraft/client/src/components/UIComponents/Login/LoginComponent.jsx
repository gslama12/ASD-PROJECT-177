import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import googleIcon from "../../assets/google-icon.png";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function LoginComponent() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);


    const handleLoginClick = () => {
        socket.emit("authenticate-user", { username, password });
    };

    const handleSignUpClick = () => {
        socket.emit("add-user-to-db", { username, email, password });
    };

    socket.on("user-authenticated-response", (response) => {
        if (response.success) {
            navigate("/home");
        } else {
            alert(response.message);
        }
    });

    socket.on("user-added-response", (response) => {
        if (response.success) {
            navigate("/home");
        } else {
            alert(response.message);
        }
    });

    const styles = {
        loginContainer: {
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto",
            paddingTop: "100px",
        },
        loginForm: {
            background: "#fff",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
        },
        formGroup: {
            marginBottom: "15px",
        },
        formControl: {
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ddd",
            textAlign: "center",
        },
        btn: {
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "#fff",
            cursor: "pointer",
        },
        btnSecondary: {
            marginTop: "10px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(to right, #6a11cb, #2575fc)",
            color: "#fff",
        },
        forgotPassword: {
            marginTop: "10px",
        },
        socialLogin: {
            textAlign: "center",
        },
        socialButtons: {
            display: "flex",
            justifyContent: "center",
        },
        btnSocial: {
            border: "none",
            background: "none",
            fontSize: "20px",
            color: "#555",
            cursor: "pointer",
            margin: "0 10px",
        },
        googleIcon: {
            width: "20px",
            height: "20px",
        },
        signup: {
            textAlign: "center",
        },
        signupA: {
            color: "#2575fc",
            textDecoration: "none",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginForm}>
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                <div style={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Username"
                        style={styles.formControl}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                {!isLogin && (
                    <div style={styles.formGroup}>
                        <input
                            type="email"
                            placeholder="Email"
                            style={styles.formControl}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}

                <div style={styles.formGroup}>
                    <input
                        type="password"
                        placeholder="Password"
                        style={styles.formControl}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {isLogin ? (
                    <div style={styles.formGroup}>
                        <button style={styles.btn} onClick={handleLoginClick}>
                            LOGIN
                        </button>
                    </div>
                ) : (
                    <div style={styles.formGroup}>
                        <button style={styles.btn} onClick={handleSignUpClick}>
                            SIGN UP
                        </button>
                    </div>
                )}

                {isLogin && (
                    <div style={styles.forgotPassword}>
                        <a href="#">Forgot password?</a>
                    </div>
                )}

                <div style={styles.socialLogin}>
                    <p>Or Sign Up Using</p>
                    <div style={styles.socialButtons}>
                        <button style={styles.btnSocial}>
                            <img src={googleIcon} alt="Google Icon" style={styles.googleIcon} />
                        </button>
                    </div>
                </div>
                <div style={styles.signup}>
                    <p>{isLogin ? "Or Sign Up Using" : "Or Log In Using"}</p>
                    <button
                        style={styles.btnSecondary}
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
