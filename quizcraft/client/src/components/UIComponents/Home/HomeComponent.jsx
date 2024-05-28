import NavBar from "../NavBar/NavBar.jsx";
import Card from 'react-bootstrap/Card';
import '../GenericStyles/CenteredHeader.css';
import multipleChoiceImage from '../../../assets/mc.png';
import trueFalseImage from '../../../assets/true_false.png';
import { Link } from 'react-router-dom';


function HomeComponent({ socket }) {
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
                    <Link to="/quizfinished">  {/* TODO: change Link to redirect to quiz mode */}
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
                    <Link to="/quizfinished">  {/* TODO: change Link to redirect to quiz mode */}
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
