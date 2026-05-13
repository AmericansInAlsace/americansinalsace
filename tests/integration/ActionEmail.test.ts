import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateEmailTemplate, getEmailLogs } from '@/app/actions/email';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { Prisma } from '@/lib/generated/prisma';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Integration: Email Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('Authorization Errors', () => {
    it('should throw Unauthorized if not SUPERADMIN for updateEmailTemplate', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateEmailTemplate(1, { name: 'n', subject: 's', content: 'c' })).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for getEmailLogs', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getEmailLogs()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Success Paths', () => {
    it('should update email template', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const template = await prisma.emailTemplate.create({
        data: { slug: 'test-slug', name: 'Test', subject: 'Old', content: 'Old content' }
      });

      const res = await updateEmailTemplate(template.id, { name: 'Test 2', subject: 'New', content: 'New content' });
      expect(res.success).toBe(true);

      const updated = await prisma.emailTemplate.findUnique({ where: { id: template.id } });
      expect(updated?.subject).toBe('New');
    });

    it('should get email logs', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await prisma.emailLog.create({
        data: { recipient: 'test@example.com', subject: 'Subject', status: 'SUCCESS' }
      });

      const logs = await getEmailLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].recipient).toBe('test@example.com');
    });
  });
});