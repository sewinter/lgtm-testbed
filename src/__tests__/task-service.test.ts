import { describe, it, expect } from 'vitest';
import { createTask, getTaskById, listTasks, updateTask } from '../services/task-service.js';

describe('task-service', () => {
  it('creates a task with valid input', async () => {
    const task = await createTask({
      title: 'Fix login bug',
      description: 'Users cannot log in with email',
      assigneeId: 'user-1',
    });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Fix login bug');
    expect(task.status).toBe('todo');
  });

  it('returns null for nonexistent task', async () => {
    const task = await getTaskById('nonexistent-id');
    expect(task).toBeNull();
  });

  it('lists tasks with pagination', async () => {
    const tasks = await listTasks({ limit: 10, offset: 0 });
    expect(Array.isArray(tasks)).toBe(true);
  });

  it('returns null when updating nonexistent task', async () => {
    const result = await updateTask('nonexistent-id', { title: 'New title' });
    expect(result).toBeNull();
  });
});
