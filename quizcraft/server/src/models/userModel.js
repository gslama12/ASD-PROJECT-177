const mongoose = require('mongoose');

// Example schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
});

// Registration Schema
const registrationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
});

const UserLogin = mongoose.model("UserLogin", userSchema);
const UserRegistration = mongoose.model("UserRegistration", registrationSchema);

module.exports = {
    UserLogin,
    UserRegistration
};