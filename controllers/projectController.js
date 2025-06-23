import database from "./../models/index.js";

const Project = database.project;
const User = database.user;

class ProjectController {
  async createProject(request, response, next) {
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
      } = request.body;

      const client = await User.findOne({
        where: { id: request.user.id, role: "CLIENT" },
      });
      if (!client || client.id !== client_id) {
        return response.status(404).json({ message: "Client not found" });
      }

      if (artisan_id) {
        const artisan = await User.findOne({
          where: { id: artisan_id, role: "ARTISAN" },
        });
        if (!artisan) {
          return response.status(404).json({ message: "Artisan not found" });
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

      return response.status(201).json(project);
    } catch (error) {
      return next(error);
    }
  }

  async getAllProjects(request, response, next) {
    try {
      const { status, client_id, artisan_id } = request.query;
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

      return response.status(200).json(projects);
    } catch (error) {
      return next(error);
    }
  }

  async getProjectById(request, response, next) {
    try {
      const project = await Project.findOne({
        where: { id: request.params.id },
        include: [
          { model: User, as: "client" },
          { model: User, as: "artisan" },
        ],
      });

      if (!project) {
        return response.status(404).json({ message: "Project not found" });
      }

      return response.status(200).json(project);
    } catch (error) {
      return next(error);
    }
  }

  async updateProjectById(request, response, next) {
    try {
      const project = await Project.findByPk(request.params.id);
      if (!project) {
        response.status(404).json({ message: "Project not found" });
      }

      if (project.client_id !== request.user.userId) {
        return response.status(403).json({
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
      } = request.body;

      if (artisan_id) {
        const artisan = await User.findOne({
          where: { id: artisan_id, role: "ARTISAN" },
        });
        if (!artisan) {
          return response.status(404).json({ message: "Artisan not found" });
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

      return response.status(200).json(updatedProject);
    } catch (error) {
      return next(error);
    }
  }

  async deleteProject(request, response, next) {
    try {
      const project = await Project.findByPk(request.params.id);
      if (!project) {
        return response.status(404).json({ message: "Project not found" });
      }

      if (
        project.client_id !== request.user.userId &&
        request.user.role !== "ADMIN"
      ) {
        return response.status(403).json({
          message: "Not authorized to delete this project",
        });
      }

      await project.destroy();

      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProjectController();
