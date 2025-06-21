export const up = async (queryInterface) => {
  await queryInterface.bulkInsert(
    "supplierProfiles", // Matches tableName in model
    [
      {
        id: "9b5bb690-6339-5555-2222-91010431b96a",
        shopName: "Ben's Supplies",
        shopAddress: "123 Supply Street",
        inventory: JSON.stringify(["Tools", "Materials", "Hardware"]),
        user_id: "9b5bb690-6339-444a-2222-91010431b96a", // Refers to supplier user ID
      },
    ],
    {}
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete(
    "supplierProfiles",
    { user_id: "9b5bb690-6339-444a-2222-91010431b96a" },
    {}
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */