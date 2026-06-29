const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, please login first' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password_hash');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token failed or expired' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an owner' });
  }
};

module.exports = { protect, admin };
