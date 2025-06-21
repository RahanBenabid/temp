import db from "./../models/index.js";
import { Op } from "sequelize";

const Rating = db.rating;
const User = db.user;
const ClientOrder = db.clientOrder;
const ArtisanOrder = db.artisanOrder;

const exclude = (user, fields) => {
  if (!user) return null;
  const userObject = user.toJSON();
  fields.forEach((field) => delete userObject[field]);
  return userObject;
};

class RatingController {
  async createRating(req, res, next) {
    try {
      const { score, comment, rateeId, orderId, orderType } = req.body;

      if (!score || !rateeId || !orderId || !orderType)
        return res.status(400).json({
          message: "Missing required fields",
        });

      if (score < 1 || score > 5)
        return res
          .status(400)
          .json({ message: "Score must be between 1 and 5" });

      if (!["CLIENT_ORDER", "ARTISAN_ORDER"].includes(orderType))
        return res.status(400).json({ message: "Invalid order type" });

      const raterId = req.user.userId;
      const raterType = req.user.role;
      const ratee = await User.findByPk(rateeId);

      if (!ratee)
        return res.status(404).json({ message: "User to be rated not found" });

      const rateeType = ratee.role;

      let orderExists = false;
      let orderCompleted = false;

      if (orderType === "CLIENT_ORDER") {
        const order = await ClientOrder.findByPk(orderId);
        if (!order) return res.status(404).json({ message: "order not found" });

        // making sure the order is completed
        orderCompleted = order.status === "COMPLETED";

        // making sure the rater and ratee are part of the order
        if (raterType === "CLIENT" && rateeType === "ARTISAN") {
          orderExists =
            order.clientId === raterId && order.artisanId === rateeId;
        } else if (raterType === "ARTISAN" && rateeType === "CLIENT") {
          orderExists =
            order.artisanId === raterId && order.clientId === rateeId;
        }
      } else if (orderType === "ARTISAN_ORDER") {
        const order = await ArtisanOrder.findByPk(orderId);

        if (!order) return res.status(404).json({ message: "order not found" });

        // making sure the order is delivered
        orderCompleted = order.status === "DELIVERED";

        // making sure the rater and ratee are part of the order
        if (raterType === "ARTISAN" && rateeType === "SUPPLIER") {
          orderExists =
            order.artisanId === raterId && order.supplierId === rateeId;
        } else if (raterType === "ARTISAN" && rateeType === "DELIVERY_MAN") {
          orderExists =
            order.artisanId === raterId && order.deliveryManId === rateeId;
        } else if (raterType === "SUPPLIER" && rateeType === "ARTISAN") {
          orderExists =
            order.supplierId === raterId && order.artisanId === rateeId;
        } else if (raterType === "DELIVERY_MAN" && rateeType === "ARTISAN") {
          orderExists =
            order.deliveryManId === raterId && order.artisanId === rateeId;
        }
      }

      if (!orderExists)
        return res.status(403).json({
          message: "You are not authorized to rate this user for this order",
        });

      if (!orderCompleted)
        return res.status(403).json({
          message: "You can only rate after the order us completed/delivered",
        });

      const existingRating = await Rating.findOne({
        where: {
          raterId,
          rateeId,
          orderId,
          orderType,
        },
      });

      if (existingRating)
        return res.status(409).json({
          message: "You already rated this order",
        });

      const ratingData = {
        score,
        comment,
        raterType,
        rateeType,
        raterId,
        rateeId,
        orderId,
        orderType,
      };

      const rating = await Rating.create(ratingData);

      this.updateUserAverageRating(rateeId);

      return res.status(201).json({ rating });
    } catch (err) {
      return next(err);
    }
  }

  async updateRating(req, res, next) {
    try {
      const ratingId = req.params.id;
      const { score, comment } = req.body;
      const userId = req.user.userId;

      if (!ratingId)
        return res.status(400).json({ message: "Rating ID is required" });

      const rating = await Rating.findByPk(ratingId);
      if (!rating) return res.status(404).json({ message: "Rating not found" });

      if (rating.raterId !== userId && req.user.role !== "ADMIN")
        return res
          .status(403)
          .json({ message: "Unauthorized to updated this rating" });

      if (score !== undefined) {
        if (score < 1 || score > 5) {
          return res
            .status(400)
            .json({ message: "Score must be between 1 and 5" });
        }
      }

      const updateData = {};
      if (score !== undefined) updateData.score = score;
      if (comment !== undefined) updateData.comment = comment;

      await Rating.update(updateData, { where: { id: ratingId } });

      this.updateUserAverageRating(rating.rateeId);

      const updateRating = await Rating.findByPk(ratingId, {
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
      });

      return res.status(200).json({ rating: updateRating });
    } catch (err) {
      return next(err);
    }
  }

  async deleteRating(req, res, next) {
    try {
      const ratingId = req.params.id;
      const userId = req.user.userId;

      if (!ratingId)
        return res.status(400).json({ message: "Rating ID is required" });

      const rating = await Rating.findByPk(ratingId);

      if (!rating) return res.status(404).json({ message: "Rating not found" });

      const rateeId = rating.rateeId;

      if (rating.raterId !== userId && req.user.role !== "ADMIN")
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this rating" });

      await Rating.destroy({ where: { id: ratingId } });

      this.updateUserAverageRating(rateeId);

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  async getUserRatings(req, res, next) {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const offset = (page - 1) * limit;

      if (!userId)
        return res.status(400).json({ message: "user ID is required" });

      const user = await User.findByPk(userId);

      if (!user) return res.status(404).json({ message: "user not found" });

      const { count, rows: ratings } = await Rating.findAndCountAll({
        where: { rateeId: userId },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return res.status(200).json({
        total_ratings: count,
        current_page: page,
        per_page: limit,
        ratings,
      });
    } catch (err) {
      return next(err);
    }
  }

  async getUserRatingStats(req, res, next) {
    try {
      const userId = req.params.userId;

      if (!userId)
        return res.status(400).json({ message: "user ID is required" });

      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const ratings = await Rating.findAll({
        where: { rateeId: userId },
      });

      if (ratings.length === 0)
        return res.status(200).json({
          total_ratings: 0,
          average_rating: 0,
          rating_distribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        });

      const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = totalScore / ratings.length;

      const distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      ratings.forEach((rating) => {
        distribution[rating.score.toString()]++;
      });

      return res.status(200).json({
        total_ratings: ratings.length,
        average_rating: parseFloat(averageRating.toFixed(2)),
        rating_distribution: distribution,
      });
    } catch (err) {
      return next(err);
    }
  }

  async getOrderRatings(req, res, next) {
    try {
      const { orderId, orderType } = req.params;

      if (!orderId || !orderType)
        return res
          .status(400)
          .json({ message: "order ID and type are required" });

      if (!["CLIENT_ORDER", "ARTISAN_ORDER"].includes(orderType))
        return res.status(400).json({ message: "invalid order type" });

      let orderExists = false;
      // converts the fetched order to a boolean to check if it exists
      if (orderType === "CLIENT_ORDER") {
        const order = await ClientOrder.findByPk(orderId);
        orderExists = !!order;
      } else {
        const order = await ArtisanOrder.findByPk(orderId);
        orderExists = !!order;
      }

      if (!orderExists)
        return res.status(404).json({ message: "Order not found" });

      const ratings = await Rating.findAll({
        where: { orderId, orderType },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
      });

      return res.status(200).json({ ratings });
    } catch (err) {
      return next(err);
    }
  }

  // helper method
  async updateUserAverageRating(userId) {
    try {
      const ratings = await Rating.findAll({
        where: { rateeId: userId },
      });

      // if no rating set average to 0
      if (ratings.length === 0) {
        await User.update(
          { averageRating: 0 }, // Explicitly update to 0 when no ratings exist
          { where: { id: userId } },
        );
        return null;
      }

      const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = totalScore / ratings.length;

      await User.update(
        { averageRating: parseFloat(averageRating.toFixed(2)) },
        { where: { id: userId } },
      );
    } catch (err) {
      console.error("Error updating user average rating:", err);
    }
  }
}

export default new RatingController();
