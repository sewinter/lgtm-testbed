import { findCommentsByTaskId, insertComment } from '../db/queries.js';
import type { Comment, CreateCommentInput } from '../types.js';
import { randomUUID } from 'node:crypto';

export async function listCommentsByTask(taskId: string): Promise<Comment[]> {
  return findCommentsByTaskId(taskId);
}

export async function createComment(
  taskId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  const comment: Comment = {
    id: randomUUID(),
    taskId,
    authorId: input.authorId,
    body: input.body,
    createdAt: new Date().toISOString(),
  };

  insertComment(comment);
  return comment;
}
