import { getImprovementCategories } from '@/app/actions/improvements';
import CategoryManager from '@/components/features/backoffice/CategoryManager';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

/**
 * Categories Page for managing improvement categories.
 * Restricted to SUPERADMIN.
 */
export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  
  // Extra safety check at page level
  if (session?.user?.role !== 'SUPERADMIN') {
    redirect('/backoffice/improvements');
  }

  const categories = await getImprovementCategories();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Improvement Categories</h1>
        <p className="text-gray-600 mt-2">Manage the categories available in the improvement form.</p>
      </header>

      <div className="max-w-4xl">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  );
}
