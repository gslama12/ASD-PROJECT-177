import { useState, useEffect } from 'react';
import "../../../styles/MultiplayerWaitingScreen.css";

const MultiplayerWaitingScreen = () => {
    const [showNotification, setShowNotification] = useState(true);
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "Waiting for another player to join...";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index < fullText.length) {
                    return prev + fullText[index++];
                } else {
                    clearInterval(interval);
                    return prev;
                }
            });
        }, 35); // Adjust the speed by changing the interval duration

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

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
            <h2>{displayedText}</h2>
        </div>
    );
};

export default MultiplayerWaitingScreen;
