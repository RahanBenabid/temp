import jwt from "jsonwebtoken";
import config from "./../config/dotenv.js";
import database from "./../models/index.js";

export const restrictToAdminForSpecialRoles = (request, response, next) => {
  const role = request.body.role?.toUpperCase();

  if (!role || role === "CLIENT") {
    return next(); // No restrictions for CLIENT or no role
  }

  const authHeader = request.headers["authorization"];
  if (!authHeader) return response.sendStatus(401);

  const token = authHeader.split(" ")[1];
  if (!token) return response.sendStatus(403);

  jwt.verify(token, config.tokenSecret, (error, user) => {
    if (error) {
      console.error("Token verification failed:", error);
      return response.sendStatus(403);
    }

    request.user = user;

    const requesterRole = user.role?.toUpperCase();
    const validRoles = [
      "ADMIN",
      "CLIENT",
      "ARTISAN",
      "SUPPLIER",
      "DELIVERY_MAN",
    ];

    if (!validRoles.includes(role)) {
      return response.status(400).json({ message: "Invalid role" });
    }

    if (role !== "CLIENT" && requesterRole !== "ADMIN") {
      return response
        .status(403)
        .json({ message: "Only ADMIN can create non-CLIENT users" });
    }

    next();
  });
};

export const isAdmin = (request, response, next) => {
  if (!request.user || request.user.role !== "ADMIN") {
    return response.status(403).send("Admin verification failed");
  }
  next();
};

export const isClient = (request, response, next) => {
  if (request.user.role === "CLIENT" || request.user.role === "ADMIN") {
    return next();
  }
  return response
    .status(403)
    .json({ message: "Access denied: Client role required" });
};

export const isArtisan = (request, response, next) => {
  if (request.user.role === "ARTISAN" || request.user.role === "ADMIN") {
    return next();
  }
  return response
    .status(403)
    .json({ message: "Access denied: Artisan role required" });
};

export const isSupplier = (request, response, next) => {
  if (request.user.role === "SUPPLIER" || request.user.role === "ADMIN") {
    return next();
  }
  return response
    .status(403)
    .json({ message: "Access denied: Supplier role required" });
};

export const isDeliveryMan = (request, response, next) => {
  if (request.user.role === "DELIVERY_MAN" || request.user.role === "ADMIN") {
    return next();
  }
  return response
    .status(403)
    .json({ message: "Access denied: Delivery Man role required" });
};

export const canRateUser = async (request, response, next) => {
  try {
    const { orderId, orderType, rateeId } = request.body;
    const raterId = request.user.userId;

    if (!orderId || !orderType || !rateeId) {
      return response.status(400).json({ message: "Missing required fields" });
    }

    let orderCompleted = false;
    let validRelationship = false;

    let order;

    if (orderType === "CLIENT_ORDER") {
      const order = await database.clientOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: " order not found" });
    }

    orderCompleted = order.status === "COMPLETED";

    // check if the relationship is valid
    if (order.clientId === raterId && order.artisanId === rateeId) {
      validRelationship = true; // client rating artisan
    } else if (order.artisanId === raterId && order.clientId === rateeId) {
      validRelationship = true; // artisan rating client
    } else if (orderType === "ARTISAN_ORDER") {
      const order = await database.artisanOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: "order not found" });
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
      return response.status(400).json({ message: "invalid order type" });
    }

    if (!orderCompleted) {
      return response
        .status(400)
        .json({ message: "you can only rate after finishing the order" });
    }

    if (!validRelationship) {
      return response.status(403).json({
        message: "you are not authorized to rate this user for this order",
      });
    }

    const existingRating = await database.rating.findOne({
      where: {
        raterId,
        rateeId,
        orderId,
        orderType,
      },
    });

    if (existingRating) {
      return response.status(409).json({
        message: "you have already rated this order",
      });
    }

    next();
    orderCompleted = order.status === "DELIVERED";
  } catch (error) {
    next(error);
  }
};
