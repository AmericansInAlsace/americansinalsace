import React from 'react';
import HomePageClient from './HomePageClient';
import UpcomingEventsSection from '@/components/features/home/UpcomingEventsSection';

export const dynamic = 'force-dynamic';

/**
 * The homepage Server Component.
 * Fetches the upcoming events section (which is also a Server Component)
 * and passes it to the client-side wrapper.
 */
export default async function HomePage() {
  return (
    <HomePageClient 
      upcomingEventsSection={<UpcomingEventsSection />} 
    />
  );
}
