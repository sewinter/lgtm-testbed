import express from 'express';
import { userRoutes } from './routes/users.js';
import { taskRoutes } from './routes/tasks.js';
import { commentRoutes } from './routes/comments.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:id/comments', commentRoutes);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
