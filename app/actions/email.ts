'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Updates an email template in the database. This action is restricted to SUPERADMINs.
 * @param {number} id - The ID of the email template to update.
 * @param {object} data - The new data for the template.
 * @param {string} data.name - The name of the template.
 * @param {string} data.subject - The subject line of the template.
 * @param {string} data.content - The HTML content of the template.
 * @returns {Promise<{success: true}>} An object indicating success.
 * @throws {Error} If the user is not authorized.
 */
export async function updateEmailTemplate(id: number, data: { name: string; subject: string; content: string }) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.emailTemplate.update({
    where: { id },
    data,
  });

  revalidatePath('/backoffice/communications/templates');
  return { success: true };
}

/**
 * Retrieves the most recent email logs. This action is restricted to SUPERADMINs.
 * @returns {Promise<EmailLog[]>} A promise that resolves to an array of the latest 100 email logs.
 * @throws {Error} If the user is not authorized.
 */
export async function getEmailLogs() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== 'SUPERADMIN') {
    throw new Error('Unauthorized');
  }

  return prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 100,
  });
}
