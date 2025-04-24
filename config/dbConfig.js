import db from "../models/index.js";

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();

    // the line below resets the database and its tables each time the server is ran, comment it to stop this behaviour
    await db.sequelize.sync({ force: true });

    console.log("Connection to the database established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
};

export default connectDB;
