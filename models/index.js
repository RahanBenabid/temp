"use strict";

import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM (since __dirname is not available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Import config dynamically
const config = (
  await import(`file://${__dirname}/../config/config.json`, {
    with: { type: "json" },
  })
).default[env];

const db = {};

// Set up Sequelize connection based on the environment
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Read and import all models from the models directory
const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    file.indexOf(".test.js") === -1
  );
});

for (const file of files) {
  const modelModule = await import(`file://${path.join(__dirname, file)}`);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Associate models
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    console.log(`Associating model: ${modelName}`);
    db[modelName].associate(db);
  }
}

// Add Sequelize instance and DataTypes to the db object for use throughout the app
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
