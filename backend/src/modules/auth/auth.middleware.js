import { verifyToken } from "../../utils/jwt.js";

// Checks if user is logged in with a valid JWT
export const ensureAuthenticated = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({
      message: "Unauthorized, JWT token is required",
    });
  }
  try {
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized, JWT token wrong or expired",
    });
  }
};

// Checks if authenticated user has admin role
export const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
};
