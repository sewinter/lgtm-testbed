import { findUserById, findUserByEmail, insertUser, findUsers } from '../db/queries.js';
import type { User, CreateUserInput, PaginationParams } from '../types.js';
import { randomUUID } from 'node:crypto';

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = findUserByEmail(input.email);
  if (existing) {
    throw new Error(`User with email '${input.email}' already exists`);
  }

  const user: User = {
    id: randomUUID(),
    email: input.email,
    name: input.name,
    role: input.role,
    createdAt: new Date().toISOString(),
  };

  insertUser(user);
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  return findUserById(id);
}

export async function listUsers(pagination: PaginationParams): Promise<User[]> {
  return findUsers(pagination);
}
