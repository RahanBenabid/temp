import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);

  await queryInterface.bulkInsert(
    "users",
    [
      {
        id: uuidv4(),
        firstname: "Admin",
        lastname: "User",
        phone: "+213551234567",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete("users", { email: "admin@example.com" }, {});
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */
