const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
  }
};

// Optional role-based access, wired but not enforced anywhere by default —
// see README "Extending to role-based access".
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
  }
  next();
};

module.exports = { protect, requireRole };
