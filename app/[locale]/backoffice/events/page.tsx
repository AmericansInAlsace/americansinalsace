import { prisma } from '@/lib/db';
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Events Command Center</h1>
          <p className="text-gray-600 mt-2">Create, manage, and monitor community events and RSVPs.</p>
        </div>
        <EventActions mode="create" categories={categories.map(c => ({ id: c.id, name: c.name }))} />
      </header>

      <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-gray-900">{event.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tight">{formatDate(event.date)}</div>
                      <div className="text-[10px] text-gray-500 italic truncate max-w-[300px]">{event.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                      {event.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-bold text-gray-900">{event._count.rsvps}</span>
                    <span className="text-gray-400"> / {event.capacity || '∞'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[10px] leading-tight">
                       <div><span className="text-gray-400">Member:</span> <span className="font-bold text-green-700">€{event.memberPrice}</span></div>
                       <div><span className="text-gray-400">Guest:</span> <span className="font-bold text-blue-700">€{event.nonMemberPrice}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      event.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.published ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <EventActions 
                      mode="row" 
                      event={event} 
                      categories={categories.map(c => ({ id: c.id, name: c.name }))} 
                    />
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No events found. Start by creating one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
