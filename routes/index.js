import express from "express";

const router = express.Router();
import UserRoutes from "./userRoutes.js";
import ClientOrderRoutes from "./clientOrderRoutes.js";
import ArtisanOrderRoutes from "./artisanOrderRoutes.js";
import DashboardRoutes from "./dashboardRoutes.js";
import RatingRoutes from "./ratingRoutes.js";

router.use("/users", UserRoutes);
router.use("/clientOrders", ClientOrderRoutes);
router.use("/artisanOrders", ArtisanOrderRoutes);
router.use("/dashboard", DashboardRoutes);
router.use("/ratings", RatingRoutes);

export default router;
