import { v4 as uuidv4 } from "uuid";

export const up = async (queryInterface) => {
  const clientOrderId = "de7e93bc-f87f-48a1-9faa-e5a4b7bd25da"; // The client order ID from previous seeder
  const clientId = "9b5bb690-6339-4ef9-7777-91010431b96a"; // Client ID
  const artisanId = "9b5bb690-6339-4ef9-acb9-91010431b96a"; // Artisan ID
  
  // Create two ratings:
  // 1. Client rating the artisan
  // 2. Artisan rating the client
  
  await queryInterface.bulkInsert(
    "ratings",
    [
      {
        id: uuidv4(),
        score: 5,
        comment: "Excellent work! The kitchen renovation exceeded my expectations. Very professional and completed on time.",
        raterType: "CLIENT",
        rateeType: "ARTISAN",
        raterId: clientId,
        rateeId: artisanId,
        orderId: clientOrderId,
        orderType: "CLIENT_ORDER",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        score: 4,
        comment: "Great client, clear requirements and prompt payment. Would work with again.",
        raterType: "ARTISAN",
        rateeType: "CLIENT",
        raterId: artisanId,
        rateeId: clientId,
        orderId: clientOrderId,
        orderType: "CLIENT_ORDER",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    {}
  );
  
  // Update the user average ratings
  // Since this is a seeder, we won't rely on the controller method but directly set values
  
  // Update artisan's average rating (received 5 from client)
  await queryInterface.bulkUpdate(
    "users",
    { averageRating: 5.0 },
    { id: artisanId }
  );
  
  // Update client's average rating (received 4 from artisan)
  await queryInterface.bulkUpdate(
    "users",
    { averageRating: 4.0 },
    { id: clientId }
  );
};

export const down = async (queryInterface) => {
  const clientOrderId = "de7e93bc-f87f-48a1-9faa-e5a4b7bd25da";
  
  // Delete ratings for this order
  await queryInterface.bulkDelete(
    "ratings", 
    { orderId: clientOrderId },
    {}
  );
  
  // Reset average ratings
  const clientId = "9b5bb690-6339-4ef9-7777-91010431b96a";
  const artisanId = "9b5bb690-6339-4ef9-acb9-91010431b96a";
  
  await queryInterface.bulkUpdate(
    "users",
    { averageRating: null },
    { id: clientId }
  );
  
  await queryInterface.bulkUpdate(
    "users",
    { averageRating: null },
    { id: artisanId }
  );
};

/*
 * now execute this command in the terminal
 * > npx sequelize db:seed:all
 */