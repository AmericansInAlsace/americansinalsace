import { getImprovementCategories } from '@/app/actions/improvements';
import ImprovementForm from '@/components/features/backoffice/ImprovementForm';
import React from 'react';

/**
 * Improvements Page for reporting issues or suggestions.
 */
export default async function ImprovementsPage() {
  const categories = await getImprovementCategories();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Site Improvements</h1>
        <p className="text-gray-600 mt-2">Help us improve the AIA platform by reporting issues or suggesting features.</p>
      </header>

      <div className="max-w-4xl">
        <ImprovementForm categories={categories} />
      </div>
    </div>
  );
}
