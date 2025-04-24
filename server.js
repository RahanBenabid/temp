import express from "express";

import config from "./config/dotenv.js";
import connectDB from "./config/dbConfig.js";
import routes from "./routes/index.js";
import middlewares from "./middleware/index.js";

const app = express();
const PORT = config.port;

// connect to the database
connectDB();

// apply middlewares
middlewares(app);

// global route handler
app.use("/", routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route doesn't exist" });
});

// Global Error Handler
app.use((err, req, res, next) => {
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
app.listen(PORT, () => {
  console.log(`Server is live @ ${config.hostUrl}`);
});
