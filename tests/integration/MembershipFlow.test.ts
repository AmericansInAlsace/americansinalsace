import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getTiers } from '@/app/api/membership/tiers/route';
import { prisma } from '@/lib/db';
import { MembershipService } from '@/services/MembershipService';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('Integration: Membership Flow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should fetch active membership tiers via API', async () => {
    const response = await getTiers();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tiers).toHaveLength(2);
    // Ordered by price asc
    expect(data.tiers[0].name).toBe('Premium Monthly');
  });

  it('should upsert a subscription correctly', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    
    const subData = {
      userId: 1,
      tierId: 2,
      status: 'ACTIVE',
      paypalSubscriptionId: 'I-123',
    };

    await MembershipService.upsertSubscription(subData);

    // Verify in DB
    const sub = await prisma.subscription.findUnique({ where: { userId: 1 } });
    expect(sub).toBeDefined();
    expect(sub?.tierId).toBe(2);
    expect(sub?.status).toBe('ACTIVE');
    expect(sub?.paypalSubscriptionId).toBe('I-123');
  });
});

