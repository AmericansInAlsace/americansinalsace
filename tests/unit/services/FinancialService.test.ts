// tests/unit/services/FinancialService.test.ts

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// Removed Prisma.Decimal import
import { getTransactionHistory, getFinancialSummary, recordManualPayment } from '@/services/FinancialService';
import { PrismaClient, Prisma } from '@/lib/generated/prisma/client';

// Mock PrismaClient
vi.mock('@/lib/generated/prisma/client', async () => {
  const actual = await vi.importActual<any>('@/lib/generated/prisma/client');
  const mockPrismaClient = {
    transaction: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    membershipTier: {
      findUnique: vi.fn(),
    },
    // Add other mocks if needed for other services
  };
  return {
    ...actual,
    PrismaClient: vi.fn().mockImplementation(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient() as any; // Cast to 'any' to satisfy the mock

describe('FinancialService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactionHistory', () => {
    it('should fetch transactions with default pagination', async () => {
      const mockTransactions = [
        { id: 1, userId: 1, amount: new Prisma.Decimal(50), currency: 'USD', type: 'SUBSCRIPTION_PAYMENT', status: 'SUCCESS', transactionDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { id: 2, userId: 2, amount: new Prisma.Decimal(25), currency: 'USD', type: 'EVENT_TICKET', status: 'SUCCESS', transactionDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
      ];
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const transactions = await getTransactionHistory();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { transactionDate: 'desc' },
        skip: 0,
        take: 10,
        include: { user: true },
      });
      expect(transactions).toEqual(mockTransactions);
    });

    it('should fetch transactions with filters', async () => {
      const mockTransactions = [
        { id: 1, userId: 1, amount: new Prisma.Decimal(50), currency: 'USD', type: 'SUBSCRIPTION_PAYMENT', status: 'SUCCESS', transactionDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
      ];
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const filter = { userId: 1, type: 'SUBSCRIPTION_PAYMENT', startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') };
      const transactions = await getTransactionHistory(filter, 1, 5);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: 'SUBSCRIPTION_PAYMENT',
          status: undefined, // Not filtered
          transactionDate: { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') },
          search: undefined,
        },
        orderBy: { transactionDate: 'desc' },
        skip: 0,
        take: 5,
        include: { user: true },
      });
      expect(transactions).toEqual(mockTransactions);
    });

    it('should handle errors during fetch', async () => {
      const mockError = new Error('Database error');
      prisma.transaction.findMany.mockRejectedValue(mockError);

      await expect(getTransactionHistory()).rejects.toThrow('Database error');
    });
  });

  describe('getFinancialSummary', () => {
    it('should calculate financial summary with default filters', async () => {
      const mockAggregation = { _sum: { amount: new Prisma.Decimal(1000) }, _count: { id: 50 } };
      prisma.transaction.aggregate.mockResolvedValue(mockAggregation);

      const summary = await getFinancialSummary();

      expect(prisma.transaction.aggregate).toHaveBeenCalledWith({
        _sum: { amount: true },
        _count: { id: true },
        where: {},
      });
      expect(summary.totalRevenue).toEqual(new Prisma.Decimal(1000));
      expect(summary.totalExpenses).toEqual(new Prisma.Decimal(0)); // Placeholder
      expect(summary.netProfit).toEqual(new Prisma.Decimal(1000)); // Placeholder
      expect(summary.numberOfTransactions).toBe(50);
    });

    it('should calculate financial summary with filters', async () => {
      const mockAggregation = { _sum: { amount: new Prisma.Decimal(750) }, _count: { id: 30 } };
      prisma.transaction.aggregate.mockResolvedValue(mockAggregation);

      const filter = { userId: 1, status: 'SUCCESS', startDate: new Date('2024-01-01') };
      const summary = await getFinancialSummary(filter);

      expect(prisma.transaction.aggregate).toHaveBeenCalledWith({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          userId: 1,
          status: 'SUCCESS',
          transactionDate: { gte: new Date('2024-01-01') },
        },
      });
      expect(summary.totalRevenue).toEqual(new Prisma.Decimal(750));
    });

    it('should handle errors during aggregation', async () => {
      const mockError = new Error('Aggregation error');
      prisma.transaction.aggregate.mockRejectedValue(mockError);

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
      description: 'Manual payment for services',
      transactionDate: new Date('2024-05-09'),
    };

    it('should record a manual payment successfully', async () => {
      const mockCreatedTransaction = {
        ...transactionData,
        id: 101,
        createdAt: new Date(),
        updatedAt: new Date(),
        paypalTransactionId: null,
      };
      prisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

      const newTransaction = await recordManualPayment(transactionData);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          amount: new Prisma.Decimal('150.75'),
          currency: 'USD',
          type: 'MANUAL_PAYMENT',
          status: 'SUCCESS',
          description: 'Manual payment for services',
          transactionDate: new Date('2024-05-09'),
        },
      });
      expect(newTransaction).toEqual(mockCreatedTransaction);
    });

    it('should throw an error if required fields are missing', async () => {
      const incompleteData = { userId: 1, amount: new Prisma.Decimal('150.75') }; // Missing type, status
      await expect(recordManualPayment(incompleteData as any)).rejects.toThrow('Missing required fields for manual payment.');
    });

    it('should throw an error if amount is invalid', async () => {
      const invalidAmountData = { ...transactionData, amount: new Prisma.Decimal('0') };
      await expect(recordManualPayment(invalidAmountData as any)).rejects.toThrow('Missing required fields for manual payment.'); // Validation is on amount > 0
    });

    it('should handle errors during creation', async () => {
      const mockError = new Error('Database creation error');
      prisma.transaction.create.mockRejectedValue(mockError);

      await expect(recordManualPayment(transactionData)).rejects.toThrow('Database creation error');
    });
  });
});
