import type { Request, Response, NextFunction } from 'express';
import { rateLimited } from '../errors.js';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

const counters = new Map<string, { count: number; resetAt: number }>();

export function withRateLimiter(options: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = counters.get(key);

    if (!entry || now > entry.resetAt) {
      counters.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    entry.count++;
    if (entry.count > options.max) {
      return res.status(429).json(rateLimited());
    }

    next();
  };
}
