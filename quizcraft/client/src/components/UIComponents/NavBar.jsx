import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import SplitButton from 'react-bootstrap/SplitButton';
import './NavBar.css';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-custom">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/home" style={{color: 'white'}}>QuizCraft</a>                    
                    <div className="d-flex" id="navbarSupportedContent" style={{color: 'white'}}>
                        <li className="nav-item dropdown ms-auto">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Max Mustermann
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item href="/login">Logout</Dropdown.Item>
                            </ul>
                        </li>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default NavBar;

