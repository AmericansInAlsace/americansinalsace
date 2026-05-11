import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SponsorshipService } from '@/services/SponsorshipService';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    sponsorship: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    sponsorProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('SponsorshipService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-11T12:00:00Z'));
  });

  describe('getActiveSponsorship', () => {
    it('should return active sponsorship if it exists', async () => {
      const mockSponsorship = { id: 1, userId: 1, status: 'ACTIVE', tier: { name: 'GOLD' } };
      vi.mocked(prisma.sponsorship.findFirst).mockResolvedValue(mockSponsorship as any);

      const result = await SponsorshipService.getActiveSponsorship(1);

      expect(prisma.sponsorship.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: 1,
          status: 'ACTIVE',
        })
      }));
      expect(result).toEqual(mockSponsorship);
    });
  });

  describe('getSponsorProfile', () => {
    it('should return sponsor profile', async () => {
      const mockProfile = { userId: 1, companyName: 'Test Corp' };
      vi.mocked(prisma.sponsorProfile.findUnique).mockResolvedValue(mockProfile as any);

      const result = await SponsorshipService.getSponsorProfile(1);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateSponsorProfile', () => {
    it('should upsert profile if user has active sponsorship', async () => {
      vi.mocked(prisma.sponsorship.findFirst).mockResolvedValue({ id: 1 } as any);
      vi.mocked(prisma.sponsorProfile.upsert).mockResolvedValue({ userId: 1, companyName: 'New' } as any);

      const result = await SponsorshipService.updateSponsorProfile(1, { companyName: 'New' });

      expect(prisma.sponsorProfile.upsert).toHaveBeenCalled();
      expect(result.companyName).toBe('New');
    });

    it('should throw error if user has no active sponsorship', async () => {
      vi.mocked(prisma.sponsorship.findFirst).mockResolvedValue(null);

      await expect(SponsorshipService.updateSponsorProfile(1, { companyName: 'Fail' }))
        .rejects.toThrow('User does not have an active sponsorship.');
    });
  });

  describe('getAllActiveSponsors', () => {
    it('should return merged and sorted profiles', async () => {
      const mockSponsorships = [
        { userId: 1, tier: { name: 'GOLD', priority: 10 } },
        { userId: 2, tier: { name: 'SILVER', priority: 5 } },
      ];
      const mockProfiles = [
        { userId: 1, companyName: 'A Corp' },
        { userId: 2, companyName: 'B Corp' },
      ];

      vi.mocked(prisma.sponsorship.findMany).mockResolvedValue(mockSponsorships as any);
      vi.mocked(prisma.sponsorProfile.findMany).mockResolvedValue(mockProfiles as any);

      const result = await SponsorshipService.getAllActiveSponsors();

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(1); // GOLD has higher priority
      expect(result[0].tierName).toBe('GOLD');
    });
  });

  describe('createSponsorship', () => {
    it('should create a sponsorship with 12 months duration', async () => {
      const startDate = new Date('2026-01-01');
      vi.mocked(prisma.sponsorship.create).mockResolvedValue({ id: 1 } as any);

      await SponsorshipService.createSponsorship(1, 10, startDate);

      expect(prisma.sponsorship.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          tierId: 10,
          startDate: startDate,
          endDate: new Date('2027-01-01'),
          status: 'ACTIVE',
        })
      });
    });
  });
});
