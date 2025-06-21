import express from "express";
import { ArtisanOrderController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";
import { isAdmin } from "./../middleware/auth.js"

const router = express.Router();

// PROTECTED ROUTES
router.get("/", authenticate, ArtisanOrderController.getAllOrders);
router.get("/:id", authenticate, ArtisanOrderController.getOrderById);
router.get("/:id/ratings", authenticate, ArtisanOrderController.getOrderWithRatings);
router.post("/", authenticate, ArtisanOrderController.createOrder);
router.put("/:id/status", authenticate, isAdmin, ArtisanOrderController.changeOrderStatusById);
router.put("/:id", authenticate, ArtisanOrderController.updateOrderById);
router.delete("/:id", authenticate, ArtisanOrderController.deleteOrderById);

export default router;
