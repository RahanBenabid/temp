import jwt from "jsonwebtoken";
import config from "./../config/dotenv.js";
import db from "./../models/index.js";

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

export const canRateUser = async (req, res, next) => {
  try {
    const { orderId, orderType, rateeId } = req.body;
    const raterId = req.user.userId;

    if (!orderId || !orderType || !rateeId)
      return res.status(400).json({ message: "Missing required fields" });

    let orderCompleted = false;
    let validRelationship = false;

    if (orderType === "CLIENT_ORDER") {
      const order = await db.clientOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: " order not found" });
    }

    orderCompleted = order.status === "COMPLETED";

    // check if the relationship is valid
    if (order.clientId === raterId && order.artisanId === rateeId) {
      validRelationship = true; // client rating artisan
    } else if (order.artisanId === raterId && order.clientId === rateeId) {
      validRelationship = true; // artisan rating client
    } else if (orderType === "ARTISAN_ORDER") {
      const order = await db.artisanOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "order not found" });
      orderCompleted = order.status === "DELIVERED";

      if (order.artisanId === raterId && order.suppllierId === rateeId) {
        validRelationship = true; // artisan rating supplier
      } else if (
        order.artisanId === raterId &&
        order.deliveryManId === rateeId
      ) {
        validRelationship = true; // artian rating delivery  person
      } else if (order.suppllierId === raterId && order.artisanId === rateeId) {
        validRelationship = true; // supplier rating artisan
      } else if (
        order.deliveryManId === raterId &&
        order.artisanId === rateeId
      ) {
        validRelationship = true; // delivery man rating artisan
      }
    } else {
      return res.status(400).json({ message: "invalid order type" });
    }

    if (!orderCompleted)
      return res
        .status(400)
        .json({ message: "you can only rate after finishing the order" });

    if (!validRelationship)
      return res.status(403).json({
        message: "you are not authorized to rate this user for this order",
      });

    const existingRating = await db.rating.findOne({
      where: {
        raterId,
        rateeId,
        orderId,
        orderType,
      },
    });

    if (existingRating)
      return res.status(409).json({
        message: "you have already rated this order",
      });

    next();
    orderCompleted = order.status === "DELIVERED";
  } catch (err) {
    next(err);
  }
};
