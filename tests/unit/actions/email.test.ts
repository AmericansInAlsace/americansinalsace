import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateEmailTemplate, getEmailLogs } from '@/app/actions/email';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/db', () => ({
  prisma: {
    emailTemplate: {
      update: vi.fn(),
    },
    emailLog: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('email actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateEmailTemplate', () => {
    it('should successfully update an email template if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'SUPERADMIN' },
      } as any);

      vi.mocked(prisma.emailTemplate.update).mockResolvedValue({ id: 1 } as any);

      const data = { name: 'Test', subject: 'Sub', content: 'Cont' };
      const result = await updateEmailTemplate(1, data);

      expect(prisma.emailTemplate.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data,
      });
      expect(revalidatePath).toHaveBeenCalledWith('/backoffice/communications/templates');
      expect(result).toEqual({ success: true });
    });

    it('should throw error if not authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'USER' },
      } as any);

      await expect(updateEmailTemplate(1, { name: '', subject: '', content: '' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getEmailLogs', () => {
    it('should successfully retrieve email logs if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'SUPERADMIN' },
      } as any);

      const mockLogs = [{ id: 1, subject: 'Test' }];
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue(mockLogs as any);

      const result = await getEmailLogs();

      expect(prisma.emailLog.findMany).toHaveBeenCalledWith({
        orderBy: { sentAt: 'desc' },
        take: 100,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should throw error if not authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'USER' },
      } as any);

      await expect(getEmailLogs()).rejects.toThrow('Unauthorized');
    });
  });
});
