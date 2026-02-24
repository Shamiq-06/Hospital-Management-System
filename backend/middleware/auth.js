const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new AppError('User not found', 404));
      }

      if (!req.user.isActive) {
        return next(new AppError('User account is deactivated', 403));
      }

      next();
    } catch (error) {
      return next(new AppError('Not authorized, token failed', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is verified
exports.checkVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your account first', 403));
  }
  next();
};
