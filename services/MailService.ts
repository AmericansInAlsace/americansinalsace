import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';
import { LoggerService } from './LoggerService';

/**
 * MailService handles all email communication for the application.
 * It uses Nodemailer and is configured to work with MailDev in development environments.
 */
export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    ignoreTLS: process.env.SMTP_SECURE !== 'true',
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
    let emailSubject = 'Verification Email';

    try {
      const { content, subject } = await this.getProcessedTemplate('verification-email', { actionUrl });
      emailSubject = subject;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Americans in Alsace'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@americansinalsace.fr'}>`,
        to: email,
        subject: emailSubject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, emailSubject, 'SUCCESS');
      console.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      await LoggerService.error('MAIL', `Failed to send ${emailSubject.toLowerCase()} to ${email}`, { error: error.message });
      await this.logEmail(email, emailSubject, 'FAILED', error.message);
      throw new Error(`Failed to send ${emailSubject.toLowerCase()}.`);
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
    let emailSubject = 'Password Reset Email';

    try {
      const { content, subject } = await this.getProcessedTemplate('reset-password', { actionUrl });
      emailSubject = subject;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Americans in Alsace'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@americansinalsace.fr'}>`,
        to: email,
        subject: emailSubject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, emailSubject, 'SUCCESS');
      console.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      await LoggerService.error('MAIL', `Failed to send ${emailSubject.toLowerCase()} to ${email}`, { error: error.message });
      await this.logEmail(email, emailSubject, 'FAILED', error.message);
      throw new Error(`Failed to send ${emailSubject.toLowerCase()}.`);
    }
  }

  /**
   * Sends a data export email with a JSON attachment.
   * @param {string} email - The recipient's email address.
   * @param {string} jsonData - The JSON string to be attached.
   * @returns {Promise<void>}
   */
  static async sendDataExportEmail(email: string, jsonData: string) {
    try {
      const { content, subject } = await this.getProcessedTemplate('data-export', { 
        userName: email.split('@')[0] 
      });

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Americans in Alsace'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@americansinalsace.fr'}>`,
        to: email,
        subject,
        html: content,
        attachments: [
          {
            filename: 'my-data.json',
            content: jsonData,
            contentType: 'application/json'
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, subject, 'SUCCESS');
      console.log(`Data export email sent to ${email}`);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      await LoggerService.error('MAIL', `Failed to send data export to ${email}`, { error: errorMsg });
      await this.logEmail(email, 'Data Export', 'FAILED', errorMsg);
      throw new Error('Failed to send data export email.');
    }
  }

  /**
   * Sends an event RSVP confirmation email.
   * @param {string} email - The recipient's email address.
   * @param {string} userName - The name of the user.
   * @param {object} eventDetails - Details of the event.
   * @returns {Promise<void>}
   */
  static async sendEventRSVPConfirmation(email: string, userName: string, eventDetails: { title: string; date: Date | string; location: string }) {
    try {
      const { content, subject } = await this.getProcessedTemplate('event-rsvp-confirmation', {
        userName,
        eventTitle: eventDetails.title,
        eventDate: new Date(eventDetails.date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
        eventLocation: eventDetails.location,
      });

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Americans in Alsace'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@americansinalsace.fr'}>`,
        to: email,
        subject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, subject, 'SUCCESS');
      console.log(`RSVP confirmation sent to ${email} for event ${eventDetails.title}`);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      await LoggerService.error('MAIL', `Failed to send RSVP confirmation to ${email}`, { error: errorMsg });
      await this.logEmail(email, 'RSVP Confirmation', 'FAILED', errorMsg);
      // We don't throw here to avoid failing the RSVP process if email fails
    }
  }

  /**
   * Sends an event reminder email.
   * @param {string} email - The recipient's email address.
   * @param {string} userName - The name of the user.
   * @param {object} eventDetails - Details of the event.
   * @returns {Promise<void>}
   */
  static async sendEventReminder(email: string, userName: string, eventDetails: { title: string; date: Date | string; location: string }) {
    try {
      const { content, subject } = await this.getProcessedTemplate('event-reminder', {
        userName,
        eventTitle: eventDetails.title,
        eventDate: new Date(eventDetails.date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
        eventLocation: eventDetails.location,
      });

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Americans in Alsace'}" <${process.env.MAIL_FROM_ADDRESS || 'no-reply@americansinalsace.fr'}>`,
        to: email,
        subject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      await this.logEmail(email, subject, 'SUCCESS');
      console.log(`Event reminder sent to ${email} for event ${eventDetails.title}`);
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      await LoggerService.error('MAIL', `Failed to send event reminder to ${email}`, { error: errorMsg });
      await this.logEmail(email, 'Event Reminder', 'FAILED', errorMsg);
    }
  }
}
