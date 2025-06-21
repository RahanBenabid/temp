import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  // Use consistent IDs for easy reference
  const clientOrderId = "de7e93bc-f87f-48a1-9faa-e5a4b7bd25da"; // Matches the ID referenced in AdminAPI.sh
  
  await queryInterface.bulkInsert(
    "clientOrders",
    [
      {
        id: clientOrderId,
        clientId: "9b5bb690-6339-4ef9-7777-91010431b96a", // Client ID from client seeder
        artisanId: "9b5bb690-6339-4ef9-acb9-91010431b96a", // Artisan ID from artisan seeder
        status: "COMPLETED", // Set to COMPLETED to allow ratings
        description: "Home renovation project - Kitchen remodeling with new cabinets and countertops",
        totalAmount: 15000.00,
        paymentStatus: "COMPLETED", 
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago (when completed)
      }
    ],
    {}
  );
  
  // Add an entry to orderStatusHistory
  await queryInterface.bulkInsert(
    "orderStatusHistories",
    [
      {
        id: uuidv4(),
        orderId: clientOrderId,
        status: "PENDING",
        comment: "Order created",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        orderId: clientOrderId,
        status: "ACCEPTED",
        comment: "Order accepted by artisan",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        orderId: clientOrderId,
        status: "COMPLETED",
        comment: "Work completed successfully",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    {}
  );
  
  return clientOrderId;
};

export const down = async (queryInterface) => {
  const clientOrderId = "de7e93bc-f87f-48a1-9faa-e5a4b7bd25da";
  
  // Delete order status history entries first (maintain referential integrity)
  await queryInterface.bulkDelete(
    "orderStatusHistories", 
    { orderId: clientOrderId },
    {}
  );
  
  // Then delete the client order
  await queryInterface.bulkDelete(
    "clientOrders", 
    { id: clientOrderId },
    {}
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */