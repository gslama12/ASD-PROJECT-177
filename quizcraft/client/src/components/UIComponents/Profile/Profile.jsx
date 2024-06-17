import React from 'react';
import './ProfileStyles.css';
import { useUser } from "../../../UserContext";

function Profile() {
    const { user } = useUser();
    return (
        <>
            <div className="profile-container">
                <h1 className="centered-header">Profile</h1>
                <p>Welcome to your profile, {user ? user.username : "Guest"}!</p>
                {/* Additional profile information and settings can be added here */}
            </div>
        </>
    );
}

export default Profile;
