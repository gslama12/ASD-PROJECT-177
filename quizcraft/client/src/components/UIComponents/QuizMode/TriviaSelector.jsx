import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import "../../../styles/TriviaSelectorStyle.css";
import Header from "../Generic/Header.jsx";

// Note: Code generated by AI
const TriviaSelector = ({ onStart }) => {
    const [selectedMode, setSelectedMode] = useState('');
    const [numberOfRounds, setNumberOfRounds] = useState(10);

    const sendSelection = () => {
        if (selectedMode && numberOfRounds) {
            onStart({ mode: selectedMode, rounds: numberOfRounds });  // send settings to parent
        }
        else {
            alert("Please select a mode before starting the game.");
        }
    }

    const onModeInput = (event) => {
        if (event.target.id === 'singlePlayerRadioButton') {
            setSelectedMode("single-player");
        } else if (event.target.id === 'multiPlayerRadioButton') {
            setSelectedMode("multi-player");
        }
    };

  const onRangeInput = (event) => {
    const value = event.target.value;
    setNumberOfRounds(value);
  };

    return (
            <div className="selector-page">
                <div className={"main-container-selector"}>
                    <div className={"header"}>
                        OPTIONS
                    </div>
                    <div className={"content"}>
                        <div className={"option-container"}>
                            <div className={"option-label"}>
                                MODE
                            </div>
                            <div className={"option-selector"}>
                                <div className={"radio-container"}>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="flexRadioDefault"
                                               id="singlePlayerRadioButton" onChange={onModeInput}/>
                                        <label className="form-check-label" htmlFor="flexRadioDefault1">
                                            Single-Player
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="flexRadioDefault"
                                               id="multiPlayerRadioButton" onChange={onModeInput}/>
                                        <label className="form-check-label" htmlFor="flexRadioDefault2">
                                            Multi-Player
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={"option-container"}>
                            <div className={"option-label"}>
                                ROUNDS
                            </div>
                            <div className={"option-selector-range"}>
                                <input type="range" id="range" className="form-range" min="1" max="20" onInput={onRangeInput}/>
                                <p id={"num-rounds"}>{numberOfRounds}</p>
                            </div>
                        </div>
                        <div className={"button-container"}>
                            <button type="button" id="start-button" className="btn btn-primary" onClick={sendSelection}>START</button>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default TriviaSelector;