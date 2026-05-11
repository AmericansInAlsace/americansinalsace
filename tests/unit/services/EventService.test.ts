import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '@/services/EventService';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    event: {
      findMany: vi.fn(),
    },
  },
}));

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('should fetch upcoming published events', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', date: new Date(Date.now() + 10000) },
        { id: 2, title: 'Event 2', date: new Date(Date.now() + 20000) },
      ];

      vi.mocked(prisma.event.findMany).mockResolvedValue(mockEvents as any);

      const result = await EventService.getUpcomingEvents(2);

      expect(result).toEqual(mockEvents);
      expect(prisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          date: { gte: expect.any(Date) },
        }),
        take: 2,
        orderBy: { date: 'asc' },
      }));
    });

    it('should return empty array if no events found', async () => {
      vi.mocked(prisma.event.findMany).mockResolvedValue([]);

      const result = await EventService.getUpcomingEvents();

      expect(result).toEqual([]);
    });
  });
});
