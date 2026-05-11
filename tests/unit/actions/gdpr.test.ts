import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as gdprActions from '@/app/actions/gdpr';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { MailService } from '@/services/MailService';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    sponsorProfile: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => cb(prisma)),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/services/MailService', () => ({
  MailService: {
    sendDataExportEmail: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('gdpr actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('should allow user to export their own data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1', role: 'USER' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      
      const result = await gdprActions.exportUserData(1);
      
      expect(result.success).toBe(true);
      expect(MailService.sendDataExportEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });

    it('should allow ADMIN to export other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'ADMIN' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      
      const result = await gdprActions.exportUserData(1);
      
      expect(result.success).toBe(true);
      expect(MailService.sendDataExportEmail).toHaveBeenCalled();
    });

    it('should allow SUPERADMIN to export other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      
      const result = await gdprActions.exportUserData(1);
      expect(result.success).toBe(true);
    });

    it('should throw if unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(gdprActions.exportUserData(1)).rejects.toThrow('Unauthorized');
    });

    it('should throw if USER tries to export other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'USER' } } as any);
      await expect(gdprActions.exportUserData(1)).rejects.toThrow('Unauthorized: You can only export your own data.');
    });

    it('should throw if user not found', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1', role: 'USER' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(gdprActions.exportUserData(1)).rejects.toThrow('User not found');
    });

    it('should throw if sending email fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1', role: 'USER' } } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'test@example.com' } as any);
      vi.mocked(MailService.sendDataExportEmail).mockRejectedValue(new Error('SMTP Error'));
      
      await expect(gdprActions.exportUserData(1)).rejects.toThrow('Failed to send export email');
    });
  });

  describe('anonymizeUserData', () => {
    it('should allow user to anonymize their own data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1', role: 'USER' } } as any);
      
      const result = await gdprActions.anonymizeUserData(1);
      
      expect(result.success).toBe(true);
      expect(prisma.sponsorProfile.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ firstName: 'Anonymized', lastName: 'User' })
      }));
      expect(revalidatePath).toHaveBeenCalled();
    });

    it('should allow ADMIN to anonymize other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'ADMIN' } } as any);
      const result = await gdprActions.anonymizeUserData(1);
      expect(result.success).toBe(true);
    });

    it('should allow SUPERADMIN to anonymize other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'SUPERADMIN' } } as any);
      const result = await gdprActions.anonymizeUserData(1);
      expect(result.success).toBe(true);
    });

    it('should throw if unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(gdprActions.anonymizeUserData(1)).rejects.toThrow('Unauthorized');
    });

    it('should throw if USER tries to anonymize other users data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '2', role: 'USER' } } as any);
      await expect(gdprActions.anonymizeUserData(1)).rejects.toThrow('Unauthorized: You can only anonymize your own data.');
    });

    it('should throw if anonymization fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: '1', role: 'USER' } } as any);
      vi.mocked(prisma.$transaction).mockRejectedValue(new Error('DB Error'));
      
      await expect(gdprActions.anonymizeUserData(1)).rejects.toThrow('Failed to anonymize user data');
    });
  });
});
