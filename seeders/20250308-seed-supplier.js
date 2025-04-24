import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("supplier123", salt);

  await queryInterface.bulkInsert(
    "users",
    [
      {
        id: "9b5bb690-6339-444a-2222-91010431b96a",
        firstname: "Ben",
        lastname: "Dhover",
        phone: "+213991234444",
        email: "supplier@gmail.com",
        password: hashedPassword,
        role: "SUPPLIER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete("users", { email: "supplier@gmail.com" }, {});
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */
