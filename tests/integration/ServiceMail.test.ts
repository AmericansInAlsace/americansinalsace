import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MailService } from '@/services/MailService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import nodemailer from 'nodemailer';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
  },
}));

describe('MailService Integration', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    
    // Seed required templates
    await prisma.emailTemplate.createMany({
        data: [
            {
                slug: 'verification-email',
                name: 'Verification Email',
                subject: 'Verify your account',
                content: 'Hello, please verify your account at {{actionUrl}}',
            },
            {
                slug: 'reset-password',
                name: 'Reset Password',
                subject: 'Reset your password',
                content: 'Reset your password here: {{actionUrl}}',
            },
            {
                slug: 'data-export',
                name: 'Data Export',
                subject: 'Your data export',
                content: 'Hi {{userName}}, your data is attached.',
            },
            {
                slug: 'event-rsvp-confirmation',
                name: 'RSVP Confirmation',
                subject: 'RSVP Confirmation: {{eventTitle}}',
                content: 'Hi {{userName}}, confirmed for {{eventTitle}} on {{eventDate}} at {{eventLocation}}.',
            },
            {
                slug: 'event-reminder',
                name: 'Event Reminder',
                subject: 'Reminder: {{eventTitle}}',
                content: 'Hi {{userName}}, don\'t forget {{eventTitle}}!',
            }
        ]
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send verification email', async () => {
    await MailService.sendVerificationEmail('test@example.com', 'token123');
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('SUCCESS');
    expect(logs[0].subject).toBe('Verify your account');
  });

  it('should send password reset email', async () => {
    await MailService.sendPasswordResetEmail('test@example.com', 'token456');
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('SUCCESS');
    expect(logs[0].subject).toBe('Reset your password');
  });

  it('should send data export email', async () => {
    await MailService.sendDataExportEmail('test@example.com', '{"data": "test"}');
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('SUCCESS');
  });

  it('should send event RSVP confirmation', async () => {
    await MailService.sendEventRSVPConfirmation('test@example.com', 'John Doe', {
        title: 'Christmas Party',
        date: new Date(),
        location: 'Strasbourg'
    });
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('SUCCESS');
  });

  it('should send event reminder', async () => {
    await MailService.sendEventReminder('test@example.com', 'John Doe', {
        title: 'Board Meeting',
        date: new Date(),
        location: 'Office'
    });
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('SUCCESS');
  });

  it('should log failure if template not found', async () => {
    // verification-email is already seeded, let's try to delete it
    await prisma.emailTemplate.delete({ where: { slug: 'verification-email' } });

    await expect(MailService.sendVerificationEmail('test@example.com', 'token123')).rejects.toThrow();
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('FAILED');
  });

  it('should log failure if transporter fails', async () => {
    const mockTransporter = nodemailer.createTransport({});
    vi.spyOn(mockTransporter, 'sendMail').mockRejectedValue(new Error('SMTP Error'));
    
    // We need to re-mock createTransport to return this failing transporter
    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter);

    await expect(MailService.sendVerificationEmail('test@example.com', 'token123')).rejects.toThrow();
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('FAILED');
  });

  it('should log failure if RSVP confirmation fails', async () => {
    vi.spyOn(MailService as any, 'getProcessedTemplate').mockRejectedValueOnce(new Error('Template Error'));
    
    await MailService.sendEventRSVPConfirmation('test@example.com', 'John Doe', {
        title: 'Error Party',
        date: new Date(),
        location: 'Nowhere'
    });
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com', subject: 'RSVP Confirmation' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('FAILED');
  });

  it('should log failure if event reminder fails', async () => {
    vi.spyOn(MailService as any, 'getProcessedTemplate').mockRejectedValueOnce(new Error('Template Error'));
    
    await MailService.sendEventReminder('test@example.com', 'John Doe', {
        title: 'Error Meeting',
        date: new Date(),
        location: 'Nowhere'
    });
    
    const logs = await prisma.emailLog.findMany({ where: { recipient: 'test@example.com', subject: 'Event Reminder' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('FAILED');
  });
});
