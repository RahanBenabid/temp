import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default {
  port: process.env.PORT,
  host: process.env.HOST,
  hostUrl: process.env.HOST_URL,
  tokenSecret: process.env.TOKEN_SECRET,
};
