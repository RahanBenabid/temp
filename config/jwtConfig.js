import jwt from "jsonwebtoken";
import config from "./dotenv.js";

function generateAccessToken(id, role) {
  const payload = { userId: id, role: role };
  return jwt.sign(payload, config.tokenSecret, { expiresIn: "1h" });
}

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || authHeader === undefined) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  if (!token) res.sendStatus(403);

  jwt.verify(token, config.tokenSecret, (error, user) => {
    if (error) {
      console.error("Token verification failed: ", error);
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

export { generateAccessToken, authenticate };
