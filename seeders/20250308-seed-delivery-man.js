import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("deliverer123", salt);

  await queryInterface.bulkInsert(
    "users",
    [
      {
        id: "9b5bb690-6339-4ef9-2222-91010431b96a",
        firstname: "Nick",
        lastname: "Gur",
        phone: "+213551234444",
        email: "deliver@gmail.com",
        password: hashedPassword,
        role: "DELIVERY_MAN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete("users", { email: "deliver@gmail.com" }, {});
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */
