import express from "express";
import { ClientOrderController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";
import { isAdmin } from "./../middleware/auth.js"

const router = express.Router();

// PROTECTED ROUTES
router.get("/", authenticate, ClientOrderController.getAllOrders);
router.get("/:id", authenticate, ClientOrderController.getOrderById);
router.get("/:id/ratings", authenticate, ClientOrderController.getOrderWithRatings);
router.post("/", authenticate, ClientOrderController.createOrder);
router.put("/:id/status",authenticate, isAdmin, ClientOrderController.changeOrderStatusById);
router.put("/:id", authenticate, ClientOrderController.updateOrderById);
router.delete("/:id", authenticate, ClientOrderController.deleteOrderById);

export default router;
	