const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const connectToDb = require("./connectToDb");


app.use(cors())


let serverData = "Nothing." // example data for simple server client interaction


// MONGODB DATABASE
connectToDb()

// Example schema
const userSchema = new Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);


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


// WEBSOCKET CONNECTION
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'],
  },
});


server.listen(PORT, () => {
  console.log(`Socket.io server is listening on ${PORT}.`);
});


io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("client-speaks", (msg) =>{
    console.log(`Server received ${msg.data}`);
    serverData = msg.data;
    socket.emit("server-data-changed", {message: serverData});
  })

  socket.on("request-server-data", () =>{
    socket.emit("server-data-response", {message: serverData});
  })

  socket.on("add-user-to-db", (data) => {
    addUser(data.username, data.password);
  })
})
