import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportUserData, anonymizeUserData } from '@/app/actions/gdpr';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { MailService } from '@/services/MailService';
import { revalidatePath } from 'next/cache';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/services/MailService', () => ({
  MailService: {
    sendDataExportEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Integration: GDPR Flow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should allow a user to export their own data', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1 } } as any);

    const result = await exportUserData(1);
    expect(result.success).toBe(true);
    expect(MailService.sendDataExportEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });

  it('should prevent a normal user from exporting another user\'s data', async () => {
    await IntegrationTestHelper.seedTestUser(10, 'other@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 2 } } as any);

    await expect(exportUserData(10)).rejects.toThrow('Unauthorized');
  });

  it('should allow an admin to anonymize a user', async () => {
    await IntegrationTestHelper.seedTestUser(10, 'tobeforgotten@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);

    const result = await anonymizeUserData(10);
    expect(result.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: 10 } });
    expect(user?.firstName).toBe('Anonymized');
    expect(user?.email).not.toBe('tobeforgotten@example.com');
  });

  it('should allow a user to anonymize their own data', async () => {
    await IntegrationTestHelper.seedTestUser(10, 'me@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 10, role: 'USER' } } as any);

    const result = await anonymizeUserData(10);
    expect(result.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: 10 } });
    expect(user?.firstName).toBe('Anonymized');
  });

  it('should prevent a normal user from anonymizing another user', async () => {
    await IntegrationTestHelper.seedTestUser(10, 'other@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 2 } } as any);

    await expect(anonymizeUserData(10)).rejects.toThrow('Unauthorized');
  });

  it('should throw error if session is missing for export', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(exportUserData(1)).rejects.toThrow('Unauthorized');
  });

  it('should throw error if session is missing for anonymize', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(anonymizeUserData(1)).rejects.toThrow('Unauthorized');
  });

  it('should throw error if user not found during export', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
    await expect(exportUserData(9999)).rejects.toThrow('User not found');
  });

  it('should handle mail error during export', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1 } } as any);
    vi.mocked(MailService.sendDataExportEmail).mockRejectedValueOnce(new Error('Mail Error'));

    await expect(exportUserData(1)).rejects.toThrow('Failed to send export email');
  });

  it('should handle db error during anonymize', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1 } } as any);
    vi.spyOn(prisma, '$transaction').mockRejectedValueOnce(new Error('DB Error'));

    await expect(anonymizeUserData(1)).rejects.toThrow('Failed to anonymize user data');
  });
});
