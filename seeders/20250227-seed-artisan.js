import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("artisan123", salt);

  await queryInterface.bulkInsert(
    "users",
    [
      {
        id: "9b5bb690-6339-4ef9-acb9-91010431b96a",
        firstname: "Artisan",
        lastname: "Man",
        phone: "+213551234599",
        email: "artisan@example.com",
        password: hashedPassword,
        role: "ARTISAN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete(
    "users",
    { email: "artisan@example.com" },
    {},
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */
