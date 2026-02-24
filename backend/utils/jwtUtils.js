const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  const token = exports.generateToken(user._id);

  const userResponse = {
    _id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    isActive: user.isActive,
    isVerified: user.isVerified
  };

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
};
