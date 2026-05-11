import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';

/**
 * MailService handles all email communication for the application.
 * It uses Nodemailer and is configured to work with MailDev in development environments.
 */
export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
    ignoreTLS: true,
  });

  /**
   * Fetches an email template from the database and injects placeholder values.
   * @private
   * @param {string} slug - The unique slug of the email template.
   * @param {Record<string, string>} placeholders - A key-value map of placeholders to replace in the template.
   * @returns {Promise<{content: string, subject: string}>} The processed HTML content and subject line.
   * @throws {Error} If the template is not found.
   */
  private static async getProcessedTemplate(slug: string, placeholders: Record<string, string>) {
    const template = await prisma.emailTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new Error(`Email template "${slug}" not found.`);
    }

    let { content, subject } = template;

    Object.entries(placeholders).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    return { content, subject };
  }

  /**
   * Logs the status of a sent email to the database.
   * @private
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {'SUCCESS' | 'FAILED'} status - The delivery status.
   * @param {string} [error] - An optional error message if the delivery failed.
   * @returns {Promise<void>}
   */
  private static async logEmail(recipient: string, subject: string, status: 'SUCCESS' | 'FAILED', error?: string) {
    await prisma.emailLog.create({
      data: {
        recipient,
        subject,
        status,
        error,
      },
    });
  }

  /**
   * Sends a verification email to a new user.
   * @param {string} email - The recipient's email address.
   * @param {string} token - The verification token to include in the action URL.
   * @returns {Promise<void>}
   * @throws {Error} If sending the email fails.
   */
  static async sendVerificationEmail(email: string, token: string) {
    const actionUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    try {
      const { content, subject } = await this.getProcessedTemplate('verification-email', { actionUrl });

      const mailOptions = {
        from: '"Americans in Alsace" <no-reply@americansinalsace.fr>',
        to: email,
        subject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, subject, 'SUCCESS');
      console.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      console.error('Email sending error:', error);
      await this.logEmail(email, 'Verification Email', 'FAILED', error.message);
      throw new Error('Failed to send verification email.');
    }
  }

  /**
   * Sends a password reset email to the user.
   * @param {string} email - The user's email address.
   * @param {string} token - The password reset token to include in the action URL.
   * @returns {Promise<void>}
   * @throws {Error} If sending the email fails.
   */
  static async sendPasswordResetEmail(email: string, token: string) {
    const actionUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      const { content, subject } = await this.getProcessedTemplate('reset-password', { actionUrl });

      const mailOptions = {
        from: '"Americans in Alsace" <no-reply@americansinalsace.fr>',
        to: email,
        subject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, subject, 'SUCCESS');
      console.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('Email sending error:', error);
      await this.logEmail(email, 'Password Reset Email', 'FAILED', error.message);
      throw new Error('Failed to send password reset email.');
    }
  }
}
