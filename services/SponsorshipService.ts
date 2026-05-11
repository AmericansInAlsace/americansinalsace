import { prisma } from '@/lib/db';

/**
 * SponsorshipService handles business logic for Sponsor Tiers,
 * Sponsorship records, and Sponsor Profiles.
 */
export class SponsorshipService {
  /**
   * Retrieves the current active sponsorship for a user.
   * A sponsorship is active if its status is 'ACTIVE' and it hasn't expired.
   */
  static async getActiveSponsorship(userId: number) {
    const now = new Date();
    return await prisma.sponsorship.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        tier: true,
      },
    });
  }

  /**
   * Fetches the advertising profile for a sponsor.
   */
  static async getSponsorProfile(userId: number) {
    return await prisma.sponsorProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Updates or creates a sponsor's advertising profile.
   */
  static async updateSponsorProfile(userId: number, data: {
    companyName: string;
    websiteUrl?: string;
    logoUrl?: string;
    bio?: string;
  }) {
    // Verify user has an active sponsorship before allowing profile updates
    const activeSponsorship = await this.getActiveSponsorship(userId);
    if (!activeSponsorship) {
      throw new Error('User does not have an active sponsorship.');
    }

    return await prisma.sponsorProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Retrieves all active sponsors for public display.
   * Ordered by tier priority (highest first) and name.
   */
  static async getAllActiveSponsors() {
    const now = new Date();
    const activeSponsorships = await prisma.sponsorship.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        userId: true,
        tier: {
          select: {
            priority: true,
            name: true,
          }
        }
      }
    });

    const userIds = activeSponsorships.map(s => s.userId);

    // Fetch profiles for these users
    const profiles = await prisma.sponsorProfile.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Merge tier priority and sort
    return profiles.map(profile => {
      const sponsorship = activeSponsorships.find(s => s.userId === profile.userId);
      return {
        ...profile,
        tierName: sponsorship?.tier.name,
        priority: sponsorship?.tier.priority || 0,
      };
    }).sort((a, b) => (b.priority - a.priority) || a.companyName.localeCompare(b.companyName));
  }

  /**
   * Admin: Creates a new sponsorship for a user.
   */
  static async createSponsorship(userId: number, tierId: number, startDateInput: Date) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12); // Always 12 months

    return await prisma.sponsorship.create({
      data: {
        userId,
        tierId,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });
  }
}
