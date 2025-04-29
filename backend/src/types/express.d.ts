import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: JwtPayload & {
      userId: string;
      role: string;
    };
  }
} 