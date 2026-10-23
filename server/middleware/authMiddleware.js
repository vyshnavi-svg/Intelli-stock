const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_intelligent_inventory_2026_xyz'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found with this token' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid, please sign in again' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
