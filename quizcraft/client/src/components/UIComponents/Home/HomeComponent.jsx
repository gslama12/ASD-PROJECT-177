import { Link } from 'react-router-dom';
import "../../../styles/HomeComponentStyle.css";

function HomeComponent() {
    return (
        <>
            <div className="home-container">
                <div className={"home-content"}>
                    <div className="mode-cards-container">
                        <div className="mode-card quiz-card">
                            <Link to="/quizmode" className="mode-link">
                                <h2>Quiz</h2>
                                <p>Try your knowledge in various topics!</p>
                            </Link>
                        </div>
                        <div className="mode-card trivia-card">
                            <Link to="/triviamode" className="mode-link">
                                <h2>Trivia</h2>
                                <p>Go full on trivia mode and reach highscores!</p>
                            </Link>
                        </div>
                        <div className="mode-card challenges-card">
                            <Link to="/challengemode" className="mode-link">
                                <h2>Challenges</h2>
                                <p>Test your skills with our weekly challenges!</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomeComponent;
