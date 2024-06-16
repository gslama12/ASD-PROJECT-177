import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import profileIcon from '../../../assets/profile_icon.png';
import { useUser } from '../../../UserContext';

function Header() {
    const { user } = useUser();

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
                        <Dropdown.Item href="/home">Home</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item href="/login">Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}

export default Header;
