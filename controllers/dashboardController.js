import db from "../models/index.js";
import { Op } from "sequelize";

const User = db.user;
const ClientOrder = db.clientOrder;
const ArtisanOrder = db.artisanOrder;

class DashboardController {
  async getClientDashboard(req, res, next) {
    try {
      const userId = req.user.userId;

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

      /*
       * TODO: add saved artisans later when i implement that feature
       */

      return res.status(200).json({
        recent_orders: orders,
        pending_requests: pendingOrders,
      });
    } catch (err) {
      return next(err);
    }
  }

  async getArtisanDashboard(req, res, next) {
    try {
      const userId = req.user.userId;

      const clientOrders = await clientOrders.findAll({
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

      return res.status(200).json({
        client_requests: clientOrders,
        supply_orders: supplyOrders,
        completion_rate: completionRate.toFixed(2),
      });
    } catch (err) {
      return next(err);
    }
  }

  async getSupplierDashboard(req, res, next) {
    try {
      const userId = req.user.userId;

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

      const supplierProfile = await db.supplierProfile.findOne({
        where: { user_id: userId },
      });

      return res.status(200).json({
        pending_requests: pendingOrders,
        inventory_status: supplierProfile?.inventory || {},
      });
    } catch (err) {
      return next(err);
    }
  }

  async getDeliveryDashboard(req, res, next) {
    try {
      const userId = req.user.userId;

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

      return res.status(200).json({
        assigned_deliveries: deliveries,
      });
    } catch (err) {
      return next(err);
    }
  }

  async getAdminDashboard(req, res, next) {
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

      return res.status(200).json({
        user_stats: userCounts,
        client_order_stats: clientOrderCounts,
        artisan_order_stats: artisanOrderCounts,
        recent_users: recentUsers,
        recent_orders: recentClientOrders,
      });
    } catch (err) {
      return next(err);
    }
  }
}

export default new DashboardController();
