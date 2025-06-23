import express from "express";
import { DashboardController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";
import {
  isClient,
  isArtisan,
  isSupplier,
  isDeliveryMan,
  isAdmin,
} from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/client",
  authenticate,
  isClient,
  DashboardController.getClientDashboard
);
router.get(
  "/artisan",
  authenticate,
  isArtisan,
  DashboardController.getArtisanDashboard
);
router.get(
  "/supplier",
  authenticate,
  isSupplier,
  DashboardController.getSupplierDashboard
);
router.get(
  "/delivery",
  authenticate,
  isDeliveryMan,
  DashboardController.getDeliveryDashboard
);
router.get(
  "/admin",
  authenticate,
  isAdmin,
  DashboardController.getAdminDashboard
);

export default router;
