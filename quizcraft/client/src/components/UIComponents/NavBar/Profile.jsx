import NavBar from './NavBar.jsx';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import '../../../styles/Profile.css';
import { useState } from "react";

function Profile() {
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);

    const [profile, setProfile] = useState({
        name: "Max Mustermann",
        age: 22,
        job: "Student",
        email: "max.mustermann@gmail.com"
    });

    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showPasswordChangeSuccessModal, setShowPasswordChangeSuccessModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleEditProfile = () => {
        setShowEditProfileModal(true);
    };

    const handleCloseEditProfileModal = () => {
        setShowEditProfileModal(false);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleProfileSubmit = () => {
        console.log('Profile updated:', profile);
        setShowEditProfileModal(false);
    };

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
                <p> Name: {profile.name} </p>
                <p> Age: {profile.age} Years </p>
                <p> Job: {profile.job} </p>
                <p> E-Mail: {profile.email} </p>
            </div>
            <div className="button-container">
                <Button variant="secondary" className="custom-profile-button" onClick={handleEditProfile}> Edit Profile </Button>
                <Button variant="primary" className="custom-password-button" onClick={handleChangePassword}> Change Password </Button>
                <Button variant="outline-danger" className="custom-danger-button" onClick={handleDeleteProfile}> Delete Profile </Button>
            </div>
            <Modal show={showEditProfileModal} onHide={handleCloseEditProfileModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                            />
                            <br/>
                        </Form.Group>
                        <Form.Group controlId="formAge">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                                type="number"
                                name="age"
                                value={profile.age}
                                onChange={handleProfileChange}
                            />
                            <br/>
                        </Form.Group>
                        <Form.Group controlId="formJob">
                            <Form.Label>Job</Form.Label>
                            <Form.Control
                                type="text"
                                name="job"
                                value={profile.job}
                                onChange={handleProfileChange}
                            />
                            <br/>
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={handleCloseEditProfileModal}>
                        Cancel
                    </Button>
                    <Button variant="outline-success" onClick={handleProfileSubmit}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
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
                            <br />
                        </Form.Group>
                        <Form.Group controlId="formNewPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <br />
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
