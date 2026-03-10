import { Router } from 'express';
import { withRateLimiter } from '../middleware/rate-limiter.js';
import { withAuth } from '../middleware/auth.js';
import { withValidation } from '../middleware/validate.js';
import { createTask, getTaskById, listTasks, updateTask, getTaskPriority } from '../services/task-service.js';
import { notFound } from '../errors.js';

const router = Router();

// GET /tasks — list all tasks (public, rate-limited)
router.get('/',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (_req, res) => {
    const tasks = await listTasks({ limit: 50, offset: 0 });
    res.json({ tasks });
  },
);

// GET /tasks/:id — get a single task (public, rate-limited)
router.get('/:id',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (req, res) => {
    const task = await getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json(notFound('Task', req.params.id));
    }
    res.json({ task });
  },
);

// GET /tasks/:id/priority — get computed priority (public, rate-limited)
router.get('/:id/priority',
  withRateLimiter({ windowMs: 60_000, max: 100 }),
  async (req, res) => {
    const priority = await getTaskPriority(req.params.id);
    if (priority === null) {
      return res.status(404).json(notFound('Task', req.params.id));
    }
    res.json({ taskId: req.params.id, priority });
  },
);

// POST /tasks — create a new task (authenticated, validated, rate-limited)
router.post('/',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withAuth,
  withValidation({ required: ['title', 'description', 'assigneeId'], types: { title: 'string', description: 'string' } }),
  async (req, res) => {
    const task = await createTask(req.body);
    res.status(201).json({ task });
  },
);

// PATCH /tasks/:id — update a task (authenticated, validated, rate-limited)
router.patch('/:id',
  withRateLimiter({ windowMs: 60_000, max: 50 }),
  withAuth,
  withValidation({ types: { title: 'string', description: 'string', status: 'string' } }),
  async (req, res) => {
    const task = await updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json(notFound('Task', req.params.id));
    }
    res.json({ task });
  },
);

export { router as taskRoutes };
