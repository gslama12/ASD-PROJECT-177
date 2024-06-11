const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser, authenticateUser, forgotPassword, getActiveUserInfo, deleteUser} = require("./controllers/userController");


const app = express();
app.use(cors())


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

  socket.on("get-active-user-info", async (data) => {
    const result = await getActiveUserInfo(data.userId);
    socket.emit("active-user-info-response", result);
  });

  socket.on("delete-user-from-db", async (data) => {
    const result = await deleteUser(data.username);
    socket.emit("user-deleted-response", result);
  })

  require("./socketEvents/quizEvents")(socket, io);
})
