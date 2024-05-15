import NavBar from "./NavBar.jsx";
import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import './Header1.css';
import multipleChoiceImage from './mc.png';
import trueFalseImage from './true_false.png';
import { Link } from 'react-router-dom';


function HomeComponent({ socket }) {
    const [contentValue, setContentValue] = useState("");
    const [textInputValue, setTextInputValue] = useState("");

    // request server data on init
    socket.emit("request-server-data");
    useEffect(() => {
        socket.on("server-data-response", (data) => {
            setContentValue(data.message);
        })
    }, [socket]);

    // update text area on server data change
    useEffect(() => {
        socket.on("server-data-changed", (data) => {
            setContentValue(data.message);
        })
    }, [socket]);


    const onTextInputChange = (event) => {
        setTextInputValue(event.target.value); // Update input value on change
    }

    const onSendButtonClick = () => {
        socket.emit("client-speaks", { data: textInputValue });
    }

    return (
        <>
            <NavBar />

            <br></br>
            <br></br>
            <h1 className="centered-header">Choose your Game-Mode</h1>
            <br></br>
            <br></br>
            <div className="d-flex justify-content-around">
                <Card style={{ width: '36rem' }}>
                    <Link to="/quizfinished"> // TODO CHANGE LINK TO SAMUEL
                        <Card.Img variant="top" src={multipleChoiceImage} />
                    </Link>
                    <Card.Body>
                        <Card.Title><h3>Multiple Choice</h3></Card.Title>
                        <Card.Text>
                            Choose the correct answer from a list of options
                        </Card.Text>
                    </Card.Body>
                </Card>
                <Card style={{ width: '36rem' }}>
                    <Link to="/quizfinished"> // TODO CHANGE LINK TO SAMUEL
                        <Card.Img variant="top" src={trueFalseImage} />
                    </Link>
                    <Card.Body>
                        <Card.Title><h3>True or False</h3></Card.Title>
                        <Card.Text>
                            Choose whether a statement is true or false
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </>
    )
}

export default HomeComponent;
