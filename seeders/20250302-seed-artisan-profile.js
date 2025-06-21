export const up = async (queryInterface) => {
  await queryInterface.bulkInsert(
    "artisanProfiles", // Matches tableName in model
    [
      {
        id: "9b5bb690-6339-4ef9-acb9-91010431b99a",
        profession: "Idk Lol",
        user_id: "9b5bb690-6339-4ef9-acb9-91010431b96a",
      },
    ],
    {},
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete(
    "artisanProfiles",
    { id: "9b5bb690-6339-4ef9-acb9-91010431b96a" },
    {},
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */
