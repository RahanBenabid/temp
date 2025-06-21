import Sequelize from "sequelize";
import bcrypt from "bcrypt";
import db from "./../models/index.js";
import { generateAccessToken } from "./../config/jwtConfig.js";

const User = db.user;
const ClientProfile = db.clientProfile;
const ArtisanProfile = db.artisanProfile;
const SupplierProfile = db.supplierProfile;
const DeliveryManProfile = db.deliveryManProfile;

const exclude = (user, fields) => {
  if (!user) return null;
  const userObject = user.toJSON();
  fields.forEach((field) => delete userObject[field]);
  return userObject;
};

class UserController {
  async getAllUsers(req, res, next) {
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
        return res.status(404).json({ message: "No users found" });
      const sanitizedUsers = users.map((user) => exclude(user, ["password"]));
      return res.status(200).json(sanitizedUsers);
    } catch (err) {
      return next(err);
    }
  }

  async createUser(req, res, next) {
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
      } = req.body;

      const requesterRole = req.user?.role;

      // check required fields
      if (!firstname || !lastname || !password || !email)
        return res.status(400).json({ message: "Missing required fields" });
      if (role === "ARTISAN" && !profession)
        return res
          .status(400)
          .json({ message: "Profession required for ARTISAN" });
      if (role === "SUPPLIER" && (!shopName || !shopAddress))
        return res
          .status(400)
          .json({ message: "Shop name and address required for SUPPLIER" });
      if (role === "DELIVERY_MAN" && (!nationalCardNumber || !vehicle))
        return res
          .status(400)
          .json({
            message:
              "National card number and vehicle required for DELIVERY_MAN",
          });

      let existingUser = await User.findOne({ where: { email } });
      if (existingUser)
        return res.status(409).json({ message: "Email already in use" });

      existingUser = await User.findOne({ where: { phone } });
      if (existingUser)
        return res.status(409).json({ message: "Phone number already in use" });

      const userData = {
        firstname,
        lastname,
        phone,
        email,
        password,
        role: req.body.role?.toUpperCase() || "CLIENT",
      };
      let user = await User.create(userData);

      let profile;
      switch (userData.role) {
        case "CLIENT":
          profile = await ClientProfile.create({ address, user_id: user.id });
          break;
        case "ARTISAN":
          profile = await ArtisanProfile.create({
            profession,
            user_id: user.id,
          });
          break;
        case "SUPPLIER":
          profile = await SupplierProfile.create({
            shopName,
            shopAddress,
            inventory,
            user_id: user.id,
          });
          break;
        case "DELIVERY_MAN":
          profile = await DeliveryManProfile.create({
            nationalCardNumber,
            vehicle,
            user_id: user.id,
          });
          break;
        case "ADMIN":
          // No profile needed for ADMIN (for now)
          break;
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
      return res.status(201).json({ user: sanitizedUser, profile });
    } catch (err) {
      return next(err);
    }
  }

  async getUserUsingIdOrEmailOrPhoneNumber(req, res, next) {
    try {
      const query = req.params.id;
      if (!query) return res.status(400).json({ message: "No query provided" });

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

      if (!user) return res.status(404).json({ message: "User not found" });

      const sanitizedUser = exclude(user, ["password"]);
      return res.status(200).json(sanitizedUser);
    } catch (err) {
      return next(err);
    }
  }

  async updateUserById(req, res, next) {
    try {
      const userId = req.params.id;
      if (!userId)
        return res.status(400).json({ message: "User ID not provided" });

      if (req.user.userId !== userId && req.user.role !== "ADMIN")
        return res.status(403).json({ message: "Unauthorized" });

      const { firstname, lastname, email, phone, password } = req.body;

      if (email) {
        const existing = await User.findOne({
          where: { email, id: { [Sequelize.Op.ne]: userId } },
        });
        if (existing)
          return res.status(409).json({ message: "Email already in use" });
      }

      const data = { firstname, lastname, email, phone };
      if (password) data.password = password; // Will be hashed by beforeUpdate hook

      const result = await User.update(data, {
        where: { id: userId },
      });

      if (!result || result[0] === 0)
        return res
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
      return res.status(200).json(sanitizedUser);
    } catch (err) {
      return next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user)
        return res.status(404).json({ message: "This email does not exist" });

      const isMatch = await user.validPassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid password or email" });

      const token = generateAccessToken(user.id, user.role);
      const sanitizedUser = exclude(user, ["password"]);
      return res.status(200).json({ token, user: sanitizedUser });
    } catch (err) {
      return next(err);
    }
  }

  async deleteUserById(req, res, next) {
    try {
      const userId = req.params.id;
      if (!userId)
        return res.status(400).json({ message: "No user ID provided" });

      if (req.user.userId !== userId && req.user.role !== "ADMIN")
        return res.status(403).json({ message: "Unauthorized" });

      const userExists = await User.findByPk(userId);
      if (!userExists)
        return res.status(404).json({ message: "User not found" });

      await User.destroy({ where: { id: userId } });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

export default new UserController();
