import jwt from 'jsonwebtoken';
import { db } from '../db/storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campuscare_super_secret_jwt_key_2026_secure';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    // Strip passwordHash before attaching to req.user
    const { passwordHash, ...userSafe } = user;
    req.user = userSafe;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}` 
      });
    }
    next();
  };
};
