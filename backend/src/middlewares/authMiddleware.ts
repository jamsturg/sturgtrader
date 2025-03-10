import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { logger } from '../server';

// Extend the Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware to verify Firebase ID tokens
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }
    
    // Extract the token from Authorization header
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add the user information to the request object
    req.user = decodedToken;
    
    return next();
  } catch (error: any) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    
    const userRole = req.user.role || 'user';
    
    if (roles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  };
};
