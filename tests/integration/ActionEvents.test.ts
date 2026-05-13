import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rsvpToEvent } from '@/app/actions/events';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';
import { getServerSession } from 'next-auth';
import { MailService } from '@/services/MailService';
import { revalidatePath } from 'next/cache';

vi.mock('next-auth');
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/services/MailService', () => ({
  MailService: {
    sendEventRSVPConfirmation: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Integration: Event Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should successfully RSVP a user to an event', async () => {
    const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);

    // Create a category and event
    const category = await prisma.eventCategory.create({ data: { name: 'Test' } });
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'Desc',
        location: 'Local',
        date: new Date(),
        categoryId: category.id,
        capacity: 10,
      }
    });

    const result = await rsvpToEvent(event.id);
    expect(result.success).toBe(true);

    // Verify DB
    const rsvp = await prisma.rSVP.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: event.id } }
    });
    expect(rsvp).toBeDefined();
    expect(rsvp?.status).toBe('CONFIRMED');

    expect(MailService.sendEventRSVPConfirmation).toHaveBeenCalled();
  });

  it('should fail if event is full', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);

    const category = await prisma.eventCategory.create({ data: { name: 'Test' } });
    const event = await prisma.event.create({
      data: {
        title: 'Full Event',
        description: 'Desc',
        location: 'Local',
        date: new Date(),
        categoryId: category.id,
        capacity: 0, // FULL
      }
    });

    await expect(rsvpToEvent(event.id)).rejects.toThrow('This event is full.');
  });

  it('should fail if user is not logged in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(rsvpToEvent(1)).rejects.toThrow('You must be logged in to RSVP.');
  });

  it('should fail if user is not found in db', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'notindb@example.com' } } as any);
    await expect(rsvpToEvent(1)).rejects.toThrow('User not found.');
  });

  it('should fail if event is not found', async () => {
    await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
    await expect(rsvpToEvent(9999)).rejects.toThrow('Event not found.');
  });

  it('should handle db error gracefully', async () => {
    const user = await IntegrationTestHelper.seedTestUser(1, 'test@example.com');
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);

    const category = await prisma.eventCategory.create({ data: { name: 'Test' } });
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        description: 'Desc',
        location: 'Local',
        date: new Date(),
        categoryId: category.id,
      }
    });

    vi.spyOn(prisma.rSVP, 'upsert').mockRejectedValueOnce(new Error('DB Error'));

    await expect(rsvpToEvent(event.id)).rejects.toThrow('DB Error');
  });
});
