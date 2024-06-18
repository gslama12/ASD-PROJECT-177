import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import '../../../styles/ProfileStyles.css';
import React, { useState, useEffect } from "react";
import { useUser } from '../../../UserContext';
import { useNavigate } from 'react-router-dom';

function Profile({ socket }) {
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: "",
        id: "",
        email: "",
        password: ""
    });
    const [initialProfile, setInitialProfile] = useState({
        name: "",
        id: "",
        email: "",
        password: ""
    });
    const [editingField, setEditingField] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showPasswordChangeSuccessModal, setShowPasswordChangeSuccessModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);

    useEffect(() => {
        if (user) {
            socket.emit("get-active-user-info", user._id);
            const initial = {
                name: user.username,
                id: user._id,
                email: user.email || "place.holder@gmail.com",
                password: user.password || "placeholder"
            };
            setProfile(initial);
            setInitialProfile(initial);
        }
    }, [user]);

    useEffect(() => {
        socket.on("get-active-user-info-response", (response) => {
            console.log('retrieving user info:', response.data.success);
            if (response.data.success) {
                const userData = response.data.user;
                const updatedProfile = {
                    name: userData.username,
                    id: userData._id,
                    email: userData.email || "place.holder@gmail.com",
                    password: user.password || "placeholder"
                };
                setProfile(updatedProfile);
                setInitialProfile(updatedProfile);
            } else {
                console.error('Error retrieving user info:', response);
            }
        });

        socket.on("update-username-response", (response) => {
            console.log('updating username:', response);
            if (response.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    name: response.user.username
                }));
                setUser(response.user);
            } else {
                console.error('Error updating username:', response.message);
            }
            setEditingField(null);
        });

        socket.on("update-email-response", (response) => {
            if (response.success) {
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    email: response.user.email
                }));
                setUser(response.user);
            } else {
                console.error('Error updating email:', response.message);
            }
            setEditingField(null);
        });

        socket.on("change-password-response", (response) => {
            console.log("Change Password: ", response);
            if (response.success) {
                setShowChangePasswordModal(false);
                setPasswordSuccessMessage(response.message);
                setShowPasswordChangeSuccessModal(true);
            } else {
                setPasswordError(response.message);
            }
        });

        return () => {
            socket.off("get-active-user-info-response");
            socket.off("update-username-response");
            socket.off("update-email-response");
            socket.off("change-password-response");
        };
    }, [socket]);

    const handleFieldClick = (field) => {
        setEditingField(field);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleFieldBlur = () => {
        if (editingField === 'name') {
            socket.emit("update-username", { userId: profile.id, newUsername: profile.name });
        } else if (editingField === 'email') {
            socket.emit("update-email", { userId: profile.id, newEmail: profile.email });
        }
        setEditingField(null);
    };

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
        setShowEditProfileModal(false);
        if (profile.name !== initialProfile.name) {
            socket.emit("update-username", { userId: profile.id, newUsername: profile.name });
        }
        if (profile.email !== initialProfile.email) {
            socket.emit("update-email", { userId: profile.id, newEmail: profile.email });
        }
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
            setUser(null);
            navigate("/login");
        }, 2000);

        // socket.emit("delete-user-from-db", { username });
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
        setPasswordSuccessMessage('');
    };

    const validateProfilePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const minLength = password.length >= 8;

        if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
        if (!hasNumber) return "Password must contain at least one number.";
        if (!hasSpecialChar) return "Password must contain at least one special character.";
        if (!minLength) return "Password must be at least 8 characters long.";

        return "";
    };

    const handlePasswordSubmit = () => {
        const passwordValidationError = validateProfilePassword(newPassword);
        console.log("Submit Password");
        if (passwordValidationError) {
            console.log("Submit Password ERROR");
            setPasswordError(passwordValidationError);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordError('New passwords do not match!');
            return;
        }

        socket.emit("change-password", { userId: profile.id, oldPassword, newPassword });
    };

    const handleClosePasswordChangeSuccessModal = () => {
        setShowPasswordChangeSuccessModal(false);
    };

    return (
        <div className="profile-container">
            <h1> Profile </h1>
            <div className="profile-content">
                <br />
                <p> Welcome to your profile, {user ? profile.name : "Guest"}! </p>
                <p onClick={() => handleFieldClick('name')}>
                    Username: {editingField === 'name' ? (
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleFieldChange}
                        onBlur={handleFieldBlur}
                        autoFocus
                    />
                ) : (
                    profile.name
                )}
                </p>
                <p onClick={() => handleFieldClick('email')}>
                    E-Mail: {editingField === 'email' ? (
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleFieldChange}
                        onBlur={handleFieldBlur}
                        autoFocus
                    />
                ) : (
                    profile.email
                )}
                </p>
                <p> ID: {profile.id} </p>
                <br />
                <br />
                <Button variant="primary" className="custom-profile-button" onClick={handleEditProfile}> Edit Profile </Button>
                <Button variant="primary" className="custom-password-button" onClick={handleChangePassword}> Change Password </ Button>
                <Button variant="outline-danger" className="custom-danger-button" onClick={handleDeleteProfile}> Delete Profile </ Button>
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
                            <br />
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
                        {passwordSuccessMessage && <p className="text-success">{passwordSuccessMessage}</p>}
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
