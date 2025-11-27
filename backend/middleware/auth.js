const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const extractBearer = (authHeader) =>
  typeof authHeader === "string" && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

/*
 * Optional authentication middleware — attaches req.user if a valid token is provided,
 * otherwise continues silently.
 */
const optionalAuth = async (req, res, next) => {
  const token = extractBearer(req.headers.authorization);
  if (!token) return next();

  if (!ACCESS_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET is not set.");
    return next();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const userId = decoded.id || decoded.userId;
    if (!userId) return next();

    const user = await User.findById(userId).select("-password");
    if (user && user.isActive) req.user = user;
    return next();
  } catch (err) {
    // On any error, continue without authentication
    return next();
  }
};

/**
 * Required authentication middleware — must provide a valid JWT.
 * On success attaches req.user and calls next(); otherwise returns a 4xx response.
 */
async function requiredAuth(req, res, next) {
  const token = extractBearer(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "No authentication token provided." });
  }

  if (!ACCESS_TOKEN_SECRET) {
    console.error("CRITICAL: ACCESS_TOKEN_SECRET is not set.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      console.error("Token payload missing userId", decoded);
      return res.status(403).json({ message: "Invalid token payload." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.isActive) return res.status(403).json({ message: "Your account has been deactivated." });

    req.user = user;
    return next();
  } catch (err) {
    const name = err?.name;
    if (name === "TokenExpiredError") {
      return res.status(403).json({ message: "Your session has expired. Please log in again." });
    }
    if (name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid authentication token. Please log in again." });
    }

    console.error("Authentication failed:", { message: err?.message, name });
    return res.status(403).json({ message: "Invalid or expired authentication token." });
  }
}

module.exports = requiredAuth;
module.exports.optionalAuth = optionalAuth;
