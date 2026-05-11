import React from 'react';
import { getSponsorTiers } from '@/app/actions/sponsorship';
import SponsorTierManager from '@/components/features/backoffice/SponsorTierManager';

/**
 * Sponsor Tiers Management Page.
 */
export default async function SponsorTiersPage() {
  const tiers = await getSponsorTiers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Sponsor Tiers</h1>
        <p className="text-gray-600 mt-2">Define sponsorship levels and their associated benefits.</p>
      </header>

      <div className="max-w-5xl">
        <SponsorTierManager initialTiers={tiers as any} />
      </div>
    </div>
  );
}
