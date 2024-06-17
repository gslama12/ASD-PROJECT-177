import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';
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
            <div className="profile-icon-container">
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic" className="profile-dropdown-toggle">
                        <img src={profileIcon} alt="Profile" className="profile-icon" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.ItemText className="dropdown-username">{user ? user.username : "Guest"}</Dropdown.ItemText>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/home">Home</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/stats">Statistics</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as="button" onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}

export default Header;