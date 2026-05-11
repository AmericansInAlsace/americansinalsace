import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as systemActions from '@/app/actions/system';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

vi.mock('@/lib/db', () => ({
  prisma: {
    systemLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('system actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemLogs', () => {
    it('should return logs if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.systemLog.findMany).mockResolvedValue([{ id: 1, message: 'Test' } as any]);
      vi.mocked(prisma.systemLog.count).mockResolvedValue(1);

      const result = await systemActions.getSystemLogs({ page: 1, pageSize: 10, level: 'ERROR', origin: 'WEB', search: 'Test' });
      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.systemLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          level: 'ERROR',
          origin: 'WEB',
          OR: expect.any(Array)
        })
      }));
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(systemActions.getSystemLogs({})).rejects.toThrow('Unauthorized');
    });
  });

  describe('getLogStats', () => {
    it('should return stats if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      
      const now = new Date();
      vi.mocked(prisma.systemLog.findMany).mockResolvedValue([
        { level: 'ERROR', timestamp: now } as any,
        { level: 'WARN', timestamp: now } as any,
      ]);

      const result = await systemActions.getLogStats();
      expect(result).toHaveLength(14);
      // The last day should have 1 error and 1 warn
      const todayStats = result[13];
      expect(todayStats.errors).toBe(1);
      expect(todayStats.warnings).toBe(1);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(systemActions.getLogStats()).rejects.toThrow('Unauthorized');
    });
  });
});
