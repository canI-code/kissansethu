import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

/**
 * JWT authentication middleware.
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the JWT,
 * and attaches the decoded user document to `req.user`.
 *
 * On failure, responds with 401 so the client can redirect to login.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token has expired, please log in again'
          : 'Invalid token';
      return res.status(401).json({ success: false, message });
    }

    // Fetch the user so routes have access to full profile / roles
    const db = getDB();
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Attach to request for downstream handlers
    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Optional auth middleware — attaches user if token is present but does NOT
 * block the request when no token is provided. Useful for routes that behave
 * differently for authenticated vs. anonymous users.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token — continue unauthenticated
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDB();
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (user && !user.isDeleted) {
      req.user = user;
      req.userId = decoded.userId;
    }
  } catch {
    // Invalid token — just skip, don't block
  }

  next();
};
