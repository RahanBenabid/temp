import express from "express";
import { UserController } from "./../controllers/index.js";
import { authenticate } from "./../config/jwtConfig.js";
import { restrictToAdminForSpecialRoles } from "./../middleware/auth.js";

const router = express.Router();

// NON PROTECTED ROUTES
router.post("/login", UserController.loginUser);

// PARTIALLY PROTECTED ROUTES
router.post("/", restrictToAdminForSpecialRoles, UserController.createUser);

//PROTECTED ROUTES
router.get("/", authenticate, UserController.getAllUsers);
router.get(
  "/:id",
  authenticate,
  UserController.getUserUsingIdOrEmailOrPhoneNumber,
);
router.put("/:id", authenticate, UserController.updateUserById);
router.delete("/:id", authenticate, UserController.deleteUserById);

export default router;
