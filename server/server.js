import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// store connected users
export const userSocketMap = {}; //userId: socketId

// Socket.io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("UserConnected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  //emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("UserDisconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.get("/api/status", (req, res) => {
  res.json({ status: "Server is running ✅" });
});

// ✅ Fix: Added missing slash
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Start the server
const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production") {
      // Connect MongoDB first
      const PORT = process.env.PORT || 5000;
      server.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
      );
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();

export default server;