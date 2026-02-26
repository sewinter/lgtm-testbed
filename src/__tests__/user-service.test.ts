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

  describe('searchUsers', () => {
    it('returns matching users when searching by name', async () => {
      await createUser({ email: 'bob@example.com', name: 'Bob', role: 'member' });
      const results = await searchUsers({ name: 'bob', limit: 10, offset: 0 });
      expect(results.some((u) => u.name === 'Bob')).toBe(true);
    });

    it('returns matching users when searching by email', async () => {
      await createUser({ email: 'carol@example.com', name: 'Carol', role: 'admin' });
      const results = await searchUsers({ email: 'carol', limit: 10, offset: 0 });
      expect(results.some((u) => u.email === 'carol@example.com')).toBe(true);
    });

    it('supports combining name and email filters', async () => {
      await createUser({ email: 'dave@example.com', name: 'Dave', role: 'member' });
      // Both filters match the same user
      const results = await searchUsers({ name: 'dave', email: 'dave', limit: 10, offset: 0 });
      expect(results.some((u) => u.name === 'Dave')).toBe(true);
    });

    it('returns empty array when no users match', async () => {
      const results = await searchUsers({ name: 'zzznomatch', limit: 10, offset: 0 });
      expect(results).toHaveLength(0);
    });

    it('returns all users when no filters are provided', async () => {
      const all = await listUsers({ limit: 100, offset: 0 });
      const searched = await searchUsers({ limit: 100, offset: 0 });
      expect(searched.length).toBe(all.length);
    });
  });
});
