import { describe, it, expect, beforeEach } from 'vitest';
import { SponsorshipService } from '@/services/SponsorshipService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('SponsorshipService Integration', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
    
    // Seed Sponsor Tiers
    await prisma.sponsorTier.createMany({
        data: [
            { id: 1, name: 'Gold', price: 1000, priority: 10 },
            { id: 2, name: 'Silver', price: 500, priority: 5 },
        ]
    });
  });

  describe('createSponsorship', () => {
    it('should create a sponsorship for a user', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'sponsor@example.com');
      const sponsorship = await SponsorshipService.createSponsorship(user.id, 1, new Date());

      expect(sponsorship).toBeDefined();
      expect(sponsorship.userId).toBe(user.id);
      expect(sponsorship.tierId).toBe(1);
      expect(sponsorship.status).toBe('ACTIVE');
      
      const endDate = new Date(sponsorship.startDate);
      endDate.setMonth(endDate.getMonth() + 12);
      expect(sponsorship.endDate.getTime()).toBeCloseTo(endDate.getTime(), -3); // Within 1 second
    });
  });

  describe('getActiveSponsorship', () => {
    it('should return null if no active sponsorship', async () => {
      const active = await SponsorshipService.getActiveSponsorship(1);
      expect(active).toBeNull();
    });

    it('should return active sponsorship if it exists', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'sponsor@example.com');
      await SponsorshipService.createSponsorship(user.id, 1, new Date());

      const active = await SponsorshipService.getActiveSponsorship(user.id);
      expect(active).toBeDefined();
      expect(active?.tier.name).toBe('Gold');
    });

    it('should return null if sponsorship is expired', async () => {
        const user = await IntegrationTestHelper.seedTestUser(1, 'sponsor@example.com');
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 2);
        
        await prisma.sponsorship.create({
            data: {
                userId: user.id,
                tierId: 1,
                startDate,
                endDate: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE'
            }
        });

        const active = await SponsorshipService.getActiveSponsorship(user.id);
        expect(active).toBeNull();
    });
  });

  describe('sponsorProfile', () => {
    it('should return null if no profile exists', async () => {
      const profile = await SponsorshipService.getSponsorProfile(1);
      expect(profile).toBeNull();
    });

    it('should update/create sponsor profile if user has active sponsorship', async () => {
      const user = await IntegrationTestHelper.seedTestUser(1, 'sponsor@example.com');
      await SponsorshipService.createSponsorship(user.id, 1, new Date());

      const data = {
        companyName: 'ACME Corp',
        websiteUrl: 'https://acme.com',
        bio: 'We make everything.',
      };

      const profile = await SponsorshipService.updateSponsorProfile(user.id, data);
      expect(profile.companyName).toBe(data.companyName);

      const fetched = await SponsorshipService.getSponsorProfile(user.id);
      expect(fetched?.companyName).toBe(data.companyName);
    });

    it('should throw error if user has no active sponsorship when updating profile', async () => {
        const user = await IntegrationTestHelper.seedTestUser(1, 'sponsor@example.com');
        const data = { companyName: 'ACME Corp' };

        await expect(SponsorshipService.updateSponsorProfile(user.id, data)).rejects.toThrow('User does not have an active sponsorship.');
    });
  });

  describe('getAllActiveSponsors', () => {
    it('should return sorted list of active sponsors with profiles', async () => {
      const user1 = await IntegrationTestHelper.seedTestUser(1, 'sponsor1@example.com');
      const user2 = await IntegrationTestHelper.seedTestUser(2, 'sponsor2@example.com');

      await SponsorshipService.createSponsorship(user1.id, 1, new Date()); // Gold
      await SponsorshipService.createSponsorship(user2.id, 2, new Date()); // Silver

      await SponsorshipService.updateSponsorProfile(user1.id, { companyName: 'Zebra Inc' });
      await SponsorshipService.updateSponsorProfile(user2.id, { companyName: 'Apple Corp' });

      const sponsors = await SponsorshipService.getAllActiveSponsors();
      
      expect(sponsors.length).toBe(2);
      // Gold should be first due to higher priority
      expect(sponsors[0].companyName).toBe('Zebra Inc');
      expect(sponsors[0].tierName).toBe('Gold');
      expect(sponsors[1].companyName).toBe('Apple Corp');
      expect(sponsors[1].tierName).toBe('Silver');
    });

    it('should sort by name if priority is the same', async () => {
        const user1 = await IntegrationTestHelper.seedTestUser(1, 'sponsor1@example.com');
        const user2 = await IntegrationTestHelper.seedTestUser(2, 'sponsor2@example.com');
  
        await SponsorshipService.createSponsorship(user1.id, 1, new Date()); // Gold
        await SponsorshipService.createSponsorship(user2.id, 1, new Date()); // Gold
  
        await SponsorshipService.updateSponsorProfile(user1.id, { companyName: 'Zebra Inc' });
        await SponsorshipService.updateSponsorProfile(user2.id, { companyName: 'Apple Corp' });
  
        const sponsors = await SponsorshipService.getAllActiveSponsors();
        
        expect(sponsors.length).toBe(2);
        expect(sponsors[0].companyName).toBe('Apple Corp');
        expect(sponsors[1].companyName).toBe('Zebra Inc');
    });
  });
});
