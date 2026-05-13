import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from '@/services/AuthService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

// Mock MailService to avoid actual email sending during AuthService tests
vi.mock('@/services/MailService', () => ({
  MailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService Integration', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = await AuthService.registerUser(data);

      expect(user).toBeDefined();
      expect(user.email).toBe(data.email);
      expect(user.firstName).toBe(data.firstName);
      expect(user.lastName).toBe(data.lastName);

      const dbUser = await prisma.user.findUnique({ where: { email: data.email } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.verificationToken).toBeDefined();
    });

    it('should throw error if required fields are missing', async () => {
      const data = {
        firstName: 'John',
        email: 'john@example.com',
      };

      await expect(AuthService.registerUser(data)).rejects.toThrow('Missing required fields');
    });

    it('should throw error if user already exists', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await AuthService.registerUser(data);
      await expect(AuthService.registerUser(data)).rejects.toThrow('User already exists');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await AuthService.registerUser(data);
      const dbUser = await prisma.user.findUnique({ where: { email: data.email } });
      const token = dbUser!.verificationToken!;

      const result = await AuthService.verifyEmail(token);
      expect(result).toBe(true);

      const updatedUser = await prisma.user.findUnique({ where: { email: data.email } });
      expect(updatedUser?.emailVerified).toBeDefined();
      expect(updatedUser?.verificationToken).toBeNull();
    });

    it('should throw error for invalid token', async () => {
      await expect(AuthService.verifyEmail('invalid-token')).rejects.toThrow('Invalid or expired verification token.');
    });

    it('should throw error for expired token', async () => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        };
  
        await AuthService.registerUser(data);
        const dbUser = await prisma.user.findUnique({ where: { email: data.email } });
        const token = dbUser!.verificationToken!;

        // Manually expire token
        await prisma.user.update({
            where: { id: dbUser!.id },
            data: { tokenExpires: new Date(Date.now() - 3600000) }
        });

        await expect(AuthService.verifyEmail(token)).rejects.toThrow('Invalid or expired verification token.');
      });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      await AuthService.registerUser(data);

      const result = await AuthService.requestPasswordReset(data.email);
      expect(result).toBe(true);

      const updatedUser = await prisma.user.findUnique({ where: { email: data.email } });
      expect(updatedUser?.resetToken).toBeDefined();
      expect(updatedUser?.resetTokenExpires).toBeDefined();
    });

    it('should return true even if user does not exist (security)', async () => {
      const result = await AuthService.requestPasswordReset('nonexistent@example.com');
      expect(result).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const email = 'john@example.com';
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email,
        password: 'password123',
      };
      await AuthService.registerUser(data);
      await AuthService.requestPasswordReset(email);
      
      const dbUser = await prisma.user.findUnique({ where: { email } });
      const token = dbUser!.resetToken!;

      const result = await AuthService.resetPassword(token, 'newpassword123');
      expect(result).toBe(true);

      const updatedUser = await prisma.user.findUnique({ where: { email } });
      expect(updatedUser?.resetToken).toBeNull();
      // We could verify credentials but that's tested elsewhere
    });

    it('should throw error for invalid reset token', async () => {
      await expect(AuthService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow('Invalid or expired reset token.');
    });
  });

  describe('verifyCredentials', () => {
    it('should verify correct credentials for verified user', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      await AuthService.registerUser(data);
      const dbUser = await prisma.user.findUnique({ where: { email: data.email } });
      await AuthService.verifyEmail(dbUser!.verificationToken!);

      const user = await AuthService.verifyCredentials(data.email, data.password);
      expect(user).toBeDefined();
      expect(user?.email).toBe(data.email);
    });

    it('should return null for incorrect password', async () => {
        const data = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          };
          await AuthService.registerUser(data);
          const dbUser = await prisma.user.findUnique({ where: { email: data.email } });
          await AuthService.verifyEmail(dbUser!.verificationToken!);

          const user = await AuthService.verifyCredentials(data.email, 'wrongpassword');
          expect(user).toBeNull();
    });

    it('should throw error if email is not verified', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      await AuthService.registerUser(data);

      await expect(AuthService.verifyCredentials(data.email, data.password)).rejects.toThrow('Please verify your email address before logging in.');
    });

    it('should return null if user does not exist', async () => {
      const user = await AuthService.verifyCredentials('nonexistent@example.com', 'password123');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
        const data = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          };
          await AuthService.registerUser(data);
          
          const user = await AuthService.getUserByEmail(data.email);
          expect(user).toBeDefined();
          expect(user?.email).toBe(data.email);
    });

    it('should return null if user not found', async () => {
        const user = await AuthService.getUserByEmail('nonexistent@example.com');
        expect(user).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
        const data = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          };
          const createdUser = await AuthService.registerUser(data);
          
          const user = await AuthService.getUserById(createdUser.id);
          expect(user).toBeDefined();
          expect(user?.id).toBe(createdUser.id);
    });

    it('should return null if user not found', async () => {
        const user = await AuthService.getUserById(9999);
        expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
        const data = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          };
          const createdUser = await AuthService.registerUser(data);
          
          const updated = await AuthService.updateUser(createdUser.id, { firstName: 'Johnny', bio: 'New Bio' });
          expect(updated.firstName).toBe('Johnny');
          expect(updated.bio).toBe('New Bio');

          const dbUser = await prisma.user.findUnique({ where: { id: createdUser.id } });
          expect(dbUser?.firstName).toBe('Johnny');
          expect(dbUser?.bio).toBe('New Bio');
    });

    it('should throw error if update fails', async () => {
        await expect(AuthService.updateUser(9999, { firstName: 'Johnny' })).rejects.toThrow('Failed to update profile.');
    });
  });
});
