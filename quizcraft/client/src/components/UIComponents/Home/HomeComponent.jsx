import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from "../../../UserContext";
import "../../../styles/HomeComponentStyle.css";
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';

function HomeComponent({ socket }) {
    const { user } = useUser();
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
                            <Dropdown.Item href="/home">Home</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/login">Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="home-container">
                <div className="mode-cards-container">
                    <div className="mode-card quiz-card">
                        <Link to="/quizmode" className="mode-link">
                            <h2>Quiz</h2>
                            <p>Try your knowledge in various topics!</p>
                        </Link>
                    </div>
                    <div className="mode-card trivia-card">
                        <Link to="/quizmode" className="mode-link">
                            <h2>Trivia</h2>
                            <p>Go full on trivia mode and reach highscores!</p>
                        </Link>
                    </div>
                    <div className="mode-card challenges-card">
                        <Link to="/quizmode" className="mode-link">
                            <h2>Challenges</h2>
                            <p>Test your skills with our weekly challenges!</p>
                        </Link>
                    </div>
                </div>
                <div className="start-host-container">
                    <input type="text" className="host-input" placeholder="./trivialquiz/#sessionid/#playerid" />
                    <button className="start-host-button">Start Host</button>
                </div>
            </div>
        </>
    );
}

export default HomeComponent;
