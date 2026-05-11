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
        subject: 'S', content: 'C'
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
  });
});
