import { describe, it, expect } from 'vitest';
import { createUser, getUserById, listUsers, searchUsers } from '../services/user-service.js';

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

  it('returns matching users when query matches name', async () => {
    await createUser({ email: 'bob@example.com', name: 'Bob Builder', role: 'member' });
    const results = await searchUsers('Bob');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((u) => u.name === 'Bob Builder')).toBe(true);
  });

  it('returns matching users when query matches email', async () => {
    await createUser({ email: 'carol@example.com', name: 'Carol', role: 'admin' });
    const results = await searchUsers('carol@example');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((u) => u.email === 'carol@example.com')).toBe(true);
  });

  it('returns empty array when no users match the query', async () => {
    const results = await searchUsers('zzz-no-match-xyz');
    expect(results).toEqual([]);
  });

  it('returns empty array for blank query string', async () => {
    const results = await searchUsers('   ');
    expect(results).toEqual([]);
  });
});
