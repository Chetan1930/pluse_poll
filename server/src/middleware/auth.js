import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';
import { HTTP_STATUS, JWT_COOKIE_NAME } from '../config/constants.js';

/**
 * Protect routes — requires a valid JWT in cookie or Authorization header.
 * Attaches `req.user` on success.
 */
export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[JWT_COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Token expired');
    }
    next(error);
  }
};

/**
 * Require a specific role (or one of several roles).
 * Must be used after `protect` so req.user is set.
 *
 * Usage: router.get('/admin', protect, requireRole('admin'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
  }
  if (!roles.includes(req.user.role)) {
    return sendError(
      res,
      HTTP_STATUS.FORBIDDEN,
      `Access denied: requires one of [${roles.join(', ')}] role`,
    );
  }
  next();
};

/**
 * Optionally attach user if a valid token is present.
 * Does NOT reject unauthenticated requests.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.[JWT_COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    // silently ignore invalid tokens for optional auth
  }
  next();
};
