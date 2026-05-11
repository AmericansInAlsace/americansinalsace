import { prisma } from '@/lib/db';
import { EventCard } from '@/components/ui/EventCard';

/**
 * Public Events Listing Page.
 */
export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    include: {
      category: true,
      _count: {
        select: { rsvps: true },
      },
    },
    orderBy: { date: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-main)] font-serif mb-4">
            Community Events
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Join us for social meetups, cultural tours, and annual celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event as any} />
          ))}

          {events.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-xl text-gray-400 italic font-serif">No upcoming events scheduled at the moment.</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon for new activities!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
