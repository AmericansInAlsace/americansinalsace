import { describe, it, expect, beforeEach } from 'vitest';
import { MembershipService } from '@/services/MembershipService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('MembershipService Integration', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('getActiveTiers', () => {
    it('should return all active membership tiers', async () => {
      const tiers = await MembershipService.getActiveTiers();
      expect(tiers.length).toBeGreaterThan(0);
      expect(tiers.every(t => t.active)).toBe(true);
    });
  });

  describe('getUserSubscription', () => {
    it('should return null if user has no subscription', async () => {
      const sub = await MembershipService.getUserSubscription(1);
      expect(sub).toBeNull();
    });

    it('should return user subscription if it exists', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      const tier = (await MembershipService.getActiveTiers())[0];

      await prisma.subscription.create({
        data: {
          userId: user.id,
          tierId: tier.id,
          status: 'ACTIVE',
        },
      });

      const sub = await MembershipService.getUserSubscription(user.id);
      expect(sub).toBeDefined();
      expect(sub?.tierId).toBe(tier.id);
      expect(sub?.status).toBe('ACTIVE');
    });
  });

  describe('upsertSubscription', () => {
    it('should create a new subscription', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      const tier = (await MembershipService.getActiveTiers())[0];

      const sub = await MembershipService.upsertSubscription({
        userId: user.id,
        tierId: tier.id,
        status: 'ACTIVE',
        paypalSubscriptionId: 'I-12345',
      });

      expect(sub).toBeDefined();
      expect(sub.userId).toBe(user.id);
      expect(sub.status).toBe('ACTIVE');
      expect(sub.paypalSubscriptionId).toBe('I-12345');
    });

    it('should update an existing subscription', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
      const tiers = await MembershipService.getActiveTiers();

      await MembershipService.upsertSubscription({
        userId: user.id,
        tierId: tiers[0].id,
        status: 'ACTIVE',
      });

      const updated = await MembershipService.upsertSubscription({
        userId: user.id,
        tierId: tiers[1].id,
        status: 'CANCELLED',
      });

      expect(updated.tierId).toBe(tiers[1].id);
      expect(updated.status).toBe('CANCELLED');
    });
  });
});
