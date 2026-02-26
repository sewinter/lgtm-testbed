import { describe, it, expect } from 'vitest';
import { createUser, getUserById, listUsers, deleteUser } from '../services/user-service.js';

describe('user-service', () => {
  it('creates a user with valid input', async () => {
    const user = await createUser({ email: 'alice@example.com', name: 'Alice', role: 'member' });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.role).toBe('member');
  });

  it('rejects duplicate email', async () => {
    await createUser({ email: 'dup@example.com', name: 'First', role: 'member' });
    await expect(createUser({ email: 'dup@example.com', name: 'Second', role: 'member' }))
      .rejects.toThrow('already exists');
  });

  it('returns null for nonexistent user', async () => {
    const user = await getUserById('nonexistent-id');
    expect(user).toBeNull();
  });

  it('lists users with pagination', async () => {
    const users = await listUsers({ limit: 10, offset: 0 });
    expect(Array.isArray(users)).toBe(true);
  });

  it('deletes a user by id', async () => {
    const user = await createUser({ email: 'todelete@example.com', name: 'ToDelete', role: 'member' });
    const result = await deleteUser(user.id);
    // hard delete — user should be gone
    expect(result).toBe(true);
    const fetched = await getUserById(user.id);
    expect(fetched).toBeNull();
  });

  it('returns false when deleting nonexistent user', async () => {
    const result = await deleteUser('nonexistent-id');
    expect(result).toBe(false);
  });
});
