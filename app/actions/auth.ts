'use server';

import { prisma } from '@/lib/db';
import argon2 from 'argon2';

/**
 * Handles the registration of a new user.
 * 
 * @description Validates the form data, hashes the password, and creates a user in the database.
 * @param {FormData} formData - The form data containing user details (firstName, lastName, email, password).
 * @returns {Promise<{ success?: boolean; error?: string }>} An object indicating success or an error message.
 */
export async function handleRegister(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: 'All fields are required' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await argon2.hash(password);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong during registration' };
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
