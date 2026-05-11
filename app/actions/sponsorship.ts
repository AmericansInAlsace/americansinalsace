'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { SponsorshipService } from '@/services/SponsorshipService';

/**
 * Fetches all sponsor tiers.
 */
export async function getSponsorTiers() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'SUPERADMIN' && (session.user as any)?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const tiers = await prisma.sponsorTier.findMany({
    orderBy: { priority: 'desc' },
  });

  // Convert Prisma.Decimal to number for client-side serialization
  return tiers.map(tier => ({
    ...tier,
    price: parseFloat(tier.price.toString())
  }));
}

/**
 * Creates a new sponsor tier.
 */
export async function createSponsorTier(data: {
  name: string;
  description?: string;
  price: number;
  priority?: number;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const tier = await prisma.sponsorTier.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priority: data.priority || 0,
    },
  });

  revalidatePath('/backoffice/sponsors/tiers');
  return { 
    success: true, 
    tier: {
      ...tier,
      price: parseFloat(tier.price.toString())
    } 
  };
}

/**
 * Updates a sponsor tier.
 */
export async function updateSponsorTier(id: number, data: {
  name: string;
  description?: string;
  price: number;
  priority?: number;
  active?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const tier = await prisma.sponsorTier.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priority: data.priority,
      active: data.active,
    },
  });

  revalidatePath('/backoffice/sponsors/tiers');
  return { 
    success: true, 
    tier: {
      ...tier,
      price: parseFloat(tier.price.toString())
    } 
  };
}

/**
 * Deletes a sponsor tier.
 */
export async function deleteSponsorTier(id: number) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.sponsorTier.delete({
    where: { id },
  });

  revalidatePath('/backoffice/sponsors/tiers');
  return { success: true };
}

/**
 * Fetches all sponsorships with user and tier details.
 */
export async function getSponsorships() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'SUPERADMIN' && (session.user as any)?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const sponsorships = await prisma.sponsorship.findMany({
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      tier: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return sponsorships.map(s => ({
    ...s,
    tier: {
      ...s.tier,
      price: parseFloat(s.tier.price.toString())
    }
  }));
}

/**
 * Creates a new sponsorship assignment.
 */
export async function createSponsorshipAction(userId: number, tierId: number, startDateStr: string) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await SponsorshipService.createSponsorship(userId, tierId, new Date(startDateStr));

  revalidatePath('/backoffice/sponsors/list');
  return { success: true };
}

/**
 * Updates a sponsorship record.
 */
export async function updateSponsorshipAction(id: number, data: {
  tierId: number;
  startDate: string;
  status: string;
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 12);

  await prisma.sponsorship.update({
    where: { id },
    data: {
      tierId: data.tierId,
      startDate,
      endDate,
      status: data.status,
    },
  });

  revalidatePath('/backoffice/sponsors/list');
  return { success: true };
}

/**
 * Updates a sponsorship status.
 */
export async function updateSponsorshipStatus(id: number, status: string) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const updateData: any = { status };

  // If reactivating an expired sponsorship, reset the dates to start from today
  if (status === 'ACTIVE') {
    const current = await prisma.sponsorship.findUnique({ where: { id } });
    if (current && (current.status === 'EXPIRED' || current.status === 'CANCELLED')) {
      const now = new Date();
      updateData.startDate = now;
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 12);
      updateData.endDate = endDate;
    }
  }

  await prisma.sponsorship.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/backoffice/sponsors/list');
  return { success: true };
}

/**
 * Updates or creates a sponsor profile (advertising content).
 * Can be called by the user themselves if they are an active sponsor,
 * or by a SUPERADMIN.
 */
export async function updateSponsorProfileAction(data: {
  userId?: number; // Optional: target user ID if called by admin
  companyName: string;
  websiteUrl?: string;
  logoUrl?: string;
  bio?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const sessionUserId = (session.user as any).id;
  const targetUserId = data.userId || sessionUserId;

  // Authorization: either the user is updating their own profile, or is a SUPERADMIN
  if (targetUserId !== sessionUserId && (session.user as any).role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  const updatedProfile = await SponsorshipService.updateSponsorProfile(targetUserId, {
    companyName: data.companyName,
    websiteUrl: data.websiteUrl,
    logoUrl: data.logoUrl,
    bio: data.bio,
  });

  revalidatePath('/profile');
  revalidatePath('/sponsors');
  return { success: true, profile: updatedProfile };
}

/**
 * Searches for users by name or email.
 */
export async function searchUsersForSponsorship(query: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  if (!query || query.length < 2) return [];

  return await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    take: 10,
  });
}
