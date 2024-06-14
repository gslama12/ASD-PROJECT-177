import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

// Note: Code generated by AI
const MultiplayerSelector = ({ onSelect }) => {
    const [selectedMode, setSelectedMode] = useState('');

    const handleSelect = (mode) => {
        setSelectedMode(mode);
        if (onSelect) {
            onSelect(mode); // Notify parent component about the selection
        }
    };

    return (
        <div className="d-flex justify-content-center gap-2">
            <Button onClick={() => handleSelect('singlePlayer')} variant={selectedMode === 'singlePlayer'? 'primary' : 'outline-primary'}>
                Single Player
            </Button>
            <Button onClick={() => handleSelect('multiplayer')} variant={selectedMode === 'multiplayer'? 'primary' : 'outline-primary'}>
                Multiplayer
            </Button>
        </div>
    );
};

export default MultiplayerSelector;