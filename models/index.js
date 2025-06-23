import fs from "node:fs";
import path from "node:path";
import Sequelize from "sequelize";
import process from "node:process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Get directory name in ESM (since __dirname is not available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const environment = process.env.NODE_ENV || "development";

// Import config dynamically
const config = (
  await import(`file://${__dirname}/../config/config.json`, {
    with: { type: "json" },
  })
).default[environment];

const database = {};

// Set up Sequelize connection based on the environment
let sequelize;
sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// Read and import all models from the models directory
const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    !file.includes(".test.js")
  );
});

for (const file of files) {
  const modelModule = await import(`file://${path.join(__dirname, file)}`);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  database[model.name] = model;
}

// Associate models
for (const modelName of Object.keys(database)) {
  if (database[modelName].associate) {
    console.log(`Associating model: ${modelName}`);
    database[modelName].associate(database);
  }
}

// Add Sequelize instance and DataTypes to the db object for use throughout the app
database.sequelize = sequelize;
database.Sequelize = Sequelize;

export default database;
