import db from "./../models/index.js";

const Product = db.product;
const SupplierProfile = db.supplierProfile;

class ProductController {
  async getProductsBySupplierId(req, res, next) {
    try {
      const userId = req.params.supplierProfileId;

      const supplierExists = await SupplierProfile.findOne({
        where: { user_id: userId },
      });
      if (!supplierExists)
        return res.status(404).json({ message: "Supplier not found" });

      const products = await Product.findAll({
        where: { supplierProfileId: supplierExists.id },
        include: [{ model: SupplierProfile, as: "supplierProfile" }],
      });

      return res.status(200).json(products);
    } catch (err) {
      return next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { name, description, price, category } = req.body;

      const supplierProfile = await SupplierProfile.findOne({
        where: { user_id: req.user.userId },
      });

      if (!supplierProfile)
        return res.status(404).json({ message: "Supplier not found" });

      const imageUrl = req.body.imageUrl || "";
      const type = req.body.type || "light";
      const stock = req.body.stock !== undefined ? req.body.stock : 0;
      const isAvailable = stock !== 0;

      const product = await Product.create({
        name,
        description,
        price,
        category,
        supplierProfileId: supplierProfile.id,
        imageUrl,
        type,
        stock,
        isAvailable,
      });

      return res.status(201).json(product);
    } catch (err) {
      return next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { name, description, price, category } = req.body;

      const supplierProfile = await SupplierProfile.findOne({
        where: { user_id: req.user.userId },
      });
      const product = await Product.findByPk(req.params.id);

      if (!supplierProfile || !product)
        return res
          .status(404)
          .json({ message: " Product or supplier nor found" });

      if (product.supplierProfileId !== supplierProfile.id)
        return res
          .status(403)
          .json({ message: "Not authorized to perform this action" });

      const imageUrl = req.body.imageUrl || "";
      const type = req.body.type || "light";
      const stock = req.body.stock !== undefined ? req.body.stock : 0;
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

      return res.status(200).json({ product });
    } catch (err) {
      return next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      const supplierProfile = await SupplierProfile.findOne({
        where: { user_id: req.user.userId },
      });

      if (
        (!supplierProfile ||
          product.supplierProfileId !== supplierProfile.id) &&
        req.user.role !== "ADMIN"
      )
        return res
          .status(403)
          .json({ message: "Not authorized to perform this action" });

      await product.destroy();
      return res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  }
}

export default new ProductController();
