import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "../../../styles/ChallengeSelectionComponentStyle.css";

const challenges = [
    { name: "Time Attack", description: "Answer as many questions as you can within the time limit.", className: "time-attack-card" },
    { name: "Lives Challenge", description: "You have 3 lives. Answer correctly to stay in the game!", className: "lives-challenge-card" }
];

function ChallengeSelectionComponent() {
    const navigate = useNavigate();
    const [timeAttackTime, setTimeAttackTime] = useState(60);
    const [lives, setLives] = useState(3);

    const handleChallengeClick = (challenge) => {
        if (challenge.name === "Time Attack") {
            navigate(`/challenge/${challenge.name.toLowerCase().replace(" ", "")}`, { state: { time: timeAttackTime } });
        } else {
            navigate(`/challenge/${challenge.name.toLowerCase().replace(" ", "")}`, { state: { lives: lives } });
        }
    };

    return (
        <div className="challenge-selection-container">
            <h1>Select Your Challenge</h1>
            <div className="mode-cards-container">
                {challenges.map((challenge, index) => (
                    <div key={index} className="mode-card-container">
                        <div className={`mode-card ${challenge.className}`} onClick={() => handleChallengeClick(challenge)}>
                            <h2>{challenge.name}</h2>
                            <p>{challenge.description}</p>
                        </div>
                        {challenge.name === "Time Attack" && (
                            <div className="control-container">
                                <div className="time-control">
                                    <button onClick={(e) => { e.stopPropagation(); setTimeAttackTime(Math.max(30, timeAttackTime - 30)); }}>-</button>
                                    <span>{timeAttackTime} seconds</span>
                                    <button onClick={(e) => { e.stopPropagation(); setTimeAttackTime(Math.min(180, timeAttackTime + 30)); }}>+</button>
                                </div>
                            </div>
                        )}
                        {challenge.name === "Lives Challenge" && (
                            <div className="control-container">
                                <div className="lives-control">
                                    {[3, 4, 5].map(l => (
                                        <button key={l} onClick={(e) => { e.stopPropagation(); setLives(l); }} className={l === lives ? 'selected' : ''}>
                                            {l} lives
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChallengeSelectionComponent;
