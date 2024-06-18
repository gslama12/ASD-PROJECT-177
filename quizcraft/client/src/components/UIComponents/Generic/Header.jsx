import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { useUser } from '../../../UserContext';
import { useNavigate, Link } from 'react-router-dom';

function Header() {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null); // Clear the user context
        navigate('/login'); // Redirect to login page
    };

    // Warning!: href causes page reload, then the connection drops and a now socket is created. Use Link instead!

    return (
        <div className="top-bar">
            <div className={"brand"}>
                <div className={"brand-cont"}>
                    <div className={"brand-text"}>
                        QuizCraft
                    </div>
                    <div className={"brand-since"}>
                        Since 2024
                    </div>
                </div>
            </div>
            <div className="profile-icon-container">
                <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic" className="profile-dropdown-toggle">
                        <svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                             className="profile-icon">
                            <circle cx="12" cy="12" r="11" stroke="white" stroke-width="2" fill="none"/>
                            <circle cx="12" cy="8" r="3" fill="white"/>
                            <path d="M12 12c-3.3137085 0-6 2.6862915-6 6h12c0-3.3137085-2.6862915-6-6-6z" fill="white"/>
                        </svg>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.ItemText
                            className="dropdown-username">{user ? user.username : "Guest"}</Dropdown.ItemText>
                        <Dropdown.Divider/>
                        <Dropdown.Item as={Link} to="/home">Home</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as="button" onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}

export default Header;