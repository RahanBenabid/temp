import jwt from "jsonwebtoken";
import config from "./../config/dotenv.js";

export const restrictToAdminForSpecialRoles = (req, res, next) => {
  const role = req.body.role?.toUpperCase();

  if (!role || role === "CLIENT") {
    return next(); // No restrictions for CLIENT or no role
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, config.tokenSecret, (error, user) => {
    if (error) {
      console.error("Token verification failed:", error);
      return res.sendStatus(403);
    }

    req.user = user;

    const requesterRole = user.role?.toUpperCase();
    const validRoles = [
      "ADMIN",
      "CLIENT",
      "ARTISAN",
      "SUPPLIER",
      "DELIVERY_MAN",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role !== "CLIENT" && requesterRole !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only ADMIN can create non-CLIENT users" });
    }

    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).send("Admin verification failed");
  }
  next();
};

export const isClient = (req, res, next) => {
  if (req.user.role === "CLIENT" || req.user.role === "ADMIN") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied: Client role required" });
};

export const isArtisan = (req, res, next) => {
  if (req.user.role === "ARTISAN" || req.user.role === "ADMIN") {
    return next();
  }
  return res
  .status(403)
  .json({ message: "Access denied: Artisan role required" });
};

export const isSupplier = (req, res, next) => {
  if (req.user.role === "SUPPLIER" || req.user.role === "ADMIN") {
    return next();
  }
  return res
  .status(403)
  .json({ message: "Access denied: Supplier role required" });
};

export const isDeliveryMan = (req, res, next) => {
  if (req.user.role === "DELIVERY_MAN" || req.user.role === "ADMIN") {
    return next();
  }
  return res
  .status(403)
  .json({ message: "Access denied: Delivery Man role required" });
};
