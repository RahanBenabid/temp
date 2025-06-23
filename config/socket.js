import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "./dotenv.js";

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, config.tokenSecret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error(`Websocket authentication error: ${error}`));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);

    // join the user to the personal room
    socket.join(`user_${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconected`);
    });
  });

  return io;
}

export default initializeSocket;
