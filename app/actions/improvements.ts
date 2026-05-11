'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { JiraService } from '@/services/JiraService';

/**
 * Checks if the current user has access to the backoffice.
 * Currently, only SUPERADMIN is allowed, but this can be expanded.
 */
async function isBackofficeUser(session: any) {
  return session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN';
}

/**
 * Checks if the current user is a SUPERADMIN.
 */
async function isSuperAdmin(session: any) {
  return session?.user?.role === 'SUPERADMIN';
}

/**
 * Fetches all improvement categories.
 */
export async function getImprovementCategories() {
  const session = await getServerSession(authOptions);
  
  if (!(await isBackofficeUser(session))) {
    throw new Error('Unauthorized');
  }

  return await prisma.improvementCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Creates a new improvement category.
 */
export async function createImprovementCategory(name: string) {
  const session = await getServerSession(authOptions);

  if (!(await isSuperAdmin(session))) {
    throw new Error('Unauthorized: Only SUPERADMIN can manage categories.');
  }

  const category = await prisma.improvementCategory.create({
    data: { name },
  });

  revalidatePath('/backoffice/improvements/categories');
  return { success: true, category };
}

/**
 * Updates an improvement category.
 */
export async function updateImprovementCategory(id: number, name: string) {
  const session = await getServerSession(authOptions);

  if (!(await isSuperAdmin(session))) {
    throw new Error('Unauthorized: Only SUPERADMIN can manage categories.');
  }

  const category = await prisma.improvementCategory.update({
    where: { id },
    data: { name },
  });

  revalidatePath('/backoffice/improvements/categories');
  return { success: true, category };
}

/**
 * Deletes an improvement category.
 */
export async function deleteImprovementCategory(id: number) {
  const session = await getServerSession(authOptions);

  if (!(await isSuperAdmin(session))) {
    throw new Error('Unauthorized: Only SUPERADMIN can manage categories.');
  }

  await prisma.improvementCategory.delete({
    where: { id },
  });

  revalidatePath('/backoffice/improvements/categories');
  return { success: true };
}

/**
 * Submits an improvement request to JIRA.
 */
export async function submitImprovement(data: { subject: string; category: string; description: string }) {
  const session = await getServerSession(authOptions);

  if (!(await isBackofficeUser(session))) {
    throw new Error('Unauthorized');
  }

  try {
    const jiraResponse = await JiraService.createIssue(
      data.subject,
      data.description,
      data.category,
      {
        name: session?.user?.name || 'Unknown User',
        email: session?.user?.email || 'N/A',
      }
    );

    return { success: true, jiraKey: jiraResponse.key };
  } catch (error: any) {
    console.error('Failed to submit improvement to JIRA:', error);
    throw new Error(error.message || 'Failed to create JIRA ticket');
  }
}
