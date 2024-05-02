const User = require('../models/userModel');

// Function to add a new user
async function addUser(username, password) {
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        console.log('User added successfully:', newUser);
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

module.exports = {
    addUser
};