import db from "./../models/index.js";

const ClientOrder = db.clientOrder;
const User = db.user;

const exclude = (user, fields) => {
  if (!user) return null;
  const userObject = user.toJSON();
  fields.forEach((field) => delete userObject[field]);
  return userObject;
};

class ClientOrderController {
  async getAllOrders(req, res, next) {
    try {
      const clientOrders = await ClientOrder.findAll({
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      if (!clientOrders || clientOrders.length === 0)
        return res.status(200).json({ message: "No orders found" });

      /*
       * TODO: should add pagination
       */

      const size = clientOrders.length;
      clientOrders.forEach((clientOrder) => {
        clientOrder = {
          ...clientOrder.toJSON(),
          client: exclude(clientOrder.client, ["password"]),
          artisan: exclude(clientOrder.artisan, ["password"]),
        };
      });

      return res.status(200).json({ total_orders: size, orders: clientOrders });
    } catch (err) {
      return next(err);
    }
  }

  async createOrder(req, res, next) {
    try {
      const { artisanId, description, totalAmount } = req.body;

      /*
       * TODO: should implement the address logic, preferably in a handler
       * or maybe it should be done in the frontend we'll see
       */

      if (!artisanId)
        return res.status(400).json({ message: "Artisan ID is required" });

      const artisan = await User.findOne({ where: { id: artisanId } });
      if (!artisan || artisan.role !== "ARTISAN")
        return res.status(400).json({ message: "wrong artisan Id" });

      if (!req.user.userId)
        return res.status(401).json({ message: "Authentication required" });

      const clientId = req.user.userId;

      if (req.user.role !== "CLIENT" && req.user.role !== "ADMIN")
        return res
          .status(403)
          .json({ message: "Only clients or admins can create client orders" });

      const orderData = {
        description,
        totalAmount,
        clientId,
        artisanId,
      };

      const createdOrder = await ClientOrder.create(orderData);

      const order = await createdOrder.reload({
        where: { id: createdOrder.id },
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      const sanitizedOrder = {
        ...order.toJSON(),
        client: exclude(order.client, ["password"]),
        artisan: exclude(order.artisan, ["password"]),
      };

      return res.status(201).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      if (!orderId)
        return res.status(400).json({ message: "No query provided" });

      /*
       * TODO: make sure it's only the orders of the user, or if the user is admin?
       */

      const order = await ClientOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      if (!order) return res.status(404).json({ message: "Order not found" });

      const sanitizedOrder = {
        ...order.toJSON(),
        client: exclude(order.client, ["password"]),
        artisan: exclude(order.artisan, ["password"]),
      };

      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  async updateOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      if (!orderId)
        return res.status(400).json({ message: "No order ID provided" });

      const order = await ClientOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const { description, totalAmount } = req.body;

      const orderData = {
        description,
        totalAmount,
      };

      const result = await ClientOrder.update(orderData, {
        where: { id: orderId },
      });

      if (!result || result[0] === 0)
        return res
          .status(404)
          .json({ message: "Order not found or no update performed" });

      const updatedOrder = await ClientOrder.findByPk(orderId, {
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      const sanitizedOrder = {
        ...updatedOrder.toJSON(),
        client: exclude(updatedOrder.client, ["password"]),
        artisan: exclude(updatedOrder.artisan, ["password"]),
      };

      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  /*
   * TODO: CHANGE THE ORDER STATUS (admin only)
   */

  async changeOrderStatusById(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!orderId)
        return res.status(400).json({ message: "No order Id provided" });

      if (
        !["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"].includes(
          status?.toUpperCase(),
        )
      )
      {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const order = await ClientOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const result = await ClientOrder.update(
        { status: status },
        {
          where: { id: orderId },
        },
      );

      if (!result || result[0] === 0)
        return res.status(404).json({
          message: "Order not found or no update performed",
        });

      const updatedOrder = await ClientOrder.findByPk(orderId);
      const sanitizedOrder = {
        ...updatedOrder.toJSON(),
        client: exclude(updatedOrder.client, ["password"]),
        artisan: exclude(updatedOrder.artisan, ["password"]),
      };

      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  async deleteOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      if (!orderId)
        return res.status(400).json({ message: "No order ID provided" });

      const order = await ClientOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      await ClientOrder.destroy({ where: { id: orderId } });
      return res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  }
}

export default new ClientOrderController();
