import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystemLogs, getLogStats } from '@/app/actions/system';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';

vi.mock('next-auth');

describe('Integration: System Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('Authorization Errors', () => {
    it('should throw Unauthorized if not SUPERADMIN for getSystemLogs', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getSystemLogs({})).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for getLogStats', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getLogStats()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Success Paths', () => {
    it('should get system logs', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await prisma.systemLog.create({
        data: { level: 'INFO', message: 'Test message', origin: 'System' }
      });
      await prisma.systemLog.create({
        data: { level: 'ERROR', message: 'Another', origin: 'API' }
      });

      const res = await getSystemLogs({ page: 1, pageSize: 10, level: 'INFO', origin: 'System', search: 'Test' });
      expect(res.logs.length).toBe(1);
      expect(res.total).toBe(1);
      expect(res.logs[0].message).toBe('Test message');
      
      const res2 = await getSystemLogs({ level: 'ALL', origin: 'ALL' });
      expect(res2.logs.length).toBeGreaterThanOrEqual(2);
    });

    it('should get log stats', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await prisma.systemLog.create({
        data: { level: 'ERROR', message: 'Test message', origin: 'System' }
      });
      await prisma.systemLog.create({
        data: { level: 'WARN', message: 'Another', origin: 'API' }
      });

      const stats = await getLogStats();
      expect(stats.length).toBe(14);
      
      const today = new Date().toISOString().split('T')[0];
      const todayStat = stats.find(s => s.date === today);
      
      expect(todayStat).toBeDefined();
      if (todayStat) {
        expect(todayStat.errors).toBe(1);
        expect(todayStat.warnings).toBe(1);
      }
    });
  });
});