import { useNavigate } from "react-router-dom";
import {useState} from "react";

function LoginComponent({socket}) {
    const navigate = useNavigate()
    const [usernameValue, setUsernameValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");
    const onLoginClick = () => {
        socket.emit("add-user-to-db", {username: usernameValue, password: passwordValue});
        navigate('/home')
    };

    const onUserNameChange = (event) => {
        setUsernameValue(event.target.value); // Update input value on change
    }

    const onPwChange = (event) => {
        setPasswordValue(event.target.value); // Update input value on change
    }

    return (
        <>
            <h1> Login page</h1>

            <div className="mb-3">
                <label htmlFor="usernameField" className="form-label">Username:</label>
                <input id="usernameField" className="input-group-text" value={usernameValue} placeholder="type something..." onChange={onUserNameChange}/>

                <label htmlFor="pwField" className="form-label">Password:</label>
                <input id="pwField" className="input-group-text" value={passwordValue} placeholder="type something..." onChange={onPwChange}/>
            </div>
            <button type="button" className="btn btn-primary" onClick={onLoginClick}>Log In / Register</button>
        </>
    );
}

export default LoginComponent;
