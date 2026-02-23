import Database from 'better-sqlite3';
import type { User, Task, Comment, PaginationParams } from '../types.js';

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'done')),
    assignee_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );
`);

// --- User queries (all parameterized) ---

export function findUserById(id: string): User | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export function findUserByEmail(email: string): User | null {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export function insertUser(user: User): void {
  db.prepare(
    'INSERT INTO users (id, email, name, role, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(user.id, user.email, user.name, user.role, user.createdAt);
}

export function findUsers(pagination: PaginationParams): User[] {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(pagination.limit, pagination.offset) as Record<string, unknown>[];
  return rows.map(mapUser);
}

// --- Task queries (all parameterized) ---

export function findTaskById(id: string): Task | null {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? mapTask(row) : null;
}

export function insertTask(task: Task): void {
  db.prepare(
    'INSERT INTO tasks (id, title, description, status, assignee_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(task.id, task.title, task.description, task.status, task.assigneeId, task.createdAt, task.updatedAt);
}

export function findTasks(pagination: PaginationParams): Task[] {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(pagination.limit, pagination.offset) as Record<string, unknown>[];
  return rows.map(mapTask);
}

export function updateTaskById(task: Task): void {
  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, status = ?, assignee_id = ?, updated_at = ? WHERE id = ?',
  ).run(task.title, task.description, task.status, task.assigneeId, task.updatedAt, task.id);
}

// --- Comment queries (all parameterized) ---

export function insertComment(comment: Comment): void {
  db.prepare(
    'INSERT INTO comments (id, task_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(comment.id, comment.taskId, comment.authorId, comment.body, comment.createdAt);
}

export function findCommentsByTaskId(taskId: string): Comment[] {
  const rows = db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC')
    .all(taskId) as Record<string, unknown>[];
  return rows.map(mapComment);
}

// --- Row mappers ---

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as 'admin' | 'member',
    createdAt: row.created_at as string,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as 'todo' | 'in_progress' | 'done',
    assigneeId: row.assignee_id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    authorId: row.author_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}
