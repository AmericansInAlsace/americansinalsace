import React from 'react';
import { getSponsorships, getSponsorTiers } from '@/app/actions/sponsorship';
import SponsorshipManager from '@/components/features/backoffice/SponsorshipManager';

/**
 * Sponsorship Assignments Management Page.
 */
export default async function SponsorshipListPage() {
  const sponsorships = await getSponsorships();
  const tiers = await getSponsorTiers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Sponsorship Assignments</h1>
        <p className="text-gray-600 mt-2">Manage user sponsorship status and assignments.</p>
      </header>

      <div className="max-w-5xl">
        <SponsorshipManager initialSponsorships={sponsorships as any} tiers={tiers as any} />
      </div>
    </div>
  );
}
