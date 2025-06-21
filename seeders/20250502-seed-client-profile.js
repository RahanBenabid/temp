export const up = async (queryInterface) => {
  await queryInterface.bulkInsert(
    "clientProfiles", // Matches tableName in model
    [
      {
        id: "9b5bb690-6339-8888-7777-91010431b96a",
        address: "15 Residential Street, Algiers",
        user_id: "9b5bb690-6339-4ef9-7777-91010431b96a", // Refers to client user ID
      },
    ],
    {}
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete(
    "clientProfiles",
    { user_id: "9b5bb690-6339-4ef9-7777-91010431b96a" },
    {}
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */