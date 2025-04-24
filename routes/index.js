import express from "express";

const router = express.Router();
import UserRoutes from "./userRoutes.js";
import ClientOrderRoutes from "./clientOrderRoutes.js";
import ArtisanOrderRoutes from "./artisanOrderRoutes.js";

router.use("/users", UserRoutes);
router.use("/clientOrders", ClientOrderRoutes);
router.use("/artisanOrders", ArtisanOrderRoutes);

export default router;
