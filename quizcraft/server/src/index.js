const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectToDb = require("./connectToDb");
const {addUser} = require("./controllers/userController");
const getTriviaApiOptions = require("./triviaApi/triviaApiOptions");
const {triviaApiFactory} = require("./triviaApi/triviaApi");

const app = express();
app.use(cors())

let serverData = "Nothing." // example data for simple server client interaction


// MONGODB DATABASE
// connectToDb()

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
    await addUser(data.username, data.password);
  })



  socket.on("test-trivia-api", async (body) => {
    // Technically, all question options are optional.
    const clientId = socket.id;
    const gameMode = body?.mode;
    const category = body?.category;
    const difficulty = body?.difficulty;

    // TODO verify client input

    // The TriviaApi object should be created for each individual game and stored somewhere else.
    const triviaApi = await triviaApiFactory(gameMode, category, difficulty);

    const question = await triviaApi.getNextQuestion();
    if (!question) {
      io.to(clientId).emit("test-trivia-api", {error: "couldn't retrieve question"})
    } else {
      io.to(clientId).emit("test-trivia-api", {message: question})
    }
  });

  socket.on("get-category-options", async () => {
    const categoryOptions = await getTriviaApiOptions();
    socket.emit("get-category-options", {message: categoryOptions});
  });
})
