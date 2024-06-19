import React, { useState } from 'react';
import "../../../styles/MultiplayerWaitingScreen.css";

const MultiplayerWaitingScreen = () => {
    const [showNotification, setShowNotification] = useState(true);

    const handleCloseNotification = () => {
        setShowNotification(false);
    };

    return (
        <div className="multiplayer-waiting-screen">
            {showNotification && (
                <div className="notification">
                    <p>You are now waiting in the queue.</p>
                    <button className="close-button" onClick={handleCloseNotification}>
                        &times;
                    </button>
                </div>
            )}
            <div className="loader"></div>
            <h2>Waiting for another player to join...</h2>
        </div>
    );
};

export default MultiplayerWaitingScreen;
