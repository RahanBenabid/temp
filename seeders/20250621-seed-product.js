import { v4 as uuidv4 } from "uuid";

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize')} Sequelize
 */
export async function up(queryInterface, Sequelize) {
  // Replace with real supplierProfileId from your supplierProfiles table!
  const SUPPLIER_PROFILE_ID = "9b5bb690-6339-444a-2222-91010431b96a";

  await queryInterface.bulkInsert("products", [
    {
      id: uuidv4(),
      name: "Modern Product 1",
      description: "First modern seeded product.",
      price: 49.99,
      category: "Electronics",
      isAvailable: true,
      supplier_id: SUPPLIER_PROFILE_ID,
      imageUrl: "https://example.com/img1.jpg",
      type: "light",
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: "Modern Product 2",
      description: "Second modern seeded product.",
      price: 19.99,
      category: "Books",
      isAvailable: true,
      supplier_id: SUPPLIER_PROFILE_ID,
      imageUrl: "",
      type: "light",
      stock: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("products", null, {});
}
