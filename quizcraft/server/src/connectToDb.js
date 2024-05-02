const mongoose = require('mongoose');

const uri = "mongodb+srv://asd:asd@cluster0.3cdlamh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


function connectToDb() {
    try {
        const dbConnection = mongoose.connect(uri)
        console.log("Connected to DB");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectToDb;