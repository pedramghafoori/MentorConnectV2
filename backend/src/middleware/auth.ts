import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  console.log('=== authenticateToken middleware ===');
  console.log('Token from cookies:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('No token in cookies');
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    console.log('Decoded token:', decoded);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    console.log('User object attached to request:', req.user);
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}; 