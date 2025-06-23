import database from "./../models/index.js";

const Rating = database.rating;
const User = database.user;
const ClientOrder = database.clientOrder;
const ArtisanOrder = database.artisanOrder;

const exclude = (user, fields) => {
  if (!user) return;
  const userObject = user.toJSON();
  for (const field of fields) {
    delete userObject[field];
  }
  return userObject;
};

class RatingController {
  async createRating(request, response, next) {
    try {
      const { score, comment, rateeId, orderId, orderType } = request.body;

      if (!score || !rateeId || !orderId || !orderType)
        return response.status(400).json({
          message: "Missing required fields",
        });

      if (score < 1 || score > 5)
        return response
          .status(400)
          .json({ message: "Score must be between 1 and 5" });

      if (!["CLIENT_ORDER", "ARTISAN_ORDER"].includes(orderType))
        return response.status(400).json({ message: "Invalid order type" });

      const raterId = request.user.userId;
      const raterType = request.user.role;
      const ratee = await User.findByPk(rateeId);

      if (!ratee)
        return response
          .status(404)
          .json({ message: "User to be rated not found" });

      const rateeType = ratee.role;

      let orderExists = false;
      let orderCompleted = false;

      if (orderType === "CLIENT_ORDER") {
        const order = await ClientOrder.findByPk(orderId);
        if (!order)
          return response.status(404).json({ message: "order not found" });

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

        if (!order)
          return response.status(404).json({ message: "order not found" });

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
        return response.status(403).json({
          message: "You are not authorized to rate this user for this order",
        });

      if (!orderCompleted)
        return response.status(403).json({
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
        return response.status(409).json({
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

      return response.status(201).json({ rating });
    } catch (error) {
      return next(error);
    }
  }

  async updateRating(request, response, next) {
    try {
      const ratingId = request.params.id;
      const { score, comment } = request.body;
      const userId = request.user.userId;

      if (!ratingId)
        return response.status(400).json({ message: "Rating ID is required" });

      const rating = await Rating.findByPk(ratingId);
      if (!rating)
        return response.status(404).json({ message: "Rating not found" });

      if (rating.raterId !== userId && request.user.role !== "ADMIN")
        return response
          .status(403)
          .json({ message: "Unauthorized to updated this rating" });

      if (score !== undefined && (score < 1 || score > 5)) {
        return response
          .status(400)
          .json({ message: "Score must be between 1 and 5" });
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

      return response.status(200).json({ rating: updateRating });
    } catch (error) {
      return next(error);
    }
  }

  async deleteRating(request, response, next) {
    try {
      const ratingId = request.params.id;
      const userId = request.user.userId;

      if (!ratingId)
        return response.status(400).json({ message: "Rating ID is required" });

      const rating = await Rating.findByPk(ratingId);

      if (!rating)
        return response.status(404).json({ message: "Rating not found" });

      const rateeId = rating.rateeId;

      if (rating.raterId !== userId && request.user.role !== "ADMIN")
        return response
          .status(403)
          .json({ message: "Unauthorized to delete this rating" });

      await Rating.destroy({ where: { id: ratingId } });

      this.updateUserAverageRating(rateeId);

      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async getUserRatings(request, response, next) {
    try {
      const userId = request.params.userId;
      const page = Number.parseInt(request.query.page) || 1;
      const limit = Number.parseInt(request.query.limit) || 10;

      const offset = (page - 1) * limit;

      if (!userId)
        return response.status(400).json({ message: "user ID is required" });

      const user = await User.findByPk(userId);

      if (!user)
        return response.status(404).json({ message: "user not found" });

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

      return response.status(200).json({
        total_ratings: count,
        current_page: page,
        per_page: limit,
        ratings,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getUserRatingStats(request, response, next) {
    try {
      const userId = request.params.userId;

      if (!userId)
        return response.status(400).json({ message: "user ID is required" });

      const user = await User.findByPk(userId);
      if (!user)
        return response.status(404).json({ message: "User not found" });

      const ratings = await Rating.findAll({
        where: { rateeId: userId },
      });

      if (ratings.length === 0)
        return response.status(200).json({
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

      for (const rating of ratings) {
        distribution[rating.score.toString()]++;
      }

      return response.status(200).json({
        total_ratings: ratings.length,
        average_rating: Number.parseFloat(averageRating.toFixed(2)),
        rating_distribution: distribution,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getOrderRatings(request, response, next) {
    try {
      const { orderId, orderType } = request.params;

      if (!orderId || !orderType)
        return response
          .status(400)
          .json({ message: "order ID and type are required" });

      if (!["CLIENT_ORDER", "ARTISAN_ORDER"].includes(orderType))
        return response.status(400).json({ message: "invalid order type" });

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
        return response.status(404).json({ message: "Order not found" });

      const ratings = await Rating.findAll({
        where: { orderId, orderType },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
      });

      return response.status(200).json({ ratings });
    } catch (error) {
      return next(error);
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
          { where: { id: userId } }
        );
        return;
      }

      const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = totalScore / ratings.length;

      await User.update(
        { averageRating: Number.parseFloat(averageRating.toFixed(2)) },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error("Error updating user average rating:", error);
    }
  }
}

export default new RatingController();
