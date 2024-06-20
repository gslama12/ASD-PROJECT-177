import React, { useState } from 'react';
import "../../../styles/TriviaSelectorStyle.css";

function QuizSelector({ onStart }) {
    const [selectedMode, setSelectedMode] = useState('');
    const [numberOfRounds, setNumberOfRounds] = useState(10);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    const sendSelection = () => {
        if (selectedMode && numberOfRounds && selectedCategory && selectedDifficulty) {
            onStart({ mode: selectedMode, rounds: numberOfRounds, category: selectedCategory, difficulty: selectedDifficulty });  // send settings to parent
        }
        else {
            alert("Please select all options before starting the game.");
        }
    }

    const onModeInput = (event) => {
        if (event.target.id === 'singlePlayerRadioButton') {
            setSelectedMode("single-player");
        } else if (event.target.id === 'multiPlayerRadioButton') {
            setSelectedMode("multi-player");
        }
    };

    const onCategoryInput = (event) => {
        setSelectedCategory(event.target.value);
    };

    const onDifficultyInput = (event) => {
        setSelectedDifficulty(event.target.value);
    };

    const onRangeInput = (event) => {
        const value = event.target.value;
        setNumberOfRounds(value);
    };

    return (
        <div className="selector-page">
            <div className={"main-container-selector_quiz"}>
                <div className={"header_trivia"}>
                    OPTIONS
                </div>
                <div className={"content_trivia"}>
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
                            CATEGORY
                        </div>
                        <div className={"option-selector"}>
                            <select id="category" onChange={onCategoryInput}>
                                <option value="">--Please choose an option--</option>
                                <option value="21">Sports</option>
                                <option value="23">History</option>
                                <option value="22">Geography</option>
                                <option value="27">Animals</option>
                                {/* Add more categories as needed */}
                            </select>
                        </div>
                    </div>
                    <div className={"option-container"}>
                        <div className={"option-label"}>
                            DIFFICULTY
                        </div>
                        <div className={"option-selector"}>
                            <select id="difficulty" onChange={onDifficultyInput}>
                                <option value="">--Please choose an option--</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
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
                    <div className={"button-container_quiz"}>
                        <button type="button" id="start-button" className="btn btn-primary" onClick={sendSelection}>START</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizSelector;