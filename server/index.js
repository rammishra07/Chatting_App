const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Demo users
const demoUsers = ["Ram", "Shyam", "Rahul", "Priya"];

// username(lowercase) -> socket.id
const onlineUsers = {};

// conversationId -> messages
const conversations = {};

// Convert username to lowercase
const normalize = (name) => name.trim().toLowerCase();

// Return display name with proper capitalization
function getDisplayName(name) {
  const user = demoUsers.find(
    (u) => u.toLowerCase() === normalize(name)
  );

  return user || name;
}

// Conversation id
function getConversationId(user1, user2) {
  return [normalize(user1), normalize(user2)]
    .sort()
    .join("_");
}

// Sidebar users (hide yourself)
function getVisibleUsers(username) {
  const current = normalize(username);

  return demoUsers.filter(
    (user) => normalize(user) !== current
  );
}

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // ================= LOGIN =================

  socket.on("login", (username) => {
    username = normalize(username);

    socket.username = username;
    onlineUsers[username] = socket.id;

    console.log(`${username} logged in`);
    console.log("Online users:", onlineUsers);

    // Update sidebar for every logged in user
    Object.keys(onlineUsers).forEach((user) => {
      io.to(onlineUsers[user]).emit(
        "userList",
        getVisibleUsers(user)
      );
    });
  });

  // ================= LOAD CHAT =================

  socket.on("getConversation", ({ sender, receiver }) => {
    sender = normalize(sender);
    receiver = normalize(receiver);

    const id = getConversationId(sender, receiver);

    socket.emit(
      "conversationHistory",
      conversations[id] || []
    );
  });

  // ================= SEND MESSAGE =================

  socket.on("sendMessage", ({ sender, receiver, text }) => {
    sender = normalize(sender);
    receiver = normalize(receiver);

    const id = getConversationId(sender, receiver);

    const message = {
      sender: getDisplayName(sender),
      receiver: getDisplayName(receiver),
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    if (!conversations[id]) {
      conversations[id] = [];
    }

    conversations[id].push(message);

    console.log(
      `${message.sender} -> ${message.receiver}: ${message.text}`
    );

    // Send to sender
    if (onlineUsers[sender]) {
      io.to(onlineUsers[sender]).emit(
        "receiveMessage",
        message
      );
    }

    // Send to receiver
    if (onlineUsers[receiver]) {
      io.to(onlineUsers[receiver]).emit(
        "receiveMessage",
        message
      );
    }
  });

  // ================= DISCONNECT =================

  socket.on("disconnect", () => {
    if (!socket.username) return;

    console.log(`${socket.username} disconnected`);

    delete onlineUsers[socket.username];

    Object.keys(onlineUsers).forEach((user) => {
      io.to(onlineUsers[user]).emit(
        "userList",
        getVisibleUsers(user)
      );
    });
  });
});

server.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000");
});