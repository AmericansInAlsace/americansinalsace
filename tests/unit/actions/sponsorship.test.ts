import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sponsorshipActions from '@/app/actions/sponsorship';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { SponsorshipService } from '@/services/SponsorshipService';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/db', () => ({
  prisma: {
    sponsorTier: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sponsorship: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/services/SponsorshipService', () => ({
  SponsorshipService: {
    createSponsorship: vi.fn(),
    updateSponsorProfile: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('sponsorship actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSponsorTiers', () => {
    it('should return tiers if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.sponsorTier.findMany).mockResolvedValue([{ id: 1, price: 100 } as any]);
      const result = await sponsorshipActions.getSponsorTiers();
      expect(result[0].price).toBe(100);
    });
    it('should throw error if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'USER' } } as any);
      await expect(sponsorshipActions.getSponsorTiers()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createSponsorTier', () => {
    it('should create tier if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.sponsorTier.create).mockResolvedValue({ id: 1, name: 'Gold', price: 500 } as any);
      const result = await sponsorshipActions.createSponsorTier({ name: 'Gold', price: 500 });
      expect(result.success).toBe(true);
    });
    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.createSponsorTier({ name: 'G', price: 50 })).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSponsorTier', () => {
    it('should update tier if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.sponsorTier.update).mockResolvedValue({ id: 1, name: 'Updated', price: 600 } as any);
      const result = await sponsorshipActions.updateSponsorTier(1, { name: 'Updated', price: 600 });
      expect(result.success).toBe(true);
    });
    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.updateSponsorTier(1, { name: 'U', price: 50 })).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteSponsorTier', () => {
    it('should delete tier if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      const result = await sponsorshipActions.deleteSponsorTier(1);
      expect(result.success).toBe(true);
    });
    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.deleteSponsorTier(1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSponsorships', () => {
    it('should return sponsorships if authorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      vi.mocked(prisma.sponsorship.findMany).mockResolvedValue([
        { id: 1, tier: { price: 100 }, user: { email: 'test@test.com' } } as any
      ]);
      const result = await sponsorshipActions.getSponsorships();
      expect(result).toHaveLength(1);
    });
    it('should throw error if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'USER' } } as any);
      await expect(sponsorshipActions.getSponsorships()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createSponsorshipAction', () => {
    it('should create sponsorship if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      const result = await sponsorshipActions.createSponsorshipAction(1, 2, '2026-05-11');
      expect(result.success).toBe(true);
      expect(SponsorshipService.createSponsorship).toHaveBeenCalled();
    });
    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.createSponsorshipAction(1, 2, '2026-05-11')).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSponsorshipAction', () => {
    it('should update sponsorship if SUPERADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      const result = await sponsorshipActions.updateSponsorshipAction(1, { tierId: 2, startDate: '2026-05-11', status: 'ACTIVE' });
      expect(result.success).toBe(true);
    });
    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.updateSponsorshipAction(1, { tierId: 2, startDate: '2026-05-11', status: 'ACTIVE' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSponsorshipStatus', () => {
    it('should update status and reset dates if reactivating', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.sponsorship.findUnique).mockResolvedValue({ id: 1, status: 'EXPIRED' } as any);

      const result = await sponsorshipActions.updateSponsorshipStatus(1, 'ACTIVE');
      expect(result.success).toBe(true);
      expect(prisma.sponsorship.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE', startDate: expect.any(Date) })
      }));
    });

    it('should just update status if not reactivating', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.sponsorship.findUnique).mockResolvedValue({ id: 1, status: 'ACTIVE' } as any);

      const result = await sponsorshipActions.updateSponsorshipStatus(1, 'CANCELLED');
      expect(result.success).toBe(true);
      expect(prisma.sponsorship.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'CANCELLED' }
      }));
    });

    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.updateSponsorshipStatus(1, 'ACTIVE')).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSponsorProfileAction', () => {
    it('should allow user to update their own profile', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      vi.mocked(SponsorshipService.updateSponsorProfile).mockResolvedValue({ id: 10 } as any);

      const result = await sponsorshipActions.updateSponsorProfileAction({ companyName: 'My Co' });
      expect(result.success).toBe(true);
    });

    it('should allow SUPERADMIN to update any profile', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'SUPERADMIN' } } as any);
      vi.mocked(SponsorshipService.updateSponsorProfile).mockResolvedValue({ id: 10 } as any);

      const result = await sponsorshipActions.updateSponsorProfileAction({ userId: 2, companyName: 'Other Co' });
      expect(result.success).toBe(true);
    });

    it('should throw if not authorized (trying to update other profile without SUPERADMIN)', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: 1, role: 'USER' } } as any);
      await expect(sponsorshipActions.updateSponsorProfileAction({ userId: 2, companyName: 'Other' })).rejects.toThrow('Unauthorized');
    });

    it('should throw if no session', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(sponsorshipActions.updateSponsorProfileAction({ companyName: 'My' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('searchUsersForSponsorship', () => {
    it('should return users if authorized and query provided', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 1, email: 'test@test.com' } as any]);

      const result = await sponsorshipActions.searchUsersForSponsorship('test');
      expect(result).toHaveLength(1);
    });

    it('should return empty if query too short', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'SUPERADMIN' } } as any);
      const result = await sponsorshipActions.searchUsersForSponsorship('t');
      expect(result).toHaveLength(0);
    });

    it('should throw if unauthorized', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
      await expect(sponsorshipActions.searchUsersForSponsorship('test')).rejects.toThrow('Unauthorized');
    });
  });
});
