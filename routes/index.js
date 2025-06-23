import express from "express";

import ArtisanOrderRoutes from "./artisanOrderRoutes.js";
import ClientOrderRoutes from "./clientOrderRoutes.js";
import DashboardRoutes from "./dashboardRoutes.js";
import ProductRoutes from "./productRoutes.js";
import ProjectRoutes from "./projectRoutes.js";
import RatingRoutes from "./ratingRoutes.js";
import UserRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/users", UserRoutes);
router.use("/clientOrders", ClientOrderRoutes);
router.use("/artisanOrders", ArtisanOrderRoutes);
router.use("/dashboard", DashboardRoutes);
router.use("/ratings", RatingRoutes);
router.use("/products", ProductRoutes);
router.use("/projects", ProjectRoutes);

export default router;
