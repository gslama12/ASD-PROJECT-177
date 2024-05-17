const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser, authenticateUser, forgotPassword} = require("./controllers/userController");

const app = express();
app.use(cors())

let serverData = "Nothing." // example data for simple server client interaction


// MONGODB DATABASE
connectToDb()

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

  socket.on("add-user-to-db", async (data) => {
    const result = await addUser(data.username, data.email, data.password);
    socket.emit("user-added-response", result);
  })

  socket.on("authenticate-user", async (data) => {
    const result = await authenticateUser(data.username, data.password);
    socket.emit("user-authenticated-response", result);
  });

  socket.on("forgot-password", async (data) => {
    const result = await forgotPassword(data.email);
    socket.emit("forgot-password-response", result);
  });
})
