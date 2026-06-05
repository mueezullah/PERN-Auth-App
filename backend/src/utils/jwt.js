import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
