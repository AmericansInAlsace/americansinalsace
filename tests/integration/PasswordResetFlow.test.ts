import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/AuthService';
import { prisma } from '@/lib/db';
import { MailService } from '@/services/MailService';
import argon2 from 'argon2';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}));

describe('Integration: Password Reset Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete the password reset flow', async () => {
    const email = 'test@example.com';
    const mockUser = { id: 1, email };

    // 1. Request Reset
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    const requestResult = await AuthService.requestPasswordReset(email);
    expect(requestResult).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ resetToken: expect.any(String) }),
    }));
    expect(MailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, expect.any(String));

    // 2. Reset Password
    const resetToken = 'token123';
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 1,
      resetToken,
      resetTokenExpires: new Date(Date.now() + 10000),
    } as any);

    const resetResult = await AuthService.resetPassword(resetToken, 'newpassword123');
    expect(resetResult).toBe(true);
    expect(argon2.hash).toHaveBeenCalledWith('newpassword123');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ password: 'new_hashed_password' }),
    }));
  });
});
