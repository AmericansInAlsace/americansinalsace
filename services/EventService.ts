import { prisma } from '@/lib/db';

/**
 * EventService handles business logic related to community events.
 */
export class EventService {
  /**
   * Fetches the next upcoming published events.
   * @param {number} limit - The maximum number of events to return.
   * @returns {Promise<any[]>} A list of upcoming events with category and RSVP counts.
   */
  static async getUpcomingEvents(limit: number = 3) {
    const now = new Date();
    
    return await prisma.event.findMany({
      where: {
        published: true,
        date: {
          gte: now,
        },
      },
      include: {
        category: true,
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: limit,
    });
  }
}
