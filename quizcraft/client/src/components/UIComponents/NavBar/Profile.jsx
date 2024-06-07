import NavBar from './NavBar.jsx';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import '../../../styles/Profile.css';
import { useState } from "react";

function Profile() {
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showPasswordChangeSuccessModal, setShowPasswordChangeSuccessModal] = useState(false); // New state for password change success modal
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handleChangePassword = () => {
        setShowChangePasswordModal(true);
    };

    const handleCloseChangePasswordModal = () => {
        setShowChangePasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordError('');
    };

    const handlePasswordSubmit = () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordError('New passwords do not match!');
            return;
        }
        console.log('Old Password:', oldPassword);
        console.log('New Password:', newPassword);
        setShowChangePasswordModal(false);
        setShowPasswordChangeSuccessModal(true);
    };

    const handleClosePasswordChangeSuccessModal = () => {
        setShowPasswordChangeSuccessModal(false);
    };

    return (
        <div className="profile">
            <NavBar />
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
                <Button variant="secondary" className="custom-profile-button"> Edit Profile </Button> {/* TODO: Implement functionality for the button (edit profile details) */}
                <Button variant="primary" className="custom-password-button" onClick={handleChangePassword}> Change Password </Button> {/* TODO: Connect DB (password) with this button */}
                <Button variant="outline-danger" className="custom-danger-button" onClick={handleDeleteProfile}> Delete Profile </Button> {/* TODO: Connect DB (user/profile) with this button */}
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
            <Modal show={showChangePasswordModal} onHide={handleCloseChangePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formOldPassword">
                            <Form.Label>Old Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter old password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <br></br>
                        </Form.Group>
                        <Form.Group controlId="formNewPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <br></br>
                        </Form.Group>
                        <Form.Group controlId="formConfirmNewPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                        </Form.Group>
                        {passwordError && <p className="text-danger">{passwordError}</p>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={handleCloseChangePasswordModal}>
                        Cancel
                    </Button>
                    <Button variant="outline-success" onClick={handlePasswordSubmit}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showPasswordChangeSuccessModal} onHide={handleClosePasswordChangeSuccessModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Password Changed</Modal.Title>
                </Modal.Header>
                <Modal.Body>Password successfully changed!</Modal.Body>
            </Modal>
        </div>
    );
}

export default Profile;