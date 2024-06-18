const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser, authenticateUser, forgotPassword, getActiveUserInfo, deleteUser} = require("./controllers/userController");
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

  /*
  // change password:
  socket.on("change-password", async (data) => {
    const result = await changePassword(data);
    socket.emit("change-password-response", result);
  });

  // change user data:
  socket.on("change-user-data", async (data) => {
    const result = await changeUserData(data);
    socket.emit("change-user-data-response", result);
  });
  */

  socket.on("get-active-user-info", async (userId) => {
     const result = await getActiveUserInfo(userId);
     if (result.success) {
       console.log("Fetching current user success");
       socket.emit("get-active-user-info-response", constructDataResponse(result));
     }
     else {
       console.log("Fetching current user error");
       socket.emit("get-active-user-response", constructErrorResponse("Could not find current user"));
     }
  });

  socket.on('disconnect', () => {
    delete clientUserMapping[socket.id];
    console.log(`User disconnected ${socket.id}`);
  });

  require("./socketEvents/quizEvents")(socket, io);
})

