import { prisma } from '@/lib/db';
import { EventTable } from '@/components/features/backoffice/EventTable';
import EventActions from './EventActions';

/**
 * Backoffice Events Management Page.
 */
export default async function EventsAdminPage() {
  const events = await prisma.event.findMany({
    include: {
      category: true,
      _count: {
        select: { rsvps: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  const categories = await prisma.eventCategory.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Events Command Center</h1>
          <p className="text-gray-600 mt-2">Create, manage, and monitor community events and RSVPs.</p>
        </div>
        <EventActions mode="create" categories={categories.map(c => ({ id: c.id, name: c.name }))} />
      </header>

      <section>
        <EventTable 
          events={events} 
          categories={categories.map(c => ({ id: c.id, name: c.name }))} 
        />
      </section>
    </div>
  );
}

