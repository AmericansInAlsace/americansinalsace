// services/FinancialService.ts

import { Prisma } from '@/lib/generated/prisma'; // Import Prisma for Decimal type
import { prisma } from '@/lib/db';

export interface Transaction {
  id: number;
  userId: number;
  amount: Prisma.Decimal; // Use Prisma.Decimal for monetary values
  currency: string;
  type: string; // e.g., "SUBSCRIPTION_PAYMENT", "MANUAL_PAYMENT", "REFUND"
  status: string; // e.g., "PENDING", "SUCCESS", "FAILED"
  paypalTransactionId: string | null;
  description: string | null;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilter {
  userId?: number;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string; // For searching description or transaction ID
}

export interface FinancialSummary {
  totalRevenue: Prisma.Decimal; // Use Prisma.Decimal for monetary values
  totalExpenses: Prisma.Decimal; // Use Prisma.Decimal for monetary values
  netProfit: Prisma.Decimal; // Use Prisma.Decimal for monetary values
  numberOfTransactions: number;
  // Add other relevant summary metrics as needed
}

/**
 * Fetches transaction history with optional filtering and pagination.
 * @param filter - Optional filter criteria.
 * @param page - Page number for pagination.
 * @param limit - Number of transactions per page.
 * @returns A promise that resolves to an array of transactions.
 */
export async function getTransactionHistory(
  filter: TransactionFilter = {},
  page: number = 1,
  limit: number = 10
): Promise<Transaction[]> {
  const { userId, type, status, startDate, endDate, search } = filter;

  const skip = (page - 1) * limit;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        ...(userId && { userId: userId }),
        ...(type && { type: type }),
        ...(status && { status: status }),
        ...((startDate || endDate) && {
          transactionDate: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { paypalTransactionId: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: {
        transactionDate: 'desc',
      },
      skip: skip,
      take: limit,
      include: {
        user: true, // Include user details if needed for display
      }
    });

    // Prisma returns Decimal types, ensure they are handled correctly.
    // For this example, assuming PrismaClient v5+ handles Decimal correctly.

    return transactions as Transaction[]; // Cast to our Transaction interface
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    // Rethrow or return a specific error response
    throw error;
  }
}

/**
 * Calculates financial summary metrics.
 * @param filter - Optional filter criteria.
 * @returns A promise that resolves to the financial summary.
 */
export async function getFinancialSummary(filter: TransactionFilter = {}): Promise<FinancialSummary> {
  const { userId, type, status, startDate, endDate } = filter;

  try {
    // Calculate total revenue and expenses
    // Assuming 'amount' is positive for revenue and negative for expenses, or using 'type'
    // For simplicity, let's assume 'type' determines income/expense, or amount is signed.
    // If amount is always positive, we'd need a way to distinguish income vs expense.
    // Let's assume positive amounts are income, and we might need to add an 'isExpense' flag or similar.
    // For now, we'll sum all amounts, and if we need separate revenue/expense, we'll adjust.

    const aggregation = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        ...(userId && { userId: userId }),
        ...(type && { type: type }),
        ...(status && { status: status }),
        ...((startDate || endDate) && {
          transactionDate: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }),
      },
    });

    // Placeholder for more complex logic if needed (e.g., distinguishing revenue vs. expense)
    const totalRevenue = aggregation._sum.amount || new Prisma.Decimal(0); // Use Prisma.Decimal
    const totalExpenses = new Prisma.Decimal(0); // Placeholder, needs to be calculated based on transaction types or signs
    const netProfit = totalRevenue.minus(totalExpenses); // Use Prisma.Decimal methods

    return {
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      netProfit: netProfit,
      numberOfTransactions: aggregation._count.id,
    };
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw error;
  }
}

/**
 * Records a manual payment transaction.
 * @param transactionData - Data for the new transaction.
 * @returns The created transaction.
 */
export async function recordManualPayment(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'paypalTransactionId'>): Promise<Transaction> {
  const { userId, amount, type, status, description, transactionDate } = transactionData;

  // Basic validation
  if (!userId || !amount || !type || !status) {
    throw new Error('Missing required fields for manual payment.');
  }

  try {
    const roundedAmount = Math.round(parseFloat(amount.toString()) * 100) / 100;
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: userId,
        amount: new Prisma.Decimal(roundedAmount), // Ensure amount is a Prisma.Decimal
        currency: transactionData.currency || process.env.NEXT_PUBLIC_CURRENCY || 'EUR',
        type: type,
        status: status,
        description: description || null,
        transactionDate: transactionDate || new Date(),
        // paypalTransactionId is null for manual payments
      },
    });
    return newTransaction as Transaction;
  } catch (error) {
    console.error('Error recording manual payment:', error);
    throw error;
  }
}

// Add other methods as needed, e.g.,
// - getTransactionsByCategory
// - exportTransactionsToCsv (might be handled by an action/API route)
// - getRevenueTrend(startDate, endDate)
