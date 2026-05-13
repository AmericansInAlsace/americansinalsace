import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRequestReset, handleResetPassword } from '@/app/actions/reset-password';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { MailService } from '@/services/MailService';

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Integration: Reset Password Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('handleRequestReset', () => {
    it('should return error if email is missing', async () => {
      const fd = new FormData();
      const res = await handleRequestReset(fd);
      expect(res.error).toBe('Email is required');
    });

    it('should return success even if user not found for security', async () => {
      const fd = new FormData();
      fd.append('email', 'notfound@example.com');
      const res = await handleRequestReset(fd);
      expect(res.success).toBe(true);
    });

    it('should request reset successfully', async () => {
      await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      const fd = new FormData();
      fd.append('email', 'test@example.com');
      const res = await handleRequestReset(fd);
      expect(res.success).toBe(true);
      expect(MailService.sendPasswordResetEmail).toHaveBeenCalled();
      
      const user = await prisma.user.findUnique({ where: { id: 1 } });
      expect(user?.resetToken).toBeDefined();
    });

    it('should handle db error gracefully', async () => {
      await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      vi.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB Error'));
      const fd = new FormData();
      fd.append('email', 'test@example.com');
      const res = await handleRequestReset(fd);
      expect(res.error).toBe('Something went wrong. Please try again later.');
    });
  });

  describe('handleResetPassword', () => {
    it('should return error if token missing', async () => {
      const fd = new FormData();
      fd.append('password', '123');
      const res = await handleResetPassword(fd);
      expect(res.error).toBe('Token and password are required');
    });

    it('should return error if passwords mismatch', async () => {
      const fd = new FormData();
      fd.append('token', 'abc');
      fd.append('password', '123');
      fd.append('confirmPassword', '456');
      const res = await handleResetPassword(fd);
      expect(res.error).toBe('Passwords do not match');
    });

    it('should handle reset gracefully when token is invalid', async () => {
      const fd = new FormData();
      fd.append('token', 'invalid');
      fd.append('password', '123');
      fd.append('confirmPassword', '123');
      const res = await handleResetPassword(fd);
      expect(res.error).toBe('Invalid or expired reset token.');
    });

    it('should reset password successfully', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      const token = 'validtoken';
      await prisma.user.update({
        where: { id: 1 },
        data: { resetToken: token, resetTokenExpires: new Date(Date.now() + 10000) }
      });

      const fd = new FormData();
      fd.append('token', token);
      fd.append('password', 'newpass123');
      fd.append('confirmPassword', 'newpass123');
      const res = await handleResetPassword(fd);
      expect(res.success).toBe(true);
      
      const updatedUser = await prisma.user.findUnique({ where: { id: 1 } });
      expect(updatedUser?.resetToken).toBeNull();
    });
  });
});