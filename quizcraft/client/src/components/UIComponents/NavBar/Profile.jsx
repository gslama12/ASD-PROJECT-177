import NavBar from './NavBar.jsx';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../../../styles/Profile.css';
import {useState} from "react";

function Profile() {
    const [showModal, setShowModal] = useState(false);

    const handleDeleteProfile = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmDelete = () => {
        // PROFILE DELETE LOGIC
        setShowModal(false);
    };

    return (
        <div className="profile-container">
            <NavBar/>
            <br/><br/>
            <br/><br/>
            <div className="header-container">
                <h1> Profile </h1>
            </div>
            <br/><br/>
            <div className="button-container">
                <button className="custom-button" onClick={handleDeleteProfile}> Delete Profile </button>
            </div>
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete your profile?</Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="outline-success" onClick={handleConfirmDelete}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;
