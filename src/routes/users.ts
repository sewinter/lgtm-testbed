import { Router } from 'express';
import { withRateLimiter } from '../middleware/rate-limiter.js';
import { withAuth } from '../middleware/auth.js';
import { withValidation } from '../middleware/validate.js';
import { createUser, getUserById, listUsers, deleteUser, restoreUser } from '../services/user-service.js';
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

// DELETE /users/:id — soft-delete a user (authenticated, rate-limited)
router.delete('/:id',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withAuth,
  async (req, res) => {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json(notFound('User', req.params.id));
    }
    res.status(204).send();
  },
);

// POST /users/:id/restore — restore a soft-deleted user (authenticated, rate-limited)
router.post('/:id/restore',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withAuth,
  async (req, res) => {
    const user = await restoreUser(req.params.id);
    if (!user) {
      // User not found or not currently deleted
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  },
);

export { router as userRoutes };
