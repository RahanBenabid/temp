import database from "./../models/index.js";

const Product = database.product;
const User = database.user;

class ProductController {
  async getProductsBySupplierId(request, response, next) {
    try {
      const userId = request.params.supplier_id;

      const supplierExists = await User.findOne({
        where: { id: userId, role: "SUPPLIER" },
      });
      if (!supplierExists) {
        return response.status(404).json({ message: "Supplier not found" });
      }

      const products = await Product.findAll({
        where: { supplier_id: supplierExists.id },
        include: [{ model: User, as: "supplier" }],
      });

      return response.status(200).json(products);
    } catch (error) {
      return next(error);
    }
  }

  async createProduct(request, response, next) {
    try {
      const { name, description, price, category } = request.body;

      const supplier = await User.findOne({
        where: { id: request.user.userId, role: "SUPPLIER" },
      });

      if (!supplier) {
        return response.status(404).json({ message: "Supplier not found" });
      }

      const imageUrl = request.body.imageUrl || "";
      const type = request.body.type || "light";
      const stock = request.body.stock === undefined ? 0 : request.body.stock;
      const isAvailable = stock !== 0;

      const product = await Product.create({
        name,
        description,
        price,
        category,
        supplier_id: supplier.id,
        imageUrl,
        type,
        stock,
        isAvailable,
      });

      return response.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  }

  async updateProduct(request, response, next) {
    try {
      const { name, description, price, category } = request.body;

      const supplier = await User.findOne({
        where: { id: request.user.userId, role: "SUPPLIER" },
      });
      const product = await Product.findByPk(request.params.id);

      if (!supplier || !product) {
        return response
          .status(404)
          .json({ message: " Product or supplier not found" });
      }

      if (product.supplier_id !== supplier.id) {
        return response
          .status(403)
          .json({ message: "Not authorized to perform this action" });
      }

      const imageUrl = request.body.imageUrl || "";
      const type = request.body.type || "light";
      const stock = request.body.stock === undefined ? 0 : request.body.stock;
      const isAvailable = stock !== 0;

      await product.update({
        name,
        description,
        price,
        category,
        imageUrl,
        type,
        stock,
        isAvailable,
      });

      return response.status(200).json({ product });
    } catch (error) {
      return next(error);
    }
  }

  async deleteProduct(request, response, next) {
    try {
      const product = await Product.findByPk(request.params.id);

      if (!product) {
        return response.status(404).json({ message: "Product not found" });
      }

      const supplier = await User.findOne({
        where: { id: request.user.userId, role: "SUPPLIER" },
      });

      if (
        (!supplier || product.supplier_id !== supplier.id) &&
        request.user.role !== "ADMIN"
      ) {
        return response
          .status(403)
          .json({ message: "Not authorized to perform this action" });
      }

      await product.destroy();
      return response.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProductController();
