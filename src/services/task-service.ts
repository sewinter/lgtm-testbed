import { findTaskById, insertTask, findTasks, updateTaskById } from '../db/queries.js';
import type { Task, CreateTaskInput, UpdateTaskInput, PaginationParams } from '../types.js';
import { randomUUID } from 'node:crypto';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

function computePriority(task: Task): Priority {
  const age = Date.now() - new Date(task.createdAt).getTime();
  const dayMs = 86_400_000;
  if (age > 7 * dayMs) return 'urgent';
  if (age > 3 * dayMs) return 'high';
  if (age > 1 * dayMs) return 'medium';
  return 'low';
}

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
    id: existing.id,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    status: input.status ?? existing.status,
    assigneeId: input.assigneeId ?? existing.assigneeId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  updateTaskById(updated);
  return updated;
}

export async function getTaskPriority(id: string): Promise<Priority | null> {
  const task = findTaskById(id);
  if (!task) return null;
  return computePriority(task);
}
