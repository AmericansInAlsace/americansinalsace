import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MailService } from '@/services/MailService';
import { prisma } from '@/lib/db';
import nodemailer from 'nodemailer';

vi.mock('@/lib/db', () => ({
  prisma: {
    emailTemplate: {
      findUnique: vi.fn(),
    },
    emailLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/services/LoggerService', () => ({
  LoggerService: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: (args: any) => mockSendMail(args),
    }),
  },
}));

describe('MailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: '123' });
  });

  describe('sendVerificationEmail', () => {
    it('should successfully send a verification email', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        id: 1,
        slug: 'verification-email',
        subject: 'Verify your account',
        content: 'Click here: {{actionUrl}}',
      } as any);

      await MailService.sendVerificationEmail('test@example.com', 'token123');

      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({
        where: { slug: 'verification-email' },
      });
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Verify your account',
        html: expect.stringContaining('token123'),
      }));
      expect(prisma.emailLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCESS' }),
      }));
    });

    it('should throw error if template not found', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue(null);
      await expect(MailService.sendVerificationEmail('test@example.com', 'token'))
        .rejects.toThrow('Failed to send verification email.');
    });

    it('should log failure if sendMail fails', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        subject: 'Verification Email', content: 'C'
      } as any);
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(MailService.sendVerificationEmail('test@example.com', 'token'))
        .rejects.toThrow('Failed to send verification email.');

      expect(prisma.emailLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }));
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should successfully send a password reset email', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        id: 2,
        slug: 'reset-password',
        subject: 'Reset Password',
        content: 'Reset here: {{actionUrl}}',
      } as any);

      await MailService.sendPasswordResetEmail('test@example.com', 'reset-token');

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Reset Password',
        html: expect.stringContaining('reset-token'),
      }));
    });

    it('should log failure if sendMail fails for password reset', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        subject: 'Reset Password', content: 'C'
      } as any);
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(MailService.sendPasswordResetEmail('test@example.com', 'reset-token'))
        .rejects.toThrow('Failed to send reset password.');

      expect(prisma.emailLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }));
    });
  });

  describe('sendDataExportEmail', () => {
    it('should successfully send a data export email', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        id: 3,
        slug: 'data-export',
        subject: 'Data Export',
        content: 'Hi {{userName}}, your export.',
      } as any);

      await MailService.sendDataExportEmail('test@example.com', '{"data":"test"}');

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Data Export',
        html: expect.stringContaining('test'),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'my-data.json',
            content: '{"data":"test"}',
            contentType: 'application/json'
          })
        ])
      }));
      expect(prisma.emailLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCESS' }),
      }));
    });

    it('should throw error if template not found for data export', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue(null);
      await expect(MailService.sendDataExportEmail('test@example.com', 'data'))
        .rejects.toThrow('Failed to send data export email.');
    });

    it('should log failure if sendMail fails for data export', async () => {
      vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValue({
        subject: 'Data Export', content: 'C'
      } as any);
      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(MailService.sendDataExportEmail('test@example.com', 'data'))
        .rejects.toThrow('Failed to send data export email.');

      expect(prisma.emailLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }));
    });
  });
});
