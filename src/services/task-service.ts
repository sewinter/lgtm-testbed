import { findTaskById, insertTask, findTasks, updateTaskById } from '../db/queries.js';
import type { Task, CreateTaskInput, UpdateTaskInput, PaginationParams } from '../types.js';
import { randomUUID } from 'node:crypto';
import { notifyTaskEvent } from './notification-service.js';

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
  await notifyTaskEvent(task, 'task.created');
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

  // Send notification based on the current in-memory state before persisting,
  // so the assignee gets a heads-up as soon as possible.
  await notifyTaskEvent(updated, 'task.updated');

  updateTaskById(updated);
  return updated;
}
