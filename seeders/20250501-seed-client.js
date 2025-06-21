import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("client123", salt);

  const clientId = "9b5bb690-6339-4ef9-7777-91010431b96a";

  await queryInterface.bulkInsert(
    "users",
    [
      {
        id: clientId,
        firstname: "Mohammed",
        lastname: "Ahmed",
        phone: "+213551239876",
        email: "client@example.com",
        password: hashedPassword,
        role: "CLIENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {}
  );

  return clientId;
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete("users", { email: "client@example.com" }, {});
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */