import { createServer } from "node:http";

import express from "express";

import connectDB from "./config/dbConfig.js";
import config from "./config/dotenv.js";
import initializeSocket from "./config/socket.js";
import middlewares from "./middleware/index.js";
import routes from "./routes/index.js";

const PORT = config.port;

const app = express();

// setup the socket connection
const server = createServer(app);
const io = initializeSocket(server);
app.set("io", io);

// connect to the database
connectDB();

// apply middlewares
middlewares(app);

// global route handler
app.use("/", routes);

// 404 Handler
app.use((_request, response) => {
  response.status(404).json({ success: false, message: "Route doesn't exist" });
});

// Global Error Handler
app.use((error, _request, response) => {
  console.error(error.stack);

  // Default 500 error
  response.status(500).json({
    success: false,
    message: "Something went wrong",
    error:
      config.nodeEnv === "production" ? "Internal server error" : error.message,
  });
});

// start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on all interfaces:3000");
});
