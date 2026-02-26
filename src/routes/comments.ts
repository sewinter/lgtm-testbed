import { Router } from 'express';
import { withRateLimiter } from '../middleware/rate-limiter.js';
import { withValidation } from '../middleware/validate.js';
import { listCommentsByTask, createComment } from '../services/comment-service.js';
// Need task existence check before adding a comment
import { findTaskById } from '../db/queries.js';
import { notFound } from '../errors.js';

const router = Router({ mergeParams: true });

// GET /tasks/:id/comments — list comments for a task (public, rate-limited)
router.get('/',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (req, res) => {
    const task = findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json(notFound('Task', req.params.id));
    }

    const comments = await listCommentsByTask(req.params.id);
    res.json({ comments });
  },
);

// POST /tasks/:id/comments — add a comment to a task (rate-limited, validated)
router.post('/',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withValidation({ required: ['authorId', 'body'], types: { authorId: 'string', body: 'string' } }),
  async (req, res) => {
    const task = findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json(notFound('Task', req.params.id));
    }

    const comment = await createComment(req.params.id, req.body);
    res.status(201).json({ comment });
  },
);

export { router as commentRoutes };
