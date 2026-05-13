import { describe, it, expect, beforeEach } from 'vitest';
import { EventService } from '@/services/EventService';
import { prisma } from '@/lib/db';
import { IntegrationTestHelper } from './IntegrationTestHelper';

describe('Integration: Event Service', () => {
  beforeEach(async () => {
    await IntegrationTestHelper.clearDatabase();
    await IntegrationTestHelper.seedBasicData();
  });

  it('should fetch upcoming events', async () => {
    const category = await prisma.eventCategory.create({
      data: { name: 'Social', description: 'Social events' }
    });

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    await prisma.event.createMany({
      data: [
        {
          title: 'Future Event',
          description: 'Desc',
          date: tomorrow,
          location: 'Loc',
          published: true,
          categoryId: category.id,
        },
        {
          title: 'Past Event',
          description: 'Desc',
          date: yesterday,
          location: 'Loc',
          published: true,
          categoryId: category.id,
        },
        {
          title: 'Unpublished Event',
          description: 'Desc',
          date: tomorrow,
          location: 'Loc',
          published: false,
          categoryId: category.id,
        }
      ]
    });

    const events = await EventService.getUpcomingEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Future Event');
    expect(events[0]._count.rsvps).toBe(0);
  });
});
