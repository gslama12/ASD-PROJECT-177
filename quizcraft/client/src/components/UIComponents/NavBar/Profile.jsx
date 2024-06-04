import NavBar from './NavBar.jsx';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../../../styles/Profile.css';
import {useState} from "react";

function Profile() {
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleDeleteProfile = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmDelete = () => {
        setShowModal(false);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
            window.location.href = "/login";
        }, 2000);
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <div className="profile">
            <NavBar/>
            <div className="header-container">
                <h1> Profile </h1>
            </div>
            <div className="profile-container">
                <p> HIER KÖNNTE IHR PROFIL STEHEN... </p>
                <p> Name: Max Mustermann </p>
                <p> Age: 22 Years </p>
                <p> Job: Student </p>
                <p> E-Mail: max.mustermann@gmail.com </p>
                <p> HIER KÖNNTE IHR PROFIL STEHEN... </p>
            </div>
            <div className="button-container">
                <Button variant="primary" className="custom-password-button"> Change Password </Button>
                <Button variant="outline-danger" className="custom-danger-button" onClick={handleDeleteProfile}> Delete Profile </Button>
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
            <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Profile Deleted</Modal.Title>
                </Modal.Header>
                <Modal.Body>Profile successfully deleted!</Modal.Body>
            </Modal>
        </div>
    );
}

export default Profile;
