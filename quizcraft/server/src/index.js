const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser, authenticateUser, forgotPassword, getActiveUserInfo, deleteUser, updateUsername, updateEmail, changePassword, deleteUserById} = require("./controllers/userController");
const {constructDataResponse, constructErrorResponse} = require("./socketEvents/messageHelper");


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


// USER MANAGEMENT
let clientUserMapping = {}  // map socket ID to user Id

server.listen(PORT, () => {
  console.log(`Socket.io server is listening on ${PORT}.`);
});

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("add-user-to-db", async (data) => {
    const result = await addUser(data.username, data.email, data.password);
    if (result.success) {
      clientUserMapping[socket.id] = result.user._id;
    }
    socket.emit("user-added-response", result);
  })

  socket.on("delete-user-from-db", async (data) => {
    const result = await deleteUser(data.username);
    socket.emit("user-deleted-response", result);
  })

  socket.on("authenticate-user", async (data) => {
    const result = await authenticateUser(data.username, data.password);
    if (result.success) {
      clientUserMapping[socket.id] = result.user._id;
    }
    socket.emit("user-authenticated-response", result);
  });

  socket.on("forgot-password", async (data) => {
    const result = await forgotPassword(data.email);
    socket.emit("forgot-password-response", result);
  });

  socket.on("get-active-user-info", async (userId) => {
     const result = await getActiveUserInfo(userId);
     if (result.success) {
       console.log("Fetching current user success: ", result);
       socket.emit("get-active-user-info-response", constructDataResponse(result));
     }
     else {
       console.log("Fetching current user error");
       socket.emit("get-active-user-info-response", constructErrorResponse("Could not find current user"));
     }
  });

  socket.on("update-username", async (data) => {
    try {
      const result = await updateUsername(data.userId, data.newUsername);
      socket.emit("update-username-response", result);
    } catch (e) {
      console.log("Something went wrong!");
    }

  });

  socket.on("update-email", async (data) => {
    try {
      const result = await updateEmail(data.userId, data.newEmail);
      socket.emit("update-email-response", result);
    } catch (e) {
      console.log("Something went wrong!");
    }
  });

  socket.on("change-password", async (data) => {
    const result = await changePassword(data.userId, data.oldPassword, data.newPassword);
    socket.emit("change-password-response", result);
  });

  socket.on("delete-user", async (data) => {
    const result = await deleteUserById(data.userId, data.password);
    socket.emit("delete-user-response", result);
  });

  socket.on('disconnect', () => {
    delete clientUserMapping[socket.id];
    console.log(`User disconnected ${socket.id}`);
  });

  require("./socketEvents/quizEvents")(socket, io);
})

