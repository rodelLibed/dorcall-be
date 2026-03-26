import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Agent from '../models/Agent';

interface DecodedToken {
  id: number;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User | Agent;
  userId?: number;
  userRole?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized, no token' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;

    // Find user based on role
    let user;
    if (decoded.role === 'admin') {
      user = await User.findByPk(decoded.id);
    } else {
      user = await Agent.findByPk(decoded.id);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Attach user info to request
    req.user = user;
    req.userId = decoded.id;
    req.userRole = decoded.role;

next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    return;
  }
  next();
};
