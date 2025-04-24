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
