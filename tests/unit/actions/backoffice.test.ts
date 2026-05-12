import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as backofficeActions from '@/app/actions/backoffice';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import * as financialService from '@/services/FinancialService';
import { Prisma } from '@/lib/generated/prisma';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { update: vi.fn() },
    subscription: { update: vi.fn() },
    event: { create: vi.fn(), update: vi.fn() },
    transaction: { findMany: vi.fn() },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/services/FinancialService', () => ({
  getFinancialSummary: vi.fn(),
  recordManualPayment: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('backoffice actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return stats if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(financialService.getFinancialSummary).mockResolvedValue({
        totalRevenue: new Prisma.Decimal(100),
        totalExpenses: new Prisma.Decimal(20),
        netProfit: new Prisma.Decimal(80),
        numberOfTransactions: 5,
      });

      const stats = await backofficeActions.getDashboardStats();
      expect(stats.totalRevenue).toBe(100);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.getDashboardStats()).rejects.toThrow('Unauthorized');
    });

    it('should throw if fetching fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(financialService.getFinancialSummary).mockRejectedValue(new Error('DB Error'));
      await expect(backofficeActions.getDashboardStats()).rejects.toThrow('Failed to fetch dashboard statistics.');
    });
  });

  describe('recordManualPaymentAction', () => {
    it('should record payment if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(financialService.recordManualPayment).mockResolvedValue({ amount: new Prisma.Decimal(50) } as any);

      const result = await backofficeActions.recordManualPaymentAction({ userId: 1, amount: 50, type: 'M', status: 'S' } as any);
      expect(result.success).toBe(true);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.recordManualPaymentAction({ userId: 1 } as any)).rejects.toThrow('Unauthorized');
    });

    it('should throw if userId is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      await expect(backofficeActions.recordManualPaymentAction({ amount: 50 } as any)).rejects.toThrow('User ID is required');
    });

    it('should throw if recording fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(financialService.recordManualPayment).mockRejectedValue(new Error('DB error'));
      await expect(backofficeActions.recordManualPaymentAction({ userId: 1, amount: 50 } as any)).rejects.toThrow('Failed to record manual payment.');
    });
  });

  describe('getAllTransactions', () => {
    it('should return transactions if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([
        { id: 1, amount: new Prisma.Decimal(100) } as any
      ]);

      const txs = await backofficeActions.getAllTransactions();
      expect(txs).toHaveLength(1);
      expect(txs[0].amount).toBe(100);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.getAllTransactions()).rejects.toThrow('Unauthorized');
    });

    it('should throw if fetching fails', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.transaction.findMany).mockRejectedValue(new Error('DB error'));
      await expect(backofficeActions.getAllTransactions()).rejects.toThrow('Failed to fetch transactions.');
    });
  });

  describe('updateUserRole', () => {
    it('should update role if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      await backofficeActions.updateUserRole(1, 2);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.updateUserRole(1, 2)).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSubscriptionStatus', () => {
    it('should update status if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      await backofficeActions.updateSubscriptionStatus(1, 'ACTIVE');
      expect(prisma.subscription.update).toHaveBeenCalled();
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.updateSubscriptionStatus(1, 'ACTIVE')).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSubscriptionTier', () => {
    it('should update tier if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      await backofficeActions.updateSubscriptionTier(1, 10);
      expect(prisma.subscription.update).toHaveBeenCalled();
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.updateSubscriptionTier(1, 10)).rejects.toThrow('Unauthorized');
    });
  });

  describe('createEvent', () => {
    it('should create event if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.event.create).mockResolvedValue({ id: 1 } as any);
      const result = await backofficeActions.createEvent({ title: 'T', date: '2026-05-11' });
      expect(result.success).toBe(true);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.createEvent({})).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateEvent', () => {
    it('should update event if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.event.update).mockResolvedValue({ id: 1 } as any);
      const result = await backofficeActions.updateEvent(1, { title: 'U', date: '2026-05-11' });
      expect(result.success).toBe(true);
    });

    it('should throw if not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(backofficeActions.updateEvent(1, {})).rejects.toThrow('Unauthorized');
    });
  });
});
