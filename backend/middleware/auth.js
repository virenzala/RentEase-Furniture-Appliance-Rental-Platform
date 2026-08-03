const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rentease_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user from our DB simulator or fallback to token payload
      let user = await User.findById(decoded.id);
      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email });
      }

      if (!user && decoded && decoded.id) {
        user = {
          _id: decoded.id,
          name: decoded.name || 'Leaseholder',
          email: decoded.email || 'user@rentease.com',
          role: decoded.role || 'user',
          phone: decoded.phone || '',
          address: decoded.address || ''
        };
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT auth verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user ? req.user.role : 'none'}' does not have access`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
