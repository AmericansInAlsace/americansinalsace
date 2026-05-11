import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rsvpToEvent } from '@/app/actions/events';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { MailService } from '@/services/MailService';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    event: {
      findUnique: vi.fn(),
    },
    rSVP: {
      count: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('next-auth');
vi.mock('@/services/MailService');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('rsvpToEvent server action', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully RSVP a user and send a confirmation email', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
    } as any);

    vi.mocked(prisma.event.findUnique).mockResolvedValue({
      id: 101,
      title: 'Summer BBQ',
      date: new Date('2026-07-04T12:00:00Z'),
      location: 'Parc de l\'Orangerie',
      capacity: 50,
    } as any);

    vi.mocked(prisma.rSVP.count).mockResolvedValue(10);
    vi.mocked(prisma.rSVP.upsert).mockResolvedValue({ id: 1 } as any);

    const result = await rsvpToEvent(101);

    expect(result.success).toBe(true);
    expect(prisma.rSVP.upsert).toHaveBeenCalled();
    expect(MailService.sendEventRSVPConfirmation).toHaveBeenCalledWith(
      'test@example.com',
      'John Doe',
      expect.objectContaining({
        title: 'Summer BBQ',
        location: 'Parc de l\'Orangerie',
      })
    );
  });

  it('should throw error if event is full', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'test@example.com' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1 } as any);
    vi.mocked(prisma.event.findUnique).mockResolvedValue({
      id: 101,
      capacity: 10,
    } as any);

    vi.mocked(prisma.rSVP.count).mockResolvedValue(10);

    await expect(rsvpToEvent(101)).rejects.toThrow('This event is full.');
  });

  it('should throw error if not logged in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    await expect(rsvpToEvent(101)).rejects.toThrow('You must be logged in to RSVP.');
  });
});
