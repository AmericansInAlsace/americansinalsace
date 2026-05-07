import argon2 from 'argon2';
import { prisma } from '@/lib/db';

/**
 * AuthService handles user-related authentication logic.
 * Adheres to service-architect and security-sentinel patterns.
 */
export class AuthService {
  /**
   * Registers a new user with a hashed password.
   * @param data - The user registration data.
   * @throws Error if registration fails or user exists.
   */
  static async registerUser(data: any) {
    // Explicitly destructure to avoid mass assignment
    const { firstName, lastName, email, password, bio, avatar, phone } = data;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Missing required fields');
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password using Argon2
      const hashedPassword = await argon2.hash(password);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          bio,
          avatar,
          phone,
        },
      });

      // Filter out sensitive data before returning
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      // Log details to console for debugging
      console.error('Registration service error:', error.message);
      // Throw generic or relevant error to the handler
      if (error.message === 'User already exists' || error.message === 'Missing required fields') {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  }

  /**
   * Verifies user credentials for login.
   * @param email - User email.
   * @param password - Plain text password.
   */
  static async verifyCredentials(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Verification service error:', error);
      return null;
    }
  }
}
