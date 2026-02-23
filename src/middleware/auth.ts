import type { Request, Response, NextFunction } from 'express';
import { unauthorized } from '../errors.js';

export function withAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(unauthorized('Missing or invalid authorization header'));
  }

  const token = header.slice(7);
  if (!token || token.length < 10) {
    return res.status(401).json(unauthorized('Invalid token'));
  }

  next();
}
