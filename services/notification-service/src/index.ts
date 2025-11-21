import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { registerSocketEvents } from "./socket.js";
import "dotenv/config";
import "./worker.js"; // Start the worker

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  },
});

// handle all socket events in separate file
registerSocketEvents(io);

const PORT = process.env.PORT || 9000;

httpServer.listen(PORT, () =>
  console.log("Notification Service running on", PORT)
);

export { io };
