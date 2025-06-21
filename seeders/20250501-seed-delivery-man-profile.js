export const up = async (queryInterface) => {
  await queryInterface.bulkInsert(
    "deliveryManProfiles", // Matches tableName in model
    [
      {
        id: "9b5bb690-6339-4ef9-3333-91010431b96a",
        nationalCardNumber: "05964275867113459678",
        vehicle: "CAR",
        user_id: "9b5bb690-6339-4ef9-2222-91010431b96a", // Refers to delivery man user ID
      },
    ],
    {}
  );
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete(
    "deliveryManProfiles",
    { user_id: "9b5bb690-6339-4ef9-2222-91010431b96a" },
    {}
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */