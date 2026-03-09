import { describe, it, expect } from 'vitest';
import { createUser, getUserById, listUsers, bulkDeleteUsers } from '../services/user-service.js';

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

  describe('bulkDeleteUsers', () => {
    it('returns zero deleted count when given empty array', async () => {
      const result = await bulkDeleteUsers([]);
      expect(result.deleted).toBe(0);
    });

    it('deletes existing users and returns count', async () => {
      const u1 = await createUser({ email: 'bulk1@example.com', name: 'Bulk One', role: 'member' });
      const u2 = await createUser({ email: 'bulk2@example.com', name: 'Bulk Two', role: 'member' });

      const result = await bulkDeleteUsers([u1.id, u2.id]);
      expect(result.deleted).toBe(2);

      const gone1 = await getUserById(u1.id);
      const gone2 = await getUserById(u2.id);
      expect(gone1).toBeNull();
      expect(gone2).toBeNull();
    });

    it('returns 0 when none of the provided IDs exist', async () => {
      const result = await bulkDeleteUsers(['ghost-id-1', 'ghost-id-2']);
      expect(result.deleted).toBe(0);
    });
  });
});
