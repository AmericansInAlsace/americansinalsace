// tests/unit/services/FinancialService.test.ts

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getTransactionHistory, getFinancialSummary, recordManualPayment } from '@/services/FinancialService';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';

// Mock the db module
vi.mock('@/lib/db', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('FinancialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactionHistory', () => {
    it('should fetch transactions with default pagination', async () => {
      const mockTransactions = [
        { id: 1, userId: 1, amount: new Prisma.Decimal(50), currency: 'USD', type: 'SUBSCRIPTION_PAYMENT', status: 'SUCCESS' },
        { id: 2, userId: 2, amount: new Prisma.Decimal(25), currency: 'USD', type: 'EVENT_TICKET', status: 'SUCCESS' },
      ];
      vi.mocked(prisma.transaction.findMany).mockResolvedValue(mockTransactions as any);

      const transactions = await getTransactionHistory();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
      }));
      expect(transactions).toEqual(mockTransactions);
    });

    it('should fetch transactions with filters', async () => {
      vi.mocked(prisma.transaction.findMany).mockResolvedValue([] as any);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      await getTransactionHistory({ userId: 1, type: 'SUBSCRIPTION_PAYMENT', startDate, endDate }, 1, 5);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: 1,
          type: 'SUBSCRIPTION_PAYMENT',
          transactionDate: { gte: startDate, lte: endDate },
        }),
        take: 5,
      }));
    });

    it('should handle errors during fetch', async () => {
      vi.mocked(prisma.transaction.findMany).mockRejectedValue(new Error('Database error'));
      await expect(getTransactionHistory()).rejects.toThrow('Database error');
    });
  });

  describe('getFinancialSummary', () => {
    it('should calculate financial summary with default filters', async () => {
      const mockAggregation = { 
        _sum: { amount: new Prisma.Decimal(1000) }, 
        _count: { id: 50 } 
      };
      vi.mocked(prisma.transaction.aggregate).mockResolvedValue(mockAggregation as any);

      const summary = await getFinancialSummary();

      expect(prisma.transaction.aggregate).toHaveBeenCalled();
      expect(summary.totalRevenue.toString()).toBe('1000');
      expect(summary.numberOfTransactions).toBe(50);
    });

    it('should calculate financial summary with all filters', async () => {
      vi.mocked(prisma.transaction.aggregate).mockResolvedValue({ 
        _sum: { amount: new Prisma.Decimal(100) }, 
        _count: { id: 5 } 
      } as any);

      await getFinancialSummary({ userId: 1, type: 'PAYMENT', status: 'SUCCESS', startDate: new Date(), endDate: new Date() });

      expect(prisma.transaction.aggregate).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: 1,
          type: 'PAYMENT',
          status: 'SUCCESS',
        })
      }));
    });

    it('should handle missing sum during aggregation', async () => {
      vi.mocked(prisma.transaction.aggregate).mockResolvedValue({ _sum: { amount: null }, _count: { id: 0 } } as any);
      const summary = await getFinancialSummary();
      expect(summary.totalRevenue.toString()).toBe('0');
    });

    it('should handle errors during aggregation', async () => {
      vi.mocked(prisma.transaction.aggregate).mockRejectedValue(new Error('Aggregation error'));
      await expect(getFinancialSummary()).rejects.toThrow('Aggregation error');
    });
  });

  describe('recordManualPayment', () => {
    const transactionData = {
      userId: 1,
      amount: new Prisma.Decimal('150.75'),
      currency: 'USD',
      type: 'MANUAL_PAYMENT',
      status: 'SUCCESS',
      description: 'Manual payment',
      transactionDate: new Date('2024-05-09'),
    };

    it('should record a manual payment successfully', async () => {
      vi.mocked(prisma.transaction.create).mockResolvedValue({ ...transactionData, id: 101 } as any);

      const result = await recordManualPayment(transactionData);

      expect(prisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          amount: expect.any(Prisma.Decimal),
        }),
      }));
      expect(result.id).toBe(101);
    });

    it('should throw an error if required fields are missing', async () => {
      const incompleteData = { userId: 1, amount: new Prisma.Decimal('150.75') };
      await expect(recordManualPayment(incompleteData as any)).rejects.toThrow('Missing required fields for manual payment.');
    });

    it('should handle errors during creation', async () => {
      vi.mocked(prisma.transaction.create).mockRejectedValue(new Error('Creation error'));
      await expect(recordManualPayment(transactionData)).rejects.toThrow('Creation error');
    });
  });
});
