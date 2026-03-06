export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export interface ErrorResponse {
  error: ApiError;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: 'admin' | 'member';
}

export interface CreateTaskInput {
  title: string;
  description: string;
  assigneeId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assigneeId?: string;
}

export interface CreateCommentInput {
  authorId: string;
  body: string;
}
