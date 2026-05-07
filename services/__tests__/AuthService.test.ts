import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../AuthService';
import { prisma } from '@/lib/db';
import argon2 from 'argon2';

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    verify: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 1,
        ...userData,
        password: 'hashed_password',
        bio: null,
        avatar: null,
        phone: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

      const result = await AuthService.registerUser(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(argon2.hash).toHaveBeenCalledWith(userData.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(userData.email);
    });

    it('should throw an error if required fields are missing', async () => {
      const userData = { email: 'john@example.com' };
      await expect(AuthService.registerUser(userData)).rejects.toThrow('Missing required fields');
    });

    it('should throw an error if user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1 } as any);

      await expect(AuthService.registerUser(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('verifyCredentials', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password: 'hashed_password',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(argon2.verify).mockResolvedValue(true);

      const result = await AuthService.verifyCredentials('john@example.com', 'password123');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('john@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await AuthService.verifyCredentials('non@exists.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ password: 'hashed' } as any);
      vi.mocked(argon2.verify).mockResolvedValue(false);
      const result = await AuthService.verifyCredentials('john@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });
});
