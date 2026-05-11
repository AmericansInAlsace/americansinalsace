import argon2 from 'argon2';
import { prisma } from '@/lib/db';
import { MailService } from './MailService';
import crypto from 'node:crypto';

/**
 * AuthService handles user-related authentication logic.
 * Adheres to service-architect and security-sentinel patterns.
 */
export class AuthService {
  /**
   * Registers a new user with a hashed password and sends a verification email.
   * @param {object} data - The user registration data.
   * @param {string} data.firstName - The user's first name.
   * @param {string} data.lastName - The user's last name.
   * @param {string} data.email - The user's email address.
   * @param {string} data.password - The user's plaintext password.
   * @returns {Promise<Omit<User, 'password'>>} The created user object without the password hash.
   * @throws {Error} If registration fails, fields are missing, or user already exists.
   */
  static async registerUser(data: any) {
    const { firstName, lastName, email, password } = data;

    if (!email || !password || !firstName || !lastName) {
      throw new Error('Missing required fields');
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await argon2.hash(password);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const basicRole = await prisma.role.findUnique({ where: { name: 'BASIC_USER' } });

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          verificationToken,
          tokenExpires,
          role: basicRole ? { connect: { id: basicRole.id } } : undefined,
        },
      });

      // Send verification email
      await MailService.sendVerificationEmail(email, verificationToken);

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error('Registration service error:', error.message);
      if (error.message === 'User already exists' || error.message === 'Missing required fields') {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration.');
    }
  }

  /**
   * Verifies a user's email using a token.
   * @param {string} token - The verification token from the email link.
   * @returns {Promise<boolean>} A promise that resolves to true upon successful verification.
   * @throws {Error} If the token is invalid or expired.
   */
  static async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user || !user.tokenExpires || user.tokenExpires < new Date()) {
      throw new Error('Invalid or expired verification token.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        tokenExpires: null,
      },
    });

    return true;
  }

  /**
   * Generates a password reset token and sends a password reset email.
   * @param {string} email - The user's email address.
   * @returns {Promise<boolean>} A promise that resolves to true. For security, it always returns true.
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if the user exists or not
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    await MailService.sendPasswordResetEmail(email, resetToken);
    return true;
  }

  /**
   * Resets the user's password using a valid token.
   * @param {string} token - The password reset token.
   * @param {string} newPassword - The new plaintext password.
   * @returns {Promise<boolean>} A promise that resolves to true upon successful password reset.
   * @throws {Error} If the token is invalid or expired.
   */
  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new Error('Invalid or expired reset token.');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return true;
  }

  /**
   * Verifies user credentials for login.
   * @param {string} email - User's email address.
   * @param {string} password - User's plaintext password.
   * @returns {Promise<Omit<User, 'password'> | null>} The user object without the password hash, or null if credentials fail.
   * @throws {Error} If the user's email is not yet verified.
   */
  static async verifyCredentials(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error('Please verify your email address before logging in.');
      }

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error('Verification service error:', error.message);
      if (error.message === 'Please verify your email address before logging in.') {
        throw error;
      }
      return null;
    }
  }

  /**
   * Retrieves a user by their email address, including role and permissions.
   * @param {string} email - The user's email address.
   * @returns {Promise<Omit<User, 'password'> | null>} The user object or null if not found.
   */
  static async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Retrieves a user by their ID.
   * @param {number} id - The user ID.
   * @returns {Promise<Omit<User, 'password'> | null>} The user object or null if not found.
   */
  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Updates user profile data.
   * @param {number} id - The user ID.
   * @param {object} data - The data to update (firstName, lastName, bio, phone, avatar).
   * @returns {Promise<Omit<User, 'password'>>} A promise that resolves to the updated user object (without password).
   * @throws {Error} If the update fails.
   */
  static async updateUser(id: number, data: { firstName?: string; lastName?: string; bio?: string; phone?: string; avatar?: string }) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      });
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      console.error('Update user service error:', error.message);
      throw new Error('Failed to update profile.');
    }
  }
}
