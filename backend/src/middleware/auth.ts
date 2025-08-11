import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  
  // Explicitly handle missing token
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = auth.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'id' in decoded &&
      'email' in decoded
    ) {
      req.user = {
        id: String((decoded as JwtPayload).id),
        email: String((decoded as JwtPayload).email),
      };
      return next();
    }

    return res.status(401).json({ error: 'Invalid token payload' });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
