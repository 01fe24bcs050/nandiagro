const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      // Log token for debugging
      console.log('Token Validation:', {
        tokenPresent: !!token,
        tokenLength: token ? token.length : 0
      });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          message: 'User not found',
          details: 'Token is valid, but user does not exist'
        });
      }

      next();
    } else {
      return res.status(401).json({ 
        message: 'Not authorized',
        details: 'No token provided or incorrect format'
      });
    }
  } catch (error) {
    console.error('Token Verification Error:', {
      message: error.message,
      name: error.name
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid Token',
        details: 'Token verification failed'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token Expired',
        details: 'Please log in again'
      });
    }

    res.status(500).json({ 
      message: 'Authentication Error',
      details: error.message 
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
