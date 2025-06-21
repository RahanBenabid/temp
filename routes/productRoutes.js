import express from "express";
import { ProductController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";

const router = express.Router();

router.get(
  "/supplier/:supplierProfileId",
  authenticate,
  ProductController.getProductsBySupplierId
);
router.post("/", authenticate, ProductController.createProduct);
router.put("/:id", authenticate, ProductController.updateProduct);
router.delete("/:id", authenticate, ProductController.deleteProduct);

export default router;
