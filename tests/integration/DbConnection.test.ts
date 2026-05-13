import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('Integration: Database Connection', () => {
  it('should be able to connect to the test database and run queries', async () => {
    // Check if we can reach the DB
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
    
    // Seed basic data
    await IntegrationTestHelper.seedBasicData();

    // Check if tables exist and have data
    const tierCount = await prisma.membershipTier.count();
    expect(tierCount).toBeGreaterThan(0);

    const tier = await prisma.membershipTier.findUnique({ where: { id: 1 } });
    expect(tier?.name).toBe('Basic Annual');
  });
});
