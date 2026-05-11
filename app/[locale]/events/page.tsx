import { prisma } from '@/lib/db';
import Link from 'next/link';

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

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
            <div key={event.id} className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-[var(--color-primary-blue)] text-[10px] font-bold uppercase tracking-widest rounded">
                    {event.category.name}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[var(--color-primary-red)]">{formatDate(event.date)}</div>
                    <div className="text-xs text-gray-500">{formatTime(event.date)}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 font-serif text-[var(--color-text-main)]">{event.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>📍</span> {event.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>👥</span> {event._count.rsvps} / {event.capacity || 'Unlimited'} attending
                </div>
              </div>
              <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 flex justify-between items-center">
                <div>
                  <span className="text-sm font-bold text-[var(--color-primary-blue)]">{event.memberPrice === 0 ? 'FREE' : `${event.memberPrice}€`}</span>
                  <span className="text-[10px] text-gray-400 ml-1">for members</span>
                </div>
                <Link 
                  href={`/events/${event.id}`}
                  className="text-sm font-bold text-[var(--color-primary-red)] hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
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
