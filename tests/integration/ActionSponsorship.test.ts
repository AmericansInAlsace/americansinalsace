import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getSponsorTiers,
  createSponsorTier,
  updateSponsorTier,
  deleteSponsorTier,
  getSponsorships,
  createSponsorshipAction,
  updateSponsorshipAction,
  updateSponsorshipStatus,
  updateSponsorProfileAction,
  searchUsersForSponsorship
} from '@/app/actions/sponsorship';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { Prisma } from '@/lib/generated/prisma';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Integration: Sponsorship Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  describe('Authorization Errors', () => {
    it('should throw Unauthorized if not ADMIN or SUPERADMIN for getSponsorTiers', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getSponsorTiers()).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for createSponsorTier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(createSponsorTier({ name: 'Tier', price: 100 })).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateSponsorTier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(updateSponsorTier(1, { name: 'Tier', price: 100 })).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for deleteSponsorTier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(deleteSponsorTier(1)).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not ADMIN or SUPERADMIN for getSponsorships', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(getSponsorships()).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for createSponsorshipAction', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(createSponsorshipAction(1, 1, new Date().toISOString())).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateSponsorshipAction', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(updateSponsorshipAction(1, { tierId: 1, startDate: new Date().toISOString(), status: 'ACTIVE' })).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for updateSponsorshipStatus', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(updateSponsorshipStatus(1, 'ACTIVE')).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not updating own profile and not SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(updateSponsorProfileAction({ userId: 2, companyName: 'Company' })).rejects.toThrow('Unauthorized');
    });

    it('should throw Unauthorized if not SUPERADMIN for searchUsersForSponsorship', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await expect(searchUsersForSponsorship('query')).rejects.toThrow('Unauthorized');
    });
  });

  describe('Success Paths', () => {
    it('should fetch sponsor tiers for SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const tiers = await getSponsorTiers();
      expect(tiers.length).toBeGreaterThan(0);
      expect(tiers[0].name).toBe('Gold');
    });

    it('should fetch sponsor tiers for ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'ADMIN' } } as any);
      await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const tiers = await getSponsorTiers();
      expect(tiers.length).toBeGreaterThan(0);
    });

    it('should create sponsor tier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const res = await createSponsorTier({ name: 'Silver', price: 500 });
      expect(res.success).toBe(true);
      expect(res.tier.name).toBe('Silver');
    });

    it('should update sponsor tier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const tier = await prisma.sponsorTier.create({ data: { name: 'Bronze', price: new Prisma.Decimal(100) } });
      const res = await updateSponsorTier(tier.id, { name: 'Bronze Updated', price: 150 });
      expect(res.success).toBe(true);
      expect(res.tier.name).toBe('Bronze Updated');
    });

    it('should delete sponsor tier', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const tier = await prisma.sponsorTier.create({ data: { name: 'To Delete', price: new Prisma.Decimal(100) } });
      const res = await deleteSponsorTier(tier.id);
      expect(res.success).toBe(true);
      const count = await prisma.sponsorTier.count({ where: { id: tier.id } });
      expect(count).toBe(0);
    });

    it('should get sponsorships', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'sponsor@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      await prisma.sponsorship.create({
        data: { userId: user.id, tierId: tier.id, startDate: new Date(), endDate: new Date(), status: 'ACTIVE' }
      });
      const res = await getSponsorships();
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].user.email).toBe('sponsor@example.com');
    });

    it('should create sponsorship action', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'sponsor2@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const res = await createSponsorshipAction(user.id, tier.id, new Date().toISOString());
      expect(res.success).toBe(true);
      const sp = await prisma.sponsorship.findFirst({ where: { userId: user.id } });
      expect(sp).toBeDefined();
    });

    it('should update sponsorship action', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'sponsor3@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const sp = await prisma.sponsorship.create({
        data: { userId: user.id, tierId: tier.id, startDate: new Date(), endDate: new Date(), status: 'PENDING' }
      });
      const res = await updateSponsorshipAction(sp.id, { tierId: tier.id, startDate: new Date().toISOString(), status: 'ACTIVE' });
      expect(res.success).toBe(true);
      const updatedSp = await prisma.sponsorship.findUnique({ where: { id: sp.id } });
      expect(updatedSp?.status).toBe('ACTIVE');
    });

    it('should update sponsorship status', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'sponsor4@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const sp = await prisma.sponsorship.create({
        data: { userId: user.id, tierId: tier.id, startDate: new Date(), endDate: new Date(), status: 'PENDING' }
      });
      const res = await updateSponsorshipStatus(sp.id, 'ACTIVE');
      expect(res.success).toBe(true);
    });

    it('should update sponsorship status from EXPIRED to ACTIVE and reset dates', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      const user = await IntegrationTestHelper.seedTestUser(10, 'sponsor5@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'Gold', price: new Prisma.Decimal(1000) } });
      const sp = await prisma.sponsorship.create({
        data: { userId: user.id, tierId: tier.id, startDate: new Date('2020-01-01'), endDate: new Date('2021-01-01'), status: 'EXPIRED' }
      });
      const res = await updateSponsorshipStatus(sp.id, 'ACTIVE');
      expect(res.success).toBe(true);
      const updatedSp = await prisma.sponsorship.findUnique({ where: { id: sp.id } });
      expect(updatedSp?.startDate.getFullYear()).toBe(new Date().getFullYear());
    });

    it('should update own sponsor profile', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await IntegrationTestHelper.seedTestUser(1, 'user@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'G1', price: new Prisma.Decimal(100) } });
      await prisma.sponsorship.create({
        data: { userId: 1, tierId: tier.id, startDate: new Date(), endDate: new Date('2030-01-01'), status: 'ACTIVE' }
      });
      const res = await updateSponsorProfileAction({ companyName: 'My Company' });
      expect(res.success).toBe(true);
      const profile = await prisma.sponsorProfile.findUnique({ where: { userId: 1 } });
      expect(profile?.companyName).toBe('My Company');
    });

    it('should update someone elses sponsor profile if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await IntegrationTestHelper.seedTestUser(2, 'user2@example.com');
      const tier = await prisma.sponsorTier.create({ data: { name: 'G2', price: new Prisma.Decimal(100) } });
      await prisma.sponsorship.create({
        data: { userId: 2, tierId: tier.id, startDate: new Date(), endDate: new Date('2030-01-01'), status: 'ACTIVE' }
      });
      const res = await updateSponsorProfileAction({ userId: 2, companyName: 'Their Company' });
      expect(res.success).toBe(true);
      const profile = await prisma.sponsorProfile.findUnique({ where: { userId: 2 } });
      expect(profile?.companyName).toBe('Their Company');
    });

    it('should search users for sponsorship', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      await IntegrationTestHelper.seedTestUser(2, 'searchme@example.com', 'John', 'Doe');
      const res = await searchUsersForSponsorship('searchme');
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].email).toBe('searchme@example.com');
      const empty = await searchUsersForSponsorship('');
      expect(empty.length).toBe(0);
    });
  });
});