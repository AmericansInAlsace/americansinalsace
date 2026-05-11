'use server';

import { AuthService } from '@/services/AuthService';

/**
 * Handles the server-side logic for a password reset request from the UI.
 * It extracts the email from the form data and calls the AuthService.
 * @param {FormData} formData - The form data containing the user's email.
 * @returns {Promise<{ success?: boolean; error?: string }>} An object indicating the outcome. Returns success even if the user doesn't exist for security.
 */
export async function handleRequestReset(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  try {
    await AuthService.requestPasswordReset(email);
    return { success: true };
  } catch (error: any) {
    console.error('Request reset action error:', error.message);
    return { error: 'Something went wrong. Please try again later.' };
  }
}

/**
 * Handles the final step of resetting a user's password.
 * It validates the token and new password from the form data and calls the AuthService.
 * @param {FormData} formData - The form data containing the reset token and the new password.
 * @returns {Promise<{ success?: boolean; error?: string }>} An object indicating success or failure.
 */
export async function handleResetPassword(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token || !password) {
    return { error: 'Token and password are required' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    await AuthService.resetPassword(token, password);
    return { success: true };
  } catch (error: any) {
    console.error('Reset password action error:', error.message);
    return { error: error.message || 'Failed to reset password.' };
  }
}
