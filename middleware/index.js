import express from "express";
import cors  from "cors";
import helmet  from "helmet";
import morgan  from "morgan";
import cookieParser  from "cookie-parser";
import errorHandler from "./errorHandler.js";

export default (app) => {
  
  // Security middlewares
  app.use(helmet());
  app.disable("x-powered-by");
  
  // CORS
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  
  // request parsing middlewares
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  
  // logging middleware
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
  
  // parse JSON requests
  app.use(express.json());

  // disable the 'X-powered-by' to improve security
  app.disable("x-powered-by");
  
  // catch-all for JSON syntax errors
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in request body",
      });
    }
    next(err);
  });


  // Error handler must be the last middleware
  app.use(errorHandler);

  console.log("applied middlewares");
};
  