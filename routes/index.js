import express from "express";

const router = express.Router();
import UserRoutes from "./userRoutes.js";
import ClientOrderRoutes from "./clientOrderRoutes.js";
import ArtisanOrderRoutes from "./artisanOrderRoutes.js";
import DashboardRoutes from "./dashboardRoutes.js";

router.use("/users", UserRoutes);
router.use("/clientOrders", ClientOrderRoutes);
router.use("/artisanOrders", ArtisanOrderRoutes);
router.use("/dashboard", DashboardRoutes);


export default router;
	