import database from "./../models/index.js";

const ArtisanOrder = database.artisanOrder;
const User = database.user;

const exclude = (user, fields) => {
  if (!user) return;
  const userObject = user.toJSON();
  for (const field of fields) {
    delete userObject[field];
  }
  return userObject;
};

class ArtisanOrderController {
  async getAllOrders(request, response, next) {
    try {
      const artisanOrders = await ArtisanOrder.findAll({
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      if (!artisanOrders || artisanOrders.length === 0)
        return response.status(200).json({ message: "No orders found" });

      // TODO: should add pagination here too

      const sanitizedOrders = artisanOrders.map((artisanOrder) => ({
        ...artisanOrder.toJSON(),
        artisan: exclude(artisanOrder.artisan, ["password"]),
        supplier: exclude(artisanOrder.supplier, ["password"]),
        deliveryMan: exclude(artisanOrder.deliveryMan, ["password"]),
      }));

      const size = sanitizedOrders.length;
      response
        .status(200)
        .json({ total_orders: size, orders: sanitizedOrders });
    } catch (error) {
      return next(error);
    }
  }

  async createOrder(request, response, next) {
    try {
      const {
        supplierId,
        deliveryManId,
        materialDetails,
        deliveryAddresponses,
      } = request.body;

      if (!supplierId || !deliveryManId)
        return response.status(400).json({ message: "Required ID missing" });

      const supplier = await User.findOne({ where: { id: supplierId } });
      if (!supplier || supplier.role !== "SUPPLIER")
        return response.status(400).json({ message: "wrong supplier Id" });

      const deliveryMan = await User.findOne({ where: { id: deliveryManId } });
      if (!deliveryMan || deliveryMan.role !== "DELIVERY_MAN")
        return response.status(400).json({ message: "wrong delivery man Id" });

      if (!request.user.userId)
        return response
          .status(401)
          .json({ message: "Authentication required" });

      const artisanId = request.user.userId;

      if (request.user.role !== "ARTISAN" && request.user.role !== "ADMIN")
        return response.status(403).json({
          message: "Only Artisans or admins can create artisan orders",
        });

      const orderData = {
        artisanId,
        supplierId,
        deliveryManId,
        materialDetails,
        deliveryAddresponses,
      };

      const createdOrder = await ArtisanOrder.create(orderData);
      const populatedOrder = await createdOrder.reload({
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      const sanitizedOrder = {
        ...populatedOrder.toJSON(),
        artisan: exclude(populatedOrder.artisan, ["password"]),
        supplier: exclude(populatedOrder.supplier, ["password"]),
        deliveryMan: exclude(populatedOrder.deliveryMan, ["password"]),
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
        return response.status(400).json({ message: "Required Id missing" });

      const order = await ArtisanOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const sanitizedOrder = {
        ...order.toJSON(),
        artisan: exclude(order.artisan, ["password"]),
        supplier: exclude(order.supplier, ["password"]),
        deliveryMan: exclude(order.deliveryMan, ["password"]),
      };

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }

  // TODO: change status

  async updateOrderById(request, response, next) {
    try {
      const orderId = request.params.id;
      const orderExists = await ArtisanOrder.findByPk(orderId);

      if (!orderExists)
        return response.status(404).json({ message: "Order not found" });

      const { materialDetails, deliveryAddresponses } = request.body;

      const orderData = {
        materialDetails,
        deliveryAddresponses,
      };

      const responseult = await ArtisanOrder.update(orderData, {
        where: { id: orderId },
      });

      if (!responseult || responseult[0] === 0)
        return response
          .status(404)
          .json({ message: "Order not found or no update performed" });

      const updatedOrder = await ArtisanOrder.findByPk(orderId, {
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      const sanitizedOrder = {
        ...updatedOrder.toJSON(),
        artisan: exclude(updatedOrder.artisan, ["password"]),
        supplier: exclude(updatedOrder.supplier, ["password"]),
        deliveryMan: exclude(updatedOrder.deliveryMan, ["password"]),
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
        !["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
          status?.toUpperCase()
        )
      ) {
        return response.status(400).json({ message: "Invalid status value" });
      }

      const order = await ArtisanOrder.findByPk(orderId);
      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const responseult = await ArtisanOrder.update(
        { status: status },
        {
          where: { id: orderId },
        }
      );

      if (!responseult || responseult[0] === 0)
        return response.status(404).json({
          message: "Order not found or no update performed",
        });

      const updatedOrder = await ArtisanOrder.findByPk(orderId, {
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      const sanitizedOrder = {
        ...updatedOrder.toJSON(),
        artisan: exclude(updatedOrder.artisan, ["password"]),
        supplier: exclude(updatedOrder.supplier, ["password"]),
        deliveryMan: exclude(updatedOrder.deliveryMan, ["password"]),
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

      const orderExists = await ArtisanOrder.findByPk(orderId);
      if (!orderExists)
        return response.status(404).json({ message: "Order not found" });

      await ArtisanOrder.destroy({ where: { id: orderId } });
      return response.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  }

  async getOrderWithRatings(request, response, next) {
    try {
      const orderId = request.params.id;
      if (!orderId)
        return response.status(400).json({ message: "Order ID is required" });

      const order = await ArtisanOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      if (!order)
        return response.status(404).json({ message: "Order not found" });

      const ratings = await database.rating.findAll({
        where: { orderId, orderType: "ARTISAN_ORDER" },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } },
        ],
      });

      const sanitizedOrder = {
        ...order.toJSON(),
        artisan: exclude(order.artisan, ["password"]),
        supplier: exclude(order.supplier, ["password"]),
        deliveryMan: exclude(order.deliveryMan, ["password"]),
        ratings: ratings,
      };

      return response.status(200).json({ order: sanitizedOrder });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ArtisanOrderController();
