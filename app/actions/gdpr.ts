'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MailService } from '@/services/MailService';
import { revalidatePath } from 'next/cache';

/**
 * Checks if the current user is an admin.
 */
async function isAdmin(session: any) {
  return session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
}

/**
 * Exports all user data as JSON and sends it via email.
 */
export async function exportUserData(userId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const currentUserId = session.user.id;
  const isTargetingSelf = currentUserId === userId;

  if (!isTargetingSelf && !(await isAdmin(session))) {
    throw new Error('Unauthorized: You can only export your own data.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: { include: { tier: true } },
      rsvps: { include: { event: true } },
      transactions: true,
      sponsorships: { include: { tier: true } },
      sponsorProfile: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Remove sensitive internal fields before export
  const exportData = {
    ...user,
    password: '[REDACTED]',
    verificationToken: undefined,
    resetToken: undefined,
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  try {
    await MailService.sendDataExportEmail(user.email, jsonString);
    return { success: true };
  } catch (error: any) {
    console.error('Data export failed:', error);
    throw new Error('Failed to send export email');
  }
}

/**
 * Anonymizes user data to comply with the right to be forgotten.
 */
export async function anonymizeUserData(userId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const currentUserId = session.user.id;
  const isTargetingSelf = currentUserId === userId;

  if (!isTargetingSelf && !(await isAdmin(session))) {
    throw new Error('Unauthorized: You can only anonymize your own data.');
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete the sponsor profile if it exists as it contains company PII
      await tx.sponsorProfile.deleteMany({
        where: { userId },
      });

      // 2. Anonymize the main user record
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: 'Anonymized',
          lastName: 'User',
          email: `anon_${userId}_${Date.now()}@americansinalsace.fr`,
          password: Math.random().toString(36).substring(2, 15),
          phone: null,
          bio: null,
          avatar: null,
          emailVerified: null,
          tokenExpires: null,
          verificationToken: null,
          resetToken: null,
          resetTokenExpires: null,
        },
      });
    });

    revalidatePath('/backoffice/users');
    revalidatePath('/profile');

    return { success: true };
  } catch (error: any) {
    console.error('Anonymization failed:', error);
    throw new Error('Failed to anonymize user data');
  }
}
