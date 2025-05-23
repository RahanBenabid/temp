import db from "./../models/index.js";

const ArtisanOrder = db.artisanOrder;
const User = db.user;

const exclude = (user, fields) => {
  if (!user) return null;
  const userObject = user.toJSON();
  fields.forEach((field) => delete userObject[field]);
  return userObject;
};

class ArtisanOrderController {
  async getAllOrders(req, res, next) {
    try {
      const artisanOrders = await ArtisanOrder.findAll({
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      if (!artisanOrders || artisanOrders.length === 0)
        return res.status(200).json({ message: "No orders found" });

      /*
       * TODO: should add pagination here too
       */

      const sanitizedOrders = artisanOrders.map((artisanOrder) => ({
        ...artisanOrder.toJSON(),
        artisan: exclude(artisanOrder.artisan, ["password"]),
        supplier: exclude(artisanOrder.supplier, ["password"]),
        deliveryMan: exclude(artisanOrder.deliveryMan, ["password"]),
      }));

      const size = sanitizedOrders.length;
      res
        .status(200)
        .json({ total_orders: size, orders: sanitizedOrders });
    } catch (err) {
      return next(err);
    }
  }

  async createOrder(req, res, next) {
    try {
      const { supplierId, deliveryManId, materialDetails, deliveryAddress } =
        req.body;

      if (!supplierId || !deliveryManId)
        return res.status(400).json({ message: "Required ID missing" });

      const supplier = await User.findOne({ where: { id: supplierId } });
      if (!supplier || supplier.role !== "SUPPLIER")
        return res.status(400).json({ message: "wrong supplier Id" });

      const deliveryMan = await User.findOne({ where: { id: deliveryManId } });
      if (!deliveryMan || deliveryMan.role !== "DELIVERY_MAN")
        return res.status(400).json({ message: "wrong delivery man Id" });

      if (!req.user.userId)
        return res.status(401).json({ message: "Authentication required" });

      const artisanId = req.user.userId;

      if (req.user.role !== "ARTISAN" && req.user.role !== "ADMIN")
        return res.status(403).json({
          message: "Only Artisans or admins can create artisan orders",
        });

      const orderData = {
        artisanId,
        supplierId,
        deliveryManId,
        materialDetails,
        deliveryAddress,
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

      return res.status(201).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      if (!orderId)
        return res.status(400).json({ message: "Requied Id missing" });

      const order = await ArtisanOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });

      if (!order) return res.status(404).json({ message: "Order not found" });

      const sanitizedOrder = {
        ...order.toJSON(),
        artisan: exclude(order.artisan, ["password"]),
        supplier: exclude(order.supplier, ["password"]),
        deliveryMan: exclude(order.deliveryMan, ["password"]),
      };

      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  /*
   * TODO: change status
   */

  async updateOrderById(req, res, next) {
    try {
      const orderId = req.params.id;
      const orderExists = await ArtisanOrder.findByPk(orderId);

      if (!orderExists)
        return res.status(404).json({ message: "Order not found" });

      const { materialDetails, deliveryAddress } = req.body;

      const orderData = {
        materialDetails,
        deliveryAddress,
      };

      const result = await ArtisanOrder.update(orderData, {
        where: { id: orderId },
      });

      if (!result || result[0] === 0)
        return res
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

      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
  }

  async changeOrderStatusById(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      if (!orderId)
        return res.status(400).json({ message: "No order Id provided" });
      
      if (
        !["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
          status?.toUpperCase(),
        )
      ) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const order = await ArtisanOrder.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const result = await ArtisanOrder.update(
        { status: status },
        {
          where: { id: orderId },
        },
      );
      
      if (!result || result[0] === 0)
        return res.status(404).json({
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

      const orderExists = await ArtisanOrder.findByPk(orderId);
      if (!orderExists)
        return res.status(404).json({ message: "Order not found" });

      await ArtisanOrder.destroy({ where: { id: orderId } });
      return res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  }
  
  async getOrderWithRatings(req, res, next) {
    try {
      const orderId = req.params.id;
      if (!orderId)
        return res.status(400).json({ message: "Order ID is required" });
      
      const order = await ArtisanOrder.findOne({
        where: { id: orderId },
        include: [
          { model: User, as: "artisan" },
          { model: User, as: "supplier" },
          { model: User, as: "deliveryMan" },
        ],
      });
      
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const ratings = await db.rating.findAll({
        where: { orderId, orderType: "ARTISAN_ORDER" },
        include: [
          { model: User, as: "rater", attributes: { exclude: ["password"] } },
          { model: User, as: "ratee", attributes: { exclude: ["password"] } }
        ]
      });
      
      const sanitizedOrder = {
        ...order.toJSON(),
        artisan: exclude(order.artisan, ["password"]),
        supplier: exclude(order.supplier, ["password"]),
        deliveryMan: exclude(order.deliveryMan, ["password"]),
        ratings: ratings
      };
      
      return res.status(200).json({ order: sanitizedOrder });
    } catch (err) {
      return next(err);
    }
}

export default new ArtisanOrderController();
