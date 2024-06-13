const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser, authenticateUser, forgotPassword, getActiveUserInfo} = require("./controllers/userController");
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

  // unused:
  // socket.on("get-active-user-info", async () => {
  //   const result = await getActiveUserInfo(clientUserMapping[socket.id]);
  //   if (result.success) {
  //     socket.emit("get-active-user-info", constructDataResponse(result));
  //   }
  //   else {
  //     socket.emit("get-active-user-info", constructErrorResponse("Could not find current user"));
  //   }
  // });

  socket.on('disconnect', () => {
    delete clientUserMapping[socket.id];
    console.log(`User disconnected ${socket.id}`);
  });

  require("./socketEvents/quizEvents")(socket, io);
})

