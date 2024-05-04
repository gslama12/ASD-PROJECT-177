const { UserLogin, UserRegistration } = require('../models/userModel');

// Function to add a new user (registration)
async function addUser(username, email, password) {
    try {
        // Check if user exists
        let existingUser = await UserRegistration.findOne({ username });
        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        const newUser = new UserRegistration({ username, email, password });
        await newUser.save();
        console.log('User added successfully:', newUser);
        return { success: true, user: newUser };
    } catch (error) {
        console.error('Error adding user:', error.message);
        return { success: false, message: error.message };
    }
}

// Function to authenticate a user (login)
async function authenticateUser(username, password) {
    try {
        const user = await UserLogin.findOne({ username, password });
        if (user) {
            console.log('User authenticated successfully:', user);
            return { success: true, user };
        } else {
            console.log('Authentication failed');
            return { success: false, message: "Invalid username or password" };
        }
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = {
    addUser,
    authenticateUser
};
