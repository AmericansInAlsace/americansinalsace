import React from 'react';
import { SponsorshipService } from '@/services/SponsorshipService';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

/**
 * Public Sponsors Page.
 * Displays all active sponsors, ordered by their tier priority.
 */
export default async function SponsorsPage() {
  const t = await getTranslations('Sponsors');
  const sponsors = await SponsorshipService.getAllActiveSponsors();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Hero Section */}
      <section className="bg-[#3C3B6E] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
            {t.rich('title', {
              span: (chunks) => <span className="text-[#E30613]">{chunks}</span>
            })}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Sponsors Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {sponsors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">{t('noSponsors')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 relative flex-shrink-0 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden">
                        {sponsor.logoUrl ? (
                          <Image 
                            src={sponsor.logoUrl} 
                            alt={`${sponsor.companyName} logo`} 
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-300">
                            {sponsor.companyName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                          {sponsor.companyName}
                        </h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                          {t('sponsorBadge', { tier: sponsor.tierName || '' })}
                        </span>
                      </div>
                    </div>
                    
                    {sponsor.bio && (
                      <p className="text-gray-600 text-sm mb-6 flex-grow whitespace-pre-line">
                        {sponsor.bio}
                      </p>
                    )}

                    {sponsor.websiteUrl && (
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <a 
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E30613] font-bold text-sm hover:underline flex items-center gap-1"
                        >
                          {t('visitWebsite')} <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
