import { prisma } from '@/lib/db';

/**
 * MembershipService handles core business logic for membership tiers and user subscriptions.
 * Adheres to Service Architect mandates.
 */
export class MembershipService {
  /**
   * Retrieves all active membership tiers from the database.
   * @returns {Promise<MembershipTier[]>} A promise that resolves to an array of active membership tiers.
   */
  static async getActiveTiers() {
    return prisma.membershipTier.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Gets the current subscription status for a user.
   * @param {number} userId - The user ID.
   * @returns {Promise<Subscription | null>} A promise that resolves to the user's subscription or null if not found.
   */
  static async getUserSubscription(userId: number) {
    return prisma.subscription.findUnique({
      where: { userId },
      include: { tier: true },
    });
  }

  /**
   * Creates or updates a user's subscription record.
   * @param {object} data - The subscription data.
   * @param {number} data.userId - The ID of the user.
   * @param {number} data.tierId - The ID of the membership tier.
   * @param {string} data.status - The status of the subscription (e.g., 'ACTIVE', 'CANCELLED').
   * @param {string} [data.paypalSubscriptionId] - The optional ID from PayPal.
   * @param {Date} [data.startDate] - The optional start date of the subscription.
   * @param {Date} [data.endDate] - The optional end date of the subscription.
   * @returns {Promise<Subscription>} A promise that resolves to the created or updated subscription.
   */
  static async upsertSubscription(data: {
    userId: number;
    tierId: number;
    status: string;
    paypalSubscriptionId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { userId, ...rest } = data;
    return prisma.subscription.upsert({
      where: { userId },
      update: rest,
      create: { userId, ...rest },
    });
  }
}
