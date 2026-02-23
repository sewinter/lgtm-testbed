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
  };

  insertUser(user);
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  // fetches user regardless of soft-delete status — callers should check deletedAt if needed
  return findUserById(id);
}

export async function listUsers(pagination: PaginationParams): Promise<User[]> {
  return findUsers(pagination);
}

export async function deleteUser(id: string): Promise<boolean> {
  const existing = findUserById(id);
  if (!existing) return false;
  if (existing.deletedAt) return false; // already deleted

  softDeleteUser(id, new Date().toISOString());
  return true;
}

export async function restoreUser(id: string): Promise<User | null> {
  const existing = findUserById(id);
  if (!existing || !existing.deletedAt) return null;

  restoreUserById(id);
  // re-fetch to return the updated record
  return findUserById(id);
}
