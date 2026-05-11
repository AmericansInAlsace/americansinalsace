import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getTiers } from '@/app/api/membership/tiers/route';
import { prisma } from '@/lib/db';
import { MembershipService } from '@/services/MembershipService';

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

describe('Integration: Membership Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch active membership tiers via API', async () => {
    const mockTiers = [
      { id: 1, name: 'Basic', price: 10, active: true },
      { id: 2, name: 'Premium', price: 20, active: true },
    ];

    vi.mocked(prisma.membershipTier.findMany).mockResolvedValue(mockTiers as any);

    const response = await getTiers({} as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tiers).toHaveLength(2);
    expect(data.tiers[0].name).toBe('Basic');
  });

  it('should handle errors when fetching tiers', async () => {
    vi.mocked(prisma.membershipTier.findMany).mockRejectedValue(new Error('DB Error'));

    const response = await getTiers({} as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('DB Error');
  });

  it('should upsert a subscription correctly', async () => {
    const subData = {
      userId: 1,
      tierId: 2,
      status: 'ACTIVE',
      paypalSubscriptionId: 'I-123',
    };

    vi.mocked(prisma.subscription.upsert).mockResolvedValue({ id: 100, ...subData } as any);

    const result = await MembershipService.upsertSubscription(subData);

    expect(result.id).toBe(100);
    expect(prisma.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: 1 },
      update: { tierId: 2, status: 'ACTIVE', paypalSubscriptionId: 'I-123' },
      create: subData,
    });
  });
});
