const { verifyAccessToken } = require('../utils/auth');
const { AuthError, ForbiddenError } = require('../utils/response');
const db = require('../models/database');

// Role hierarchy: admin > analyst > viewer
const ROLE_LEVELS = { viewer: 1, analyst: 2, admin: 3 };

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(decoded.userId);
    if (!user) throw new AuthError('User no longer exists');
    if (user.status === 'inactive') throw new AuthError('Account is deactivated');

    req.user = decoded;
    req.user.currentRole = user.role; // Use DB role in case it was updated
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AuthError('Invalid or expired token'));
    }
    next(err);
  }
};

// Require minimum role level
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.currentRole;
    if (!userRole || !allowedRoles.includes(userRole)) {
      const minRole = allowedRoles.join(' or ');
      return next(new ForbiddenError(`This action requires ${minRole} role`));
    }
    next();
  };
};

// Require minimum role level (hierarchical)
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    const userLevel = ROLE_LEVELS[req.user?.currentRole] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 999;
    if (userLevel < requiredLevel) {
      return next(new ForbiddenError(`Requires at least ${minRole} privileges`));
    }
    next();
  };
};

// Resource ownership check (owner OR admin can act)
const requireOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getResourceOwnerId(req);
      const isOwner = req.user.userId === ownerId;
      const isAdmin = req.user.currentRole === 'admin';
      if (!isOwner && !isAdmin) {
        return next(new ForbiddenError('You do not have permission to modify this resource'));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { authenticate, requireRole, requireMinRole, requireOwnerOrAdmin };