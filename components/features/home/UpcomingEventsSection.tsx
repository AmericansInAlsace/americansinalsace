import React from 'react';
import { EventService } from '@/services/EventService';
import { EventCard } from '@/components/ui/EventCard';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

/**
 * Server Component that fetches and displays the next upcoming events on the homepage.
 */
export default async function UpcomingEventsSection() {
  const events = await EventService.getUpcomingEvents(3);
  const t = await getTranslations('HomePage');

  if (events.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-[var(--color-border)] shadow-sm">
        <p className="text-[var(--color-text-muted)] italic text-center py-8">
          {t('noEvents')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event as any} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Link 
          href="/events"
          className="inline-flex items-center px-6 py-3 border border-[var(--color-primary-blue)] text-[var(--color-primary-blue)] font-bold rounded-md hover:bg-blue-50 transition-colors"
        >
          {t('viewAllEvents')} &rarr;
        </Link>
      </div>
    </div>
  );
}
