import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getTransactionHistory, 
  getFinancialSummary, 
  recordManualPayment 
} from '@/services/FinancialService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { Prisma } from '@/lib/generated/prisma';

describe('Integration: Financial Service', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
    await IntegrationTestHelper.seedTestUser(1, 'user1@example.com');
  });

  describe('getTransactionHistory', () => {
    it('should fetch transactions with filters', async () => {
      await prisma.transaction.create({
        data: {
          userId: 1,
          amount: new Prisma.Decimal(50.0),
          type: 'SUBSCRIPTION_PAYMENT',
          status: 'SUCCESS',
          description: 'Payment 1',
          transactionDate: new Date('2026-01-01'),
        }
      });

      await prisma.transaction.create({
        data: {
          userId: 1,
          amount: new Prisma.Decimal(25.0),
          type: 'DONATION',
          status: 'PENDING',
          description: 'Payment 2',
          transactionDate: new Date('2026-02-01'),
        }
      });

      const all = await getTransactionHistory();
      expect(all).toHaveLength(2);

      const successOnly = await getTransactionHistory({ status: 'SUCCESS' });
      expect(successOnly).toHaveLength(1);
      expect(successOnly[0].description).toBe('Payment 1');

      const typeOnly = await getTransactionHistory({ type: 'DONATION' });
      expect(typeOnly).toHaveLength(1);

      const startDateOnly = await getTransactionHistory({ startDate: new Date('2026-01-15') });
      expect(startDateOnly).toHaveLength(1);

      const endDateOnly = await getTransactionHistory({ endDate: new Date('2026-01-15') });
      expect(endDateOnly).toHaveLength(1);

      const dateRange = await getTransactionHistory({ 
        startDate: new Date('2026-01-15'), 
        endDate: new Date('2026-02-15') 
      });
      expect(dateRange).toHaveLength(1);
      expect(dateRange[0].description).toBe('Payment 2');

      const searchPaypal = await getTransactionHistory({ search: 'PP-123' });
      // We didn't seed one with paypalTransactionId, so let's update one
      await prisma.transaction.update({
        where: { id: all[0].id },
        data: { paypalTransactionId: 'PP-123' }
      });
      const found = await getTransactionHistory({ search: 'PP-123' });
      expect(found).toHaveLength(1);
    });

    it('should handle pagination', async () => {
       for (let i = 1; i <= 15; i++) {
        await prisma.transaction.create({
          data: {
            userId: 1,
            amount: new Prisma.Decimal(i),
            type: 'TYPE',
            status: 'SUCCESS',
            transactionDate: new Date(),
          }
        });
       }

       const page1 = await getTransactionHistory({}, 1, 10);
       expect(page1).toHaveLength(10);

       const page2 = await getTransactionHistory({}, 2, 10);
       expect(page2).toHaveLength(5);
    });

    it('should log and throw error on failure', async () => {
       // Force a DB error by using an invalid filter
       await expect(getTransactionHistory({ userId: 'invalid' as any }))
         .rejects
         .toThrow();
    });
  });

  describe('getFinancialSummary', () => {
    it('should calculate summary correctly', async () => {
      await prisma.transaction.createMany({
        data: [
          { userId: 1, amount: new Prisma.Decimal(100), type: 'A', status: 'SUCCESS', transactionDate: new Date() },
          { userId: 1, amount: new Prisma.Decimal(50), type: 'B', status: 'SUCCESS', transactionDate: new Date() },
        ]
      });

      const summary = await getFinancialSummary();
      expect(summary.totalRevenue.toNumber()).toBe(150);
      expect(summary.numberOfTransactions).toBe(2);

      const filtered = await getFinancialSummary({ type: 'A' });
      expect(filtered.totalRevenue.toNumber()).toBe(100);

      const aMinuteAgo = new Date(Date.now() - 60000);
      const dateFiltered = await getFinancialSummary({ startDate: aMinuteAgo });
      expect(dateFiltered.numberOfTransactions).toBe(2);
    });

    it('should handle empty summary', async () => {
      const summary = await getFinancialSummary();
      expect(summary.totalRevenue.toNumber()).toBe(0);
      expect(summary.numberOfTransactions).toBe(0);
    });

    it('should throw on error', async () => {
      await expect(getFinancialSummary({ userId: 'invalid' as any }))
        .rejects
        .toThrow();
    });
  });

  describe('recordManualPayment', () => {
    it('should record a manual payment', async () => {
      const data = {
        userId: 1,
        amount: new Prisma.Decimal(75.5),
        currency: 'USD',
        type: 'MANUAL',
        status: 'SUCCESS',
        description: 'Manual entry',
        transactionDate: new Date(),
      };

      const result = await recordManualPayment(data);
      expect(result.id).toBeDefined();
      expect(result.amount.toNumber()).toBe(75.5);
      expect(result.currency).toBe('USD');

      const tx = await prisma.transaction.findUnique({ where: { id: result.id } });
      expect(tx?.description).toBe('Manual entry');
    });

    it('should use default currency if not provided', async () => {
        const data = {
          userId: 1,
          amount: new Prisma.Decimal(10),
          type: 'MANUAL',
          status: 'SUCCESS',
        };
        const result = await recordManualPayment(data as any);
        expect(result.currency).toBe('EUR');
    });

    it('should throw error if required fields are missing', async () => {
      await expect(recordManualPayment({ userId: 1 } as any))
        .rejects
        .toThrow('Missing required fields');
    });

    it('should throw on DB error', async () => {
       // userId that doesn't exist (Prisma might fail if FK constraint, but userId 999 doesn't exist in our seeded users)
       // Let's use an invalid amount or something
       await expect(recordManualPayment({ userId: 1, amount: 'invalid' as any, type: 'A', status: 'S' } as any))
         .rejects
         .toThrow();
    });
  });
});
