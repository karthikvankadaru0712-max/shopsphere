import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/responseHelper.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication required. Please sign in.');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 401, 'User account not found or deleted.');
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'disabled') {
      return errorResponse(res, 403, 'Your account is suspended. Please contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Session expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid authentication token.');
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId);
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, `Access denied. Requires one of [${roles.join(', ')}] role.`);
    }
    next();
  };
};
