'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/lib/generated/prisma'; // Import Prisma.Decimal for monetary values
import { getFinancialSummary, recordManualPayment, Transaction } from '@/services/FinancialService'; // Import FinancialService functions

// Define interfaces for clarity if not already defined elsewhere and needed for action return types
interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  numberOfTransactions: number;
}

/**
 * Fetches financial summary data for the backoffice dashboard.
 * This action is restricted to users with the 'SUPERADMIN' role.
 *
 * @returns {Promise<DashboardStats>} A promise that resolves to the dashboard statistics.
 * @throws {Error} If the current session user is not a SUPERADMIN or if fetching fails.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized: Only SUPERADMIN can access dashboard stats.');
  }

  try {
    // For now, fetching global summary. Later, this might accept filters for specific periods.
    const summary = await getFinancialSummary({});
    return {
      totalRevenue: parseFloat(summary.totalRevenue.toString()),
      totalExpenses: parseFloat(summary.totalExpenses.toString()),
      netProfit: parseFloat(summary.netProfit.toString()),
      numberOfTransactions: summary.numberOfTransactions,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics.');
  }
}

/**
 * Records a manual payment transaction.
 * This action is restricted to users with the 'SUPERADMIN' role.
 *
 * @param {Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'paypalTransactionId'>} transactionData - Data for the new transaction.
 * @returns {Promise<{success: true, transaction: Transaction}>} A promise that resolves to the created transaction.
 * @throws {Error} If the current session user is not a SUPERADMIN or if recording fails.
 */
export async function recordManualPaymentAction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'paypalTransactionId'>): Promise<{ success: true; transaction: any }> {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized: Only SUPERADMIN can record manual payments.');
  }

  // Ensure userId is correctly passed and validated if needed
  if (!transactionData.userId) {
    throw new Error('User ID is required for manual payment.');
  }

  try {
    // The service function already handles Prisma.Decimal conversion and basic validation
    const newTransaction = await recordManualPayment(transactionData);
    revalidatePath('/backoffice/financials'); // Revalidate the financials page cache
    
    // Convert to serializable format
    const serializableTransaction = {
      ...newTransaction,
      amount: parseFloat(newTransaction.amount.toString()),
    };

    return { success: true, transaction: serializableTransaction };
  } catch (error) {
    console.error('Error recording manual payment:', error);
    throw new Error('Failed to record manual payment.');
  }
}

/**
 * Fetches all transactions for the backoffice financial dashboard.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of transactions with user details.
 */
export async function getAllTransactions() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized: Only SUPERADMIN can access all transactions.');
  }

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return transactions.map(tx => ({
      ...tx,
      amount: parseFloat(tx.amount.toString()),
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions.');
  }
}


/**
 * Updates a user's role. This action is restricted to users with the 'SUPERADMIN' role.
 * It validates the session before attempting to update the database.
 *
 * @param {number} userId - The ID of the user to update.
 * @param {number} roleId - The ID of the new role to assign.
 * @returns {Promise<{success: true}>} A promise that resolves to an object indicating success.
 * @throws {Error} If the current session user is not a SUPERADMIN.
 */
export async function updateUserRole(userId: number, roleId: number) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });

  revalidatePath('/backoffice/users');
  return { success: true };
}

/**
 * Updates a membership subscription status.
 * 
 * @param {number} subId - The ID of the subscription to update.
 * @param {string} status - The new status (e.g., 'ACTIVE', 'CANCELLED', 'EXPIRED').
 */
export async function updateSubscriptionStatus(subId: number, status: string) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.subscription.update({
    where: { id: subId },
    data: { status },
  });

  revalidatePath('/backoffice/membership/list');
  return { success: true };
}

/**
 * Updates a subscription's membership tier.
 * 
 * @param {number} subId - The ID of the subscription to update.
 * @param {number} tierId - The ID of the new membership tier.
 */
export async function updateSubscriptionTier(subId: number, tierId: number) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.subscription.update({
    where: { id: subId },
    data: { tierId },
  });

  revalidatePath('/backoffice/membership/list');
  return { success: true };
}

/**
 * Creates a new community event.
 * 
 * @param {Object} eventData - The event data to create.
 */
export async function createEvent(eventData: any) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const newEvent = await prisma.event.create({
    data: {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      date: new Date(eventData.date),
      capacity: eventData.capacity ? parseInt(eventData.capacity, 10) : null,
      memberPrice: Math.round(parseFloat(eventData.memberPrice || 0) * 100) / 100,
      nonMemberPrice: Math.round(parseFloat(eventData.nonMemberPrice || 0) * 100) / 100,
      published: !!eventData.published,
      categoryId: parseInt(eventData.categoryId, 10),
      reminder1DaysBefore: eventData.reminder1DaysBefore ? parseInt(eventData.reminder1DaysBefore, 10) : null,
      reminder2DaysBefore: eventData.reminder2DaysBefore ? parseInt(eventData.reminder2DaysBefore, 10) : null,
    },
  });

  revalidatePath('/backoffice/events');
  return { success: true, event: newEvent };
}

/**
 * Updates an existing community event.
 * 
 * @param {number} eventId - The ID of the event to update.
 * @param {Object} eventData - The updated event data.
 */
export async function updateEvent(eventId: number, eventData: any) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      date: new Date(eventData.date),
      capacity: eventData.capacity ? parseInt(eventData.capacity, 10) : null,
      memberPrice: Math.round(parseFloat(eventData.memberPrice || 0) * 100) / 100,
      nonMemberPrice: Math.round(parseFloat(eventData.nonMemberPrice || 0) * 100) / 100,
      published: !!eventData.published,
      categoryId: parseInt(eventData.categoryId, 10),
      reminder1DaysBefore: eventData.reminder1DaysBefore ? parseInt(eventData.reminder1DaysBefore, 10) : null,
      reminder2DaysBefore: eventData.reminder2DaysBefore ? parseInt(eventData.reminder2DaysBefore, 10) : null,
    },
  });

  revalidatePath('/backoffice/events');
  return { success: true, event: updatedEvent };
}

