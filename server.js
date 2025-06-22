import express from "express";
import connectDB from "./config/dbConfig.js";
import config from "./config/dotenv.js";
import middlewares from "./middleware/index.js";
import routes from "./routes/index.js";

const app = express();
const PORT = config.port;

// connect to the database
connectDB();

// apply middlewares
middlewares(app);

// global route handler
app.use("/", routes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route doesn't exist" });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);

  // Default 500 error
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error:
      config.nodeEnv === "production" ? "Internal server error" : err.message,
  });
});

// start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on all interfaces:3000");
});
