import { findTaskById, insertTask, findTasks, updateTaskById } from '../db/queries.js';
import type { Task, CreateTaskInput, UpdateTaskInput, PaginationParams } from '../types.js';
import { randomUUID } from 'node:crypto';
import { notifyAssignee } from './notification-service.js';

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: 'todo',
    assigneeId: input.assigneeId,
    createdAt: now,
    updatedAt: now,
  };

  insertTask(task);
  return task;
}

export async function getTaskById(id: string): Promise<Task | null> {
  return findTaskById(id);
}

export async function listTasks(pagination: PaginationParams): Promise<Task[]> {
  return findTasks(pagination);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const existing = findTaskById(id);
  if (!existing) return null;

  const updated: Task = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  // Notify the assignee about the update — do this before persisting so we
  // can include the "before" state in the message if needed in future.
  // NOTE: notifyAssignee uses `updated` which reflects the new values.
  await notifyAssignee(updated, `Task "${updated.title}" has been updated`);

  updateTaskById(updated);
  return updated;
}
