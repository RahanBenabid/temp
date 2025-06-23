import Sequelize from "sequelize";
// import bcrypt from "bcrypt";
import database from "./../models/index.js";
import { generateAccessToken } from "./../config/jwtConfig.js";

const User = database.user;
const ClientProfile = database.clientProfile;
const ArtisanProfile = database.artisanProfile;
const SupplierProfile = database.supplierProfile;
const DeliveryManProfile = database.deliveryManProfile;

const exclude = (user, fields) => {
  if (!user);
  const userObject = user.toJSON();
  for (const field of fields) {
    delete userObject[field];
  }
  return userObject;
};

class UserController {
  async getAllUsers(request, response, next) {
    try {
      const users = await User.findAll({
        include: [
          { model: ClientProfile, as: "clientProfile" },
          { model: ArtisanProfile, as: "artisanProfile" },
          { model: SupplierProfile, as: "supplierProfile" },
          { model: DeliveryManProfile, as: "deliveryManProfile" },
        ],
      });
      if (!users || users.length === 0)
        return response.status(404).json({ message: "No users found" });
      const sanitizedUsers = users.map((user) => exclude(user, ["password"]));
      return response.status(200).json(sanitizedUsers);
    } catch (error) {
      return next(error);
    }
  }

  async createUser(request, response, next) {
    try {
      const {
        firstname,
        lastname,
        phone,
        email,
        password,
        role,
        address,
        profession,
        inventory,
        vehicle,
        shopName,
        shopAddress,
        nationalCardNumber,
      } = request.body;

      // const requesterRole = request.user?.role;

      // check required fields
      if (!firstname || !lastname || !password || !email)
        return response
          .status(400)
          .json({ message: "Missing required fields" });
      if (role === "ARTISAN" && !profession)
        return response
          .status(400)
          .json({ message: "Profession required for ARTISAN" });
      if (role === "SUPPLIER" && (!shopName || !shopAddress))
        return response
          .status(400)
          .json({ message: "Shop name and address required for SUPPLIER" });
      if (role === "DELIVERY_MAN" && (!nationalCardNumber || !vehicle))
        return response.status(400).json({
          message: "National card number and vehicle required for DELIVERY_MAN",
        });

      let existingUser = await User.findOne({ where: { email } });
      if (existingUser)
        return response.status(409).json({ message: "Email already in use" });

      existingUser = await User.findOne({ where: { phone } });
      if (existingUser)
        return response
          .status(409)
          .json({ message: "Phone number already in use" });

      const userData = {
        firstname,
        lastname,
        phone,
        email,
        password,
        role: request.body.role?.toUpperCase() || "CLIENT",
      };
      let user = await User.create(userData);

      let profile;
      switch (userData.role) {
        case "CLIENT": {
          profile = await ClientProfile.create({ address, user_id: user.id });
          break;
        }
        case "ARTISAN": {
          profile = await ArtisanProfile.create({
            profession,
            user_id: user.id,
          });
          break;
        }
        case "SUPPLIER": {
          profile = await SupplierProfile.create({
            shopName,
            shopAddress,
            inventory,
            user_id: user.id,
          });
          break;
        }
        case "DELIVERY_MAN": {
          profile = await DeliveryManProfile.create({
            nationalCardNumber,
            vehicle,
            user_id: user.id,
          });
          break;
        }
        case "ADMIN": {
          // No profile needed for ADMIN (for now)
          break;
        }
      }

      user = await User.findByPk(user.id, {
        include: [
          { model: ClientProfile, as: "clientProfile" },
          { model: ArtisanProfile, as: "artisanProfile" },
          { model: SupplierProfile, as: "supplierProfile" },
          { model: DeliveryManProfile, as: "deliveryManProfile" },
        ],
      });

      const sanitizedUser = exclude(user, ["password"]);
      return response.status(201).json({ user: sanitizedUser, profile });
    } catch (error) {
      return next(error);
    }
  }

  async getUserUsingIdOrEmailOrPhoneNumber(request, response, next) {
    try {
      const query = request.params.id;
      if (!query)
        return response.status(400).json({ message: "No query provided" });

      const user = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { id: query },
            { email: query },
            { phone: query },
          ],
        },
        include: [
          { model: ClientProfile, as: "clientProfile" },
          { model: ArtisanProfile, as: "artisanProfile" },
          { model: SupplierProfile, as: "supplierProfile" },
          { model: DeliveryManProfile, as: "deliveryManProfile" },
        ],
      });

      if (!user)
        return response.status(404).json({ message: "User not found" });

      const sanitizedUser = exclude(user, ["password"]);
      return response.status(200).json(sanitizedUser);
    } catch (error) {
      return next(error);
    }
  }

  async updateUserById(request, response, next) {
    try {
      const userId = request.params.id;
      if (!userId)
        return response.status(400).json({ message: "User ID not provided" });

      if (request.user.userId !== userId && request.user.role !== "ADMIN")
        return response.status(403).json({ message: "Unauthorized" });

      const { firstname, lastname, email, phone, password } = request.body;

      if (email) {
        const existing = await User.findOne({
          where: { email, id: { [Sequelize.Op.ne]: userId } },
        });
        if (existing)
          return response.status(409).json({ message: "Email already in use" });
      }

      const data = { firstname, lastname, email, phone };
      if (password) data.password = password; // Will be hashed by beforeUpdate hook

      const result = await User.update(data, {
        where: { id: userId },
      });

      if (!result || result[0] === 0)
        return response
          .status(404)
          .json({ message: "User not found or no update performed" });

      const updatedUser = await User.findByPk(userId, {
        include: [
          { model: ClientProfile, as: "clientProfile" },
          { model: ArtisanProfile, as: "artisanProfile" },
          { model: SupplierProfile, as: "supplierProfile" },
          { model: DeliveryManProfile, as: "deliveryManProfile" },
        ],
      });
      const sanitizedUser = exclude(updatedUser, ["password"]);
      return response.status(200).json(sanitizedUser);
    } catch (error) {
      return next(error);
    }
  }

  async loginUser(request, response, next) {
    try {
      const { email, password } = request.body;

      const user = await User.findOne({ where: { email } });
      if (!user)
        return response
          .status(404)
          .json({ message: "This email does not exist" });

      const isMatch = await user.validPassword(password);
      if (!isMatch)
        return response
          .status(400)
          .json({ message: "Invalid password or email" });

      const token = generateAccessToken(user.id, user.role);
      const sanitizedUser = exclude(user, ["password"]);
      return response.status(200).json({ token, user: sanitizedUser });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUserById(request, response, next) {
    try {
      const userId = request.params.id;
      if (!userId)
        return response.status(400).json({ message: "No user ID provided" });

      if (request.user.userId !== userId && request.user.role !== "ADMIN")
        return response.status(403).json({ message: "Unauthorized" });

      const userExists = await User.findByPk(userId);
      if (!userExists)
        return response.status(404).json({ message: "User not found" });

      await User.destroy({ where: { id: userId } });
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();
