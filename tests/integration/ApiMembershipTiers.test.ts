import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/membership/tiers/route';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { MembershipService } from '@/services/MembershipService';

describe('Integration: API Membership Tiers', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
    vi.restoreAllMocks();
  });

  it('should return all active membership tiers', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tiers).toHaveLength(2);
    expect(data.tiers[0].name).toBe('Premium Monthly');
    expect(data.tiers[1].name).toBe('Basic Annual');
  });

  it('should return an empty array if no tiers exist', async () => {
    await IntegrationTestHelper.clearDatabase();
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.tiers).toHaveLength(0);
  });

  it('should return 500 if an error occurs', async () => {
    vi.spyOn(MembershipService, 'getActiveTiers').mockRejectedValueOnce(new Error('DB Error'));
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('DB Error');
  });
});
