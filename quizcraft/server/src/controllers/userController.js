const { User } = require('../models/userModel');
const bcrypt = require('bcrypt');

// Function to add a new user (registration)
async function addUser(username, email, password) {
    try {
        // Check if user exists
        let existingUser = await User.findOne({ username });
        if (existingUser) {
            return { success: false, message: "User already exists" };
        }
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
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
        const user = await User.findOne({username});
        if (user && await bcrypt.compare(password, user.password)) {
            console.log('User authenticated successfully:', user);
            return {success: true, user};
        } else {
            console.log('Authentication failed for username: ', username);
            return {success: false, message: "Invalid username or password"};
        }
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        return {success: false, message: error.message};
    }
}

module.exports = {
    addUser,
    authenticateUser
};