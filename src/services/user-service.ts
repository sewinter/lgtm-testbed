import { findUserById, findUserByEmail, insertUser, findUsers, softDeleteUser, restoreUserById } from '../db/queries.js';
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
    deletedAt: null,
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

export async function deleteUser(id: string): Promise<boolean> {
  const existing = findUserById(id);
  if (!existing) return false;

  // Soft delete — preserve the record but mark as deleted
  softDeleteUser(id, new Date().toISOString());
  return true;
}

export async function restoreUser(id: string): Promise<User | null> {
  const existing = findUserById(id);
  if (!existing || !existing.deletedAt) return null;

  restoreUserById(id);

  // Re-fetch so caller gets the updated record
  return findUserById(id);
}
