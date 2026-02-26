import type { Task } from '../types.js';
import { randomUUID } from 'node:crypto';

export interface Notification {
  id: string;
  taskId: string;
  assigneeId: string;
  message: string;
  sentAt: string;
}

// In-memory store — swap out for DB persistence later
const notifications: Notification[] = [];

/**
 * Sends a notification to the assignee of the given task.
 * Returns the created notification record.
 */
export async function notifyAssignee(task: Task, message: string): Promise<Notification> {
  const notification: Notification = {
    id: randomUUID(),
    taskId: task.id,
    assigneeId: task.assigneeId,
    message,
    sentAt: new Date().toISOString(),
  };

  // Simulate async delivery (e.g. push to a queue or webhook)
  await Promise.resolve();

  notifications.push(notification);
  console.log(`[notify] task=${task.id} assignee=${task.assigneeId} msg="${message}"`);

  return notification;
}

/**
 * Returns all notifications for a given task, ordered newest-first.
 */
export async function getNotificationsForTask(taskId: string): Promise<Notification[]> {
  return notifications
    .filter((n) => n.taskId === taskId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}
