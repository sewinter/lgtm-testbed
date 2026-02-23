import type { Task } from '../types.js';

export interface NotificationPayload {
  taskId: string;
  assigneeId: string;
  event: 'task.created' | 'task.updated' | 'task.notify';
  title: string;
  status: string;
  timestamp: string;
}

/**
 * Builds a notification payload from a task and an event type.
 */
export function buildNotificationPayload(
  task: Task,
  event: NotificationPayload['event'],
): NotificationPayload {
  return {
    taskId: task.id,
    assigneeId: task.assigneeId,
    event,
    title: task.title,
    status: task.status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Dispatches a notification. Currently writes to stdout; swap out for
 * a real transport (email, webhook, etc.) as needed.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  // TODO: replace with real transport
  console.log('[notification]', JSON.stringify(payload));
}

/**
 * Convenience wrapper — build and send in one call.
 */
export async function notifyTaskEvent(
  task: Task,
  event: NotificationPayload['event'],
): Promise<void> {
  const payload = buildNotificationPayload(task, event);
  await sendNotification(payload);
}
