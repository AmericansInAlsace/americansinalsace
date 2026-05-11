import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MembershipService } from '@/services/MembershipService';
import { prisma } from '@/lib/db';

// Mock the prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    membershipTier: {
      findMany: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('MembershipService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveTiers', () => {
    it('should return active membership tiers', async () => {
      const mockTiers = [
        { id: 1, name: 'Individual', price: 20, active: true },
        { id: 2, name: 'Family', price: 50, active: true },
      ];

      vi.mocked(prisma.membershipTier.findMany).mockResolvedValue(mockTiers as any);

      const result = await MembershipService.getActiveTiers();

      expect(prisma.membershipTier.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { price: 'asc' },
      });
      expect(result).toEqual(mockTiers);
    });
  });

  describe('getUserSubscription', () => {
    it('should return user subscription with tier details', async () => {
      const mockSubscription = {
        userId: 1,
        tierId: 1,
        status: 'ACTIVE',
        tier: { id: 1, name: 'Individual' },
      };

      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(mockSubscription as any);

      const result = await MembershipService.getUserSubscription(1);

      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { tier: true },
      });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('upsertSubscription', () => {
    it('should create or update a subscription', async () => {
      const subscriptionData = {
        userId: 1,
        tierId: 2,
        status: 'ACTIVE',
        paypalSubscriptionId: 'I-123',
        startDate: new Date(),
        endDate: new Date(),
      };

      vi.mocked(prisma.subscription.upsert).mockResolvedValue({ id: 10, ...subscriptionData } as any);

      const result = await MembershipService.upsertSubscription(subscriptionData);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: {
          tierId: 2,
          status: 'ACTIVE',
          paypalSubscriptionId: 'I-123',
          startDate: subscriptionData.startDate,
          endDate: subscriptionData.endDate,
        },
        create: subscriptionData,
      });
      expect(result.status).toBe('ACTIVE');
    });
  });
});
