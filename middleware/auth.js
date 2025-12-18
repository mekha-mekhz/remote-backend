const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authuser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.SECRET_KEY || process.env.secretkey
    );

    req.user = verified; // contains id, email, role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please login" });
    }

    // FIXED → use req.user.role (because JWT stores "role")
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
