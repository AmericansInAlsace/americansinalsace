import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions, authorize } from '@/lib/auth';
import { AuthService } from '@/services/AuthService';

vi.mock('@/services/AuthService', () => ({
  AuthService: {
    verifyCredentials: vi.fn(),
  },
}));

describe('lib/auth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authorize function', () => {
    it('should return mapped user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: {
          name: 'ADMIN',
          permissions: [{ action: 'READ', resource: 'ALL' }]
        },
      };

      vi.mocked(AuthService.verifyCredentials).mockResolvedValue(mockUser as any);

      const result = await authorize({
        email: 'test@example.com',
        password: 'password123'
      }, {} as any);

      expect(AuthService.verifyCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'John Doe',
        role: 'ADMIN',
        permissions: [{ action: 'READ', resource: 'ALL' }],
      });
    });

    it('should return null if credentials missing', async () => {
      const result = await authorize(undefined, {} as any);
      expect(result).toBeNull();
    });

    it('should return null if AuthService returns null', async () => {
      vi.mocked(AuthService.verifyCredentials).mockResolvedValue(null);
      const result = await authorize({
        email: 'wrong@example.com',
        password: 'wrong'
      }, {} as any);
      expect(result).toBeNull();
    });

    it('should throw error if AuthService throws', async () => {
      const errorMessage = 'Please verify your email';
      vi.mocked(AuthService.verifyCredentials).mockRejectedValue(new Error(errorMessage));

      await expect(authorize({
        email: 'test@example.com',
        password: 'pass'
      }, {} as any)).rejects.toThrow(errorMessage);
    });
  });

  describe('callbacks', () => {
    it('jwt callback should add user info to token', async () => {
      const token = {};
      const user = { id: 1, role: 'ADMIN', permissions: [] };
      const result = await (authOptions.callbacks as any).jwt({ token, user });
      expect(result).toEqual({ id: 1, role: 'ADMIN', permissions: [] });
    });

    it('session callback should add token info to session', async () => {
      const session = { user: { name: 'Test' } };
      const token = { id: 1, role: 'ADMIN', permissions: [] };
      const result = await (authOptions.callbacks as any).session({ session, token });
      expect(result.user.id).toBe(1);
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.permissions).toEqual([]);
    });
  });
});
