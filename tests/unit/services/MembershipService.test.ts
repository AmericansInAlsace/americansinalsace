import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MembershipService } from '@/services/MembershipService';
import { prisma } from '@/lib/db';

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
      vi.mocked(prisma.membershipTier.findMany).mockResolvedValue([{ id: 1, name: 'Basic', active: true }] as any);
      const result = await MembershipService.getActiveTiers();
      expect(prisma.membershipTier.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { price: 'asc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getUserSubscription', () => {
    it('should return user subscription with tier details', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({ id: 1, userId: 1, tier: { name: 'Basic' } } as any);
      const result = await MembershipService.getUserSubscription(1);
      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { tier: true },
      });
      expect(result?.tier.name).toBe('Basic');
    });

    it('should return null if not found', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
      const result = await MembershipService.getUserSubscription(999);
      expect(result).toBeNull();
    });
  });

  describe('upsertSubscription', () => {
    it('should create or update a subscription', async () => {
      const subscriptionData = {
        userId: 1,
        tierId: 2,
        status: 'ACTIVE',
        paypalSubscriptionId: 'I-123',
      };
      
      vi.mocked(prisma.subscription.upsert).mockResolvedValue({ id: 1, ...subscriptionData } as any);
      
      const result = await MembershipService.upsertSubscription(subscriptionData);
      
      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: { tierId: 2, status: 'ACTIVE', paypalSubscriptionId: 'I-123' },
        create: { userId: 1, tierId: 2, status: 'ACTIVE', paypalSubscriptionId: 'I-123' },
      });
      expect(result.status).toBe('ACTIVE');
    });

    it('should handle missing optional fields', async () => {
      const subscriptionData = {
        userId: 1,
        tierId: 2,
        status: 'ACTIVE',
      };
      
      vi.mocked(prisma.subscription.upsert).mockResolvedValue({ id: 1, ...subscriptionData } as any);
      
      const result = await MembershipService.upsertSubscription(subscriptionData);
      expect(prisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: { tierId: 2, status: 'ACTIVE' },
        create: { userId: 1, tierId: 2, status: 'ACTIVE' },
      });
      expect(result.status).toBe('ACTIVE');
    });
  });
});
