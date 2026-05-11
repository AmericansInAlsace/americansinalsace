import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/AuthService';
import { prisma } from '@/lib/db';
import argon2 from 'argon2';
import { MailService } from '@/services/MailService';

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
    },
    emailTemplate: {
      findUnique: vi.fn(),
    },
    emailLog: {
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

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks for RBAC and Email
    vi.mocked(prisma.role.findUnique).mockResolvedValue({ id: 1, name: 'BASIC_USER' } as any);
    vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
      id: 1,
      slug: 'test',
      subject: 'Test',
      content: 'Test content {{actionUrl}}'
    } as any);
  });

  describe('registerUser', () => {
    it('should successfully register a new user and send verification email', async () => {
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
        emailVerified: null,
        verificationToken: 'token123',
        tokenExpires: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

      const result = await AuthService.registerUser(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(argon2.hash).toHaveBeenCalledWith(userData.password);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(MailService.sendVerificationEmail).toHaveBeenCalledWith(userData.email, expect.any(String));
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(userData.email);
      });

      it('should register user even if basic role is missing', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john2@example.com',
        password: 'password123',
      };

      vi.mocked(prisma.role.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: 2, ...userData } as any);

      await AuthService.registerUser(userData);
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ role: undefined })
      }));
      });

      it('should throw an error if required fields are missing', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Unknown'));
      await expect(AuthService.registerUser({ firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'p' }))
        .rejects.toThrow('An unexpected error occurred during registration.');
    });

    it('should throw an error if required fields are missing', async () => {
      const userData = { email: 'john@example.com' };
      await expect(AuthService.registerUser(userData as any)).rejects.toThrow('Missing required fields');
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
    it('should return user if credentials are valid and email is verified', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password: 'hashed_password',
        emailVerified: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(argon2.verify).mockResolvedValue(true);

      const result = await AuthService.verifyCredentials('john@example.com', 'password123');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('john@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error if email is not verified', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        password: 'hashed_password',
        emailVerified: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(AuthService.verifyCredentials('john@example.com', 'password123'))
        .rejects.toThrow('Please verify your email address before logging in.');
    });

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await AuthService.verifyCredentials('non@exists.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        password: 'hashed',
        emailVerified: new Date(),
      } as any);
      vi.mocked(argon2.verify).mockResolvedValue(false);
      const result = await AuthService.verifyCredentials('john@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('should return null on unexpected error', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Unexpected'));
      const result = await AuthService.verifyCredentials('test@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      const mockUser = {
        id: 1,
        verificationToken: 'valid_token',
        tokenExpires: new Date(Date.now() + 10000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await AuthService.verifyEmail('valid_token');

      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ emailVerified: expect.any(Date) }),
      });
    });

    it('should throw error for invalid token', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(AuthService.verifyEmail('invalid')).rejects.toThrow('Invalid or expired verification token.');
    });

    it('should throw error for expired token', async () => {
      const mockUser = {
        id: 1,
        verificationToken: 'expired_token',
        tokenExpires: new Date(Date.now() - 10000),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      await expect(AuthService.verifyEmail('expired_token')).rejects.toThrow('Invalid or expired verification token.');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token and send email if user exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await AuthService.requestPasswordReset('test@example.com');
      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should return true even if user does not exist (security)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const result = await AuthService.requestPasswordReset('ghost@example.com');
      expect(result).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockUser = { id: 1, resetTokenExpires: new Date(Date.now() + 10000) };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await AuthService.resetPassword('token', 'newpass');
      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw error for invalid or expired reset token', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(AuthService.resetPassword('invalid', 'newpass')).rejects.toThrow('Invalid or expired reset token.');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: 1, email: 'john@example.com', firstName: 'John' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const user = await AuthService.getUserByEmail('john@example.com');

      expect(user?.email).toBe('john@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: 'john@example.com' }
      }));
    });

    it('should return null if user not found by email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const user = await AuthService.getUserByEmail('ghost@example.com');
      expect(user).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, firstName: 'John' } as any);
      const user = await AuthService.getUserById(1);
      expect(user?.firstName).toBe('John');
    });

    it('should return null if user not found by id', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const user = await AuthService.getUserById(999);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({ id: 1, bio: 'Updated' } as any);
      const user = await AuthService.updateUser(1, { bio: 'Updated' });
      expect(user.bio).toBe('Updated');
    });

    it('should throw error if update fails', async () => {
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB Error'));
      await expect(AuthService.updateUser(1, { bio: 'Fail' })).rejects.toThrow('Failed to update profile.');
    });
  });
});
