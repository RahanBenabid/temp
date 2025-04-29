import express from "express";
import { RatingController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";
import { isAdmin, canRateUser } from "./../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, canRateUser, RatingController.createRating);

router.put("/:id", authenticate, RatingController.updateRating);
router.delete("/:id", authenticate, RatingController.deleteRating);
router.get("/user/:userId", authenticate, RatingController.getUserRatings);
router.get("/user/:userId/stats", authenticate, RatingController.getUserRatingStats);
router.get("/order/:orderType/:orderId", authenticate, RatingController.getOrderRatings);

export default router;