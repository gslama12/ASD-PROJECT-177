import React, {useEffect} from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';
import '../Profile/ProfileStyles.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../UserContext";
import "../../../styles/QuizFinishedComponentStyle.css";

function QuizFinished({socket}) {
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        //socket.emit('quiz-get-game-info', gameId);
    }, [socket, navigate]); // Empty dependency array to run the effect only once on mount


    return (
        <>
            <div className="top-bar">
                <div className="profile-icon-container">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="profile-dropdown-toggle">
                            <img src={profileIcon} alt="Profile" className="profile-icon" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.ItemText className="dropdown-username">{user ? user.username : "Guest"}</Dropdown.ItemText>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/login">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="quiz-finished-container">
                <h1 className="centered-header">Quiz Finished</h1>
                {/* Displaying stats */}
                <h3>{`Congratulations ${user ? user.username : "Guest"}!!!`}</h3>
                <h2>{`Correct Answers: `}</h2>
                <h2>{`Wrong Answers: `}</h2>
                {/* Additional content can be added here */}
            </div>
        </>
    );
}

export default QuizFinished;
