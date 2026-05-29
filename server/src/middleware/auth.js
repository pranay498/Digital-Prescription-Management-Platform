const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const JWT_SECRET = process.env.JWT_SECRET || 'rxmanager_fallback_secret_key';

const authenticate = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[1]);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new ApiError(403, "Invalid or expired authentication token.")
    );
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied: Insufficient privileges.'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET
};
