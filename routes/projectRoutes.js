import express from "express";
import { authenticate } from "./../config/jwtConfig.js";
import { ProjectController } from "./../controllers/index.js";

const router = express.Router();

router.post("/", authenticate, ProjectController.createProject);
router.get("/", authenticate, ProjectController.getAllProjects);
router.get("/:id", authenticate, ProjectController.getProjectById);
router.put("/:id", authenticate, ProjectController.updateProjectById);
router.delete(":/id", authenticate, ProjectController.deleteProject);

export default router;
