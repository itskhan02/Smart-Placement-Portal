const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticate = async (req, res, next) => {
  try {
const authHeader = req.headers.authorization;
const bearerToken = authHeader?.startsWith("Bearer ")
  ? authHeader.split(" ")[1]
  : null;
const token = req.cookies.token || bearerToken;

if (!token) {
  return res.status(401).json({ message: "Not authenticated" });
}

const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

const user = await User.findById(decoded.userId);

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

if (!user.isActive) {
  return res.status(403).json({ message: "Account disabled" });
}

if (user.isBanned) {
  return res.status(403).json({
    message: "Your account is banned",
  });
}

req.user = user;
next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

//role based authorization

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: "Access denied, insufficient permissions" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: "Authorization failed" });
    }
  };
};

module.exports = { isAuthenticate, authorizeRoles };
