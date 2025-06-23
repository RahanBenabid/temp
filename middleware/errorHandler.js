import process from "node:process";
import {
  DatabaseError,
  TimeoutError,
  UniqueConstraintError,
  ValidationError,
} from "sequelize";

const errorHandler = (error, request, response, next) => {
  console.error(error);

  // sequelize errors
  if (error instanceof ValidationError) {
    return response.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((error_) => ({
        field: error_.path,
        message: error_.message,
      })),
    });
  }

  if (error instanceof UniqueConstraintError) {
    return response.status(409).json({
      success: false,
      message: "Resource already exists",
      errors: error.errors.map((error_) => ({
        field: error_.path,
        message: error_.message,
      })),
    });
  }

  if (error instanceof DatabaseError) {
    return response.status(500).json({
      success: false,
      message: "Database error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }

  if (error instanceof TimeoutError) {
    return response.status(408).json({
      success: false,
      message: "Request timeout",
    });
  }

  // JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({
      success: false,
      message: "Invalid JSON",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Invalid request body format",
    });
  }

  // file upload errors from multer
  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({
      success: false,
      message: "File too large",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return response.status(400).json({
      success: false,
      message: "Unexpected file upload field",
    });
  }

  // custom application errors
  if (error.isOperational) {
    return response.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }

  // error handler for unhandled errors
  const statusCode = error.statusCode || error.status || 500;

  return response.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export default errorHandler;
