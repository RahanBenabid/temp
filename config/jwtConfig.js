import jwt from "jsonwebtoken";
import config from "./dotenv.js";

function generateAccessToken(id, role) {
  const payload = { userId: id, role: role };
  return jwt.sign(payload, config.tokenSecret, { expiresIn: "1h" });
}

function authenticate(request, response, next) {
  const authHeader = request.headers["authorization"];

  if (!authHeader || authHeader === undefined) return response.sendStatus(401);

  const token = authHeader.split(" ")[1];

  if (!token) response.sendStatus(403);

  jwt.verify(token, config.tokenSecret, (error, user) => {
    if (error) {
      console.error("Token verification failed:", error);
      request.user = undefined;
    } else {
      request.user = user;
    }
    next();
  });
}

export { generateAccessToken, authenticate };
