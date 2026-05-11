'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuthService } from '@/services/AuthService';
import { revalidatePath } from 'next/cache';

/**
 * Handles the update of a user's profile information.
 * 
 * @description Validates session, extracts form data, and delegates update to AuthService.
 * @param {FormData} formData - The form data containing profile details.
 * @returns {Promise<{ success?: boolean; error?: string }>} Result of the update operation.
 */
export async function handleUpdateProfile(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const userId = (session.user as any).id;
  
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const bio = formData.get('bio') as string;
  const phone = formData.get('phone') as string;

  if (!firstName || !lastName) {
    return { error: 'First name and last name are required.' };
  }

  try {
    await AuthService.updateUser(Number(userId), {
      firstName,
      lastName,
      bio,
      phone,
    });
    
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
