import { Router } from 'express';
import { withRateLimiter } from '../middleware/rate-limiter.js';
import { withAuth } from '../middleware/auth.js';
import { withValidation } from '../middleware/validate.js';
import { createUser, getUserById, listUsers, searchUsers } from '../services/user-service.js';
import { notFound } from '../errors.js';

const router = Router();

// GET /users — list all users (public, rate-limited)
router.get('/',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (_req, res) => {
    const users = await listUsers({ limit: 50, offset: 0 });
    res.json({ users });
  },
);

// GET /users/search — search users by name and/or email (public, rate-limited)
router.get('/search',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name.trim() : undefined;
    const email = typeof req.query.email === 'string' ? req.query.email.trim() : undefined;
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const offset = Number(req.query.offset ?? 0);

    const users = await searchUsers({ name, email, limit, offset });
    res.json({ users });
  },
);

// GET /users/:id — get a single user (public, rate-limited)
router.get('/:id',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json(notFound('User', req.params.id));
    }
    res.json({ user });
  },
);

// POST /users — create a new user (authenticated, validated, rate-limited)
router.post('/',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withAuth,
  withValidation({ required: ['email', 'name', 'role'], types: { email: 'string', name: 'string' } }),
  async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({ user });
  },
);

export { router as userRoutes };
