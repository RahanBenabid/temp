import {
  ValidationError,
  DatabaseError,
  TimeoutError,
  UniqueConstraintError,
} from "sequelize";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // sequelize errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: "Database error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }

  if (err instanceof TimeoutError) {
    return res.status(408).json({
      success: false,
      message: "Request timeout",
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Invalid request body format",
    });
  }

  // file upload errors from multer
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file upload field",
    });
  }

  // custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  // error handler for unhandled errors
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
