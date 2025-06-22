import db from "./../models/index.js";

const Project = db.project;
const User = db.user;

class ProjectController {
  async createProject(req, res, next) {
    try {
      const {
        title,
        description,
        budget,
        location,
        category,
        images,
        client_id,
        artisan_id,
      } = req.body;

      const client = await User.findOne({
        where: { id: req.user.id, role: "CLIENT" },
      });
      if (!client || client.id !== client_id) {
        return res.status(404).json({ message: "Client not found" });
      }

      if (artisan_id) {
        const artisan = await User.findOne({
          where: { id: artisan_id, role: "ARTISAN" },
        });
        if (!artisan) {
          return res.status(404).json({ message: "Artisan not found" });
        }
      }

      const project = await Project.create({
        title,
        description,
        budget,
        location,
        category,
        images,
        client_id,
        artisan_id,
      });

      return res.status(201).json(project);
    } catch (err) {
      return next(err);
    }
  }

  async getAllProjects(req, res, next) {
    try {
      const { status, client_id, artisan_id } = req.query;
      const where = {};
      if (status) where.status = status;
      if (client_id) where.client_id = client_id;
      if (artisan_id) where.artisan_id = artisan_id;

      const projects = await Project.findAll({
        where,
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(projects);
    } catch (err) {
      return next(err);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const project = await Project.findOne({
        where: { id: req.params.id },
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(200).json(project);
    } catch (err) {
      return next(err);
    }
  }

  async updateProjectById(req, res, next) {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
      }

      if (project.client_id !== req.user.userId) {
        return res.status(403).json({
          message: "You are only authorized to modify your own projects",
        });
      }

      const {
        title,
        description,
        budget,
        location,
        category,
        images,
        artisan_id,
      } = req.body;

      if (artisan_id) {
        const artisan = await User.findOne({
          where: { id: artisan_id, role: "ARTISAN" },
        });
        if (!artisan) {
          return res.status(404).json({ message: "Artisan not found" });
        }
      }

      const updatedProject = await project.update({
        title,
        description,
        budget,
        location,
        category,
        images,
        artisan_id,
      });

      return res.status(200).json(updatedProject);
    } catch (err) {
      return next(err);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.client_id !== req.user.userId && req.user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Not authorized to delete this project",
        });
      }

      await project.destroy();

      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

export default new ProjectController();
