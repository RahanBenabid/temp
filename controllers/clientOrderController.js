import database from "./../models/index.js";

const ClientOrder = database.clientOrder;
const User = database.user;
const Rating = database.rating;
const OrderStatusHistory = database.orderStatusHistory;
const Service = database.service;

const exclude = (user, fields) => {
  if (!user) return;
  const userObject = user.toJSON();
  for (const field of fields) delete userObject[field];
  return userObject;
};

class ClientOrderController {
  async getAllOrders(request, response, next) {
    try {
      const page = Number.parseInt(request.query.page) || 1;
      const limit = Number.parseInt(request.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: clientOrders } = await ClientOrder.findAndCountAll({
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
        limit,
        offset,
      });

      if (!clientOrders || clientOrders.length === 0)
        return response.status(200).json({ message: "No orders found" });

      const sanitizedOrders = clientOrders.map((clientOrder) => ({
        ...clientOrder.toJSON(),
        client: exclude(clientOrder.client, ["password"]),
        artisan: exclude(clientOrder.artisan, ["password"]),
      }));

      return response.status(200).json({
        total_orders: count,
        current_page: page,
        per_page: limit,
        orders: sanitizedOrders,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createOrder(request, response, next) {
    try {
      const { artisanId, description, totalAmount } = request.body;

      /*
       * TODO: should implement the addresponses logic, preferably in a handler
       * or maybe it should be done in the frontend we'll see
       */

      if (!artisanId)
        return response.status(400).json({ message: "Artisan ID is required" });

      const artisan = await User.findOne({ where: { id: artisanId } });
      if (!artisan || artisan.role !== "ARTISAN")
        return response.status(400).json({ message: "wrong artisan Id" });

      if (!request.user.userId)
        return response
          .status(401)
          .json({ message: "Authentication required" });

      const clientId = request.user.userId;

      if (request.user.role !== "CLIENT" && request.user.role !== "ADMIN")
        return response
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

      return response.status(201).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  async getOrderById(request, response, next) {
    try {
      const orderId = request.params.id;
      if (!orderId)
        return response.status(400).json({ message: "No query provided" });

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

      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const sanitizedOrder = {
        ...order.toJSON(),
        client: exclude(order.client, ["password"]),
        artisan: exclude(order.artisan, ["password"]),
      };

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  async updateOrderById(request, response, next) {
    try {
      const orderId = request.params.id;
      if (!orderId)
        return response.status(400).json({ message: "No order ID provided" });

      const order = await ClientOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const { description, totalAmount } = request.body;

      const orderData = {
        description,
        totalAmount,
      };

      const responseult = await ClientOrder.update(orderData, {
        where: { id: orderId },
      });

      if (!responseult || responseult[0] === 0)
        return response
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

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  async changeOrderStatusById(request, response, next) {
    try {
      const orderId = request.params.id;
      const { status } = request.body;

      if (!orderId)
        return response.status(400).json({ message: "No order Id provided" });

      if (
        !["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"].includes(
          status?.toUpperCase()
        )
      )
        return response.status(400).json({ message: "Invalid status value" });

      const order = await ClientOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const responseult = await ClientOrder.update(
        { status: status },
        { where: { id: orderId } }
      );

      if (!responseult || responseult[0] === 0)
        return response
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

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  async deleteOrderById(request, response, next) {
    try {
      const orderId = request.params.id;
      if (!orderId)
        return response.status(400).json({ message: "No order ID provided" });

      const order = await ClientOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: "Order not found" });

      await ClientOrder.destroy({ where: { id: orderId } });
      return response.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  }

  async getOrderWithRatings(request, response, next) {
    try {
      const orderId = request.params.id;
      if (!orderId)
        return response.status(400).json({ message: "order ID is required " });

      const order = await ClientOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      if (!order)
        return response.status(404).json({ message: "order not found" });

      const ratings = await Rating.findAll({
        where: { orderId, orderType: "CLIENT_ORDER" },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
      });

      const sanitizedOrder = {
        ...order.toJSON(),
        client: exclude(order.client, ["password"]),
        artisan: exclude(order.artisan, ["password"]),
        ratings: ratings,
      };

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  async getOrderStatus(request, response, next) {
    try {
      const orderId = request.params.id;

      const order = await ClientOrder.findByPk(orderId, {
        include: [
          {
            model: OrderStatusHistory,
            as: "orderStatusHistories",
            order: [["createdAt", "ASC"]],
          },
          {
            model: Service,
            include: [
              {
                model: User,
                as: "artisan",
                attributes: ["id", "name", "email"],
              },
            ],
          },
        ],
      });

      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const allStatuses = [
        "CREATED",
        "ACCEPTED",
        "IN_PROGresponseS",
        "COMPLETED",
      ];

      const statusTimeline = allStatuses.map((status) => {
        const statusHistory = order.orderStatusHistories?.find(
          (h) => h.status === status
        );
        return {
          status,
          date: statusHistory ? statusHistory.createdAt : undefined,
          comment: statusHistory ? statusHistory.comment : undefined,
          completed: !!statusHistory,
        };
      });

      return response.status(200).json({
        order,
        statusTimeline,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ClientOrderController();
