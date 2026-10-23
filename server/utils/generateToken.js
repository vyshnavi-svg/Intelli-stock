const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_intelligent_inventory_2026_xyz',
    {
      expiresIn: '7d',
    }
  );
};

module.exports = generateToken;
