import database from "../models/index.js";
import { Op } from "sequelize";

const User = database.user;
const ClientOrder = database.clientOrder;
const ArtisanOrder = database.artisanOrder;
const Rating = database.rating;

class DashboardController {
  async getClientDashboard(request, response, next) {
    try {
      const userId = request.user.userId;

      const orders = await ClientOrder.findAll({
        where: { clientId: userId },
        include: [
          { model: User, as: "artisan", attributes: { exclude: ["password"] } },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const pendingOrders = await ClientOrder.findAll({
        where: {
          clientId: userId,
          status: "PENDING",
        },
        include: [
          { model: User, as: "artisan", attributes: { exclude: ["password"] } },
        ],
      });

      const topRatedArtisans = await User.findAll({
        where: {
          role: "ARTISAN",
          averageRating: { [Op.gt]: 0 },
        },
        attributes: {
          exclude: ["password"],
          include: ["averageRating"],
        },
        order: [["averageRating", "DESC"]],
        limit: 5,
      });

      /*
       * TODO: add saved artisans later when i implement that feature
       */

      return response.status(200).json({
        recent_orders: orders,
        pending_requests: pendingOrders,
        top_rated_artisans: topRatedArtisans,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getArtisanDashboard(request, response, next) {
    try {
      const userId = request.user.userId;

      const clientOrders = await ClientOrder.findAll({
        where: { artisanId: userId },
        include: [
          { model: User, as: "client", attributes: { exclude: ["password"] } },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const supplyOrders = await ArtisanOrder.findAll({
        where: { artisanId: userId },
        include: [
          {
            model: User,
            as: "supplier",
            attributes: { exclude: ["password"] },
          },
          {
            model: User,
            as: "deliveryMan",
            attributes: { exclude: ["password"] },
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      const completedOrders = await ClientOrder.count({
        where: {
          artisanId: userId,
          status: "COMPLETED",
        },
      });

      const totalOrders = await ClientOrder.count({
        where: {
          artisanId: userId,
          status: { [Op.not]: "PENDING" },
        },
      });

      const completionRate =
        totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const ratingReceived = await Rating.findAll({
        where: { rateeId: userId },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
        ],
        limit: 5,
        order: [["createdAt", "DESC"]],
      });

      const ratingsStats = await Rating.findAll({
        where: { rateeId: userId },
        attributes: [
          [
            database.sequelize.fn("AVG", database.sequelize.col("score")),
            "average",
          ],
          [
            database.sequelize.fn("COUNT", database.sequelize.col("id")),
            "count",
          ],
        ],
      });

      const averageRating = ratingsStats[0].dataValues.average || 0;
      const ratingCount = ratingsStats[0].dataValues.count || 0;

      return response.status(200).json({
        client_requests: clientOrders,
        supply_orders: supplyOrders,
        completion_rate: completionRate.toFixed(2),
        recent_ratings: ratingReceived,
        rating_summary: {
          average: Number.parseFloat(averageRating.toFixed(2)),
          count: ratingCount,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSupplierDashboard(request, response, next) {
    try {
      const userId = request.user.userId;

      const pendingOrders = await ArtisanOrder.findAll({
        where: {
          supplierId: userId,
          status: "PENDING",
        },
        include: [
          { model: User, as: "artisan", attributes: { exclude: ["password"] } },
          {
            model: User,
            as: "deliveryMan",
            attributes: { exclude: ["password"] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const supplierProfile = await database.supplierProfile.findOne({
        where: { user_id: userId },
      });

      return response.status(200).json({
        pending_requests: pendingOrders,
        inventory_status: supplierProfile?.inventory || {},
      });
    } catch (error) {
      return next(error);
    }
  }

  async getDeliveryDashboard(request, response, next) {
    try {
      const userId = request.user.userId;

      const deliveries = await ArtisanOrder.findAll({
        where: {
          deliveryManId: userId,
          status: { [Op.in]: ["PENDING", "SHIPPED"] },
        },
        include: [
          { model: User, as: "artisan", attributes: { exclude: ["password"] } },
          {
            model: User,
            as: "supplier",
            attributes: { exclude: ["password"] },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return response.status(200).json({
        assigned_deliveries: deliveries,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAdminDashboard(request, response, next) {
    try {
      // user stats
      const userCounts = {
        total: await User.count(),
        client: await User.count({ where: { role: "CLIENT" } }),
        artisans: await User.count({ where: { role: "ARTISAN" } }),
        suppliers: await User.count({ where: { role: "SUPPLIER" } }),
        deliveryMens: await User.count({ where: { role: "DELIVERY_MAN" } }),
      };

      // order stats
      const clientOrderCounts = {
        total: await ClientOrder.count(),
        pending: await ClientOrder.count({ where: { status: "PENDING" } }),
        accepted: await ClientOrder.count({ where: { status: "ACCEPTED" } }),
        completed: await ClientOrder.count({ where: { status: "COMPLETED" } }),
        cancelled: await ClientOrder.count({ where: { status: "CANCELLED" } }),
      };

      const artisanOrderCounts = {
        total: await ArtisanOrder.count(),
        pending: await ArtisanOrder.count({ where: { status: "PENDING" } }),
        shipped: await ArtisanOrder.count({ where: { status: "SHIPPED" } }),
        delivered: await ArtisanOrder.count({ where: { status: "DELIVERED" } }),
        cancelled: await ArtisanOrder.count({ where: { status: "CANCELLED" } }),
      };

      // recent users
      const recentUsers = await User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
        limit: 5,
      });

      // recent orders
      const recentClientOrders = await ClientOrder.findAll({
        include: [
          { model: User, as: "client", attributes: { exclude: ["password"] } },
          { model: User, as: "artisan", attributes: { exclude: ["password"] } },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      });

      // top rated users
      const topRatedUsers = await User.findAll({
        where: { averageRating: { [Op.gt]: 0 } },
        attributes: {
          exclude: ["password"],
          include: ["averageRating", "role"],
        },
        order: [["averageRating", "DESC"]],
        limit: 10,
      });

      return response.status(200).json({
        user_stats: userCounts,
        client_order_stats: clientOrderCounts,
        artisan_order_stats: artisanOrderCounts,
        recent_users: recentUsers,
        recent_orders: recentClientOrders,
        top_rated_users: topRatedUsers,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new DashboardController();
