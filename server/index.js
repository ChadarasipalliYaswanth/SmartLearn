import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
const createUploadDirectories = () => {
  const dirs = ["uploads", "uploads/videos", "uploads/notes", "uploads/images"];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};
createUploadDirectories();

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));
app.use("/uploads/videos", express.static("uploads/videos"));
app.use("/uploads/notes", express.static("uploads/notes"));
app.use("/uploads/images", express.static("uploads/images"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chatRoutes.js";
import assignmentRoutes from "./routes/assignment.js";
import meetingRoutes from "./routes/meeting.js";
import testRoutes from "./routes/test.js";
import aiRoutes from "./routes/aiRoutes.js";

// using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", assignmentRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api", testRoutes);
app.use("/api/ai", aiRoutes);

// Socket.IO connection handling
const onlineUsers = new Set(); // Track online users

io.on('connection', (socket) => {
  console.log('A user connected');
  let currentUserId = null;

  socket.on('join', (userId) => {
    currentUserId = userId;
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
    
    // Add user to online users
    onlineUsers.add(userId);
    
    // Broadcast updated online users list to all clients
    io.emit('userStatus', {
      onlineUsers: Array.from(onlineUsers)
    });
  });

  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('newMessage', {
      senderId: data.senderId,
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    
    // Remove user from online users
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      
      // Broadcast updated online users list
      io.emit('userStatus', {
        onlineUsers: Array.from(onlineUsers)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});