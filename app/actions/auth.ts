'use server';

import { AuthService } from '@/services/AuthService';
import { LoggerService } from '@/services/LoggerService';

/**
 * Handles the registration of a new user via the UI.
 * 
 * @description Validates the form data and delegates the registration logic to the AuthService.
 * @param {FormData} formData - The form data containing user details (firstName, lastName, email, password).
 * @returns {Promise<{ success?: boolean; error?: string }>} An object indicating success or an error message.
 */
export async function handleRegister(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const data = Object.fromEntries(formData.entries());

  try {
    await AuthService.registerUser(data);
    return { success: true };
  } catch (error: any) {
    await LoggerService.error('WEB', `Registration failed for ${data.email}`, { error: error.message });
    return { error: error.message || 'Something went wrong during registration' };
  }
}

/**
 * Handles the login data preparation.
 * 
 * @description Extract credentials from form data for client-side authentication.
 * @param {FormData} formData - The form data containing login credentials (email, password).
 * @returns {Promise<{ email?: string; password?: string; error?: string }>} An object containing the credentials or an error.
 */
export async function handleLogin(formData: FormData): Promise<{ email?: string; password?: string; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  return { email, password };
}
