'use client';

import React from 'react';
import BugReportForm from '@/components/features/BugReportForm';
import { Link } from '@/i18n/routing';

interface ReportBugPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Public page for reporting website bugs.
 * Accessible to all users, whether logged in or not.
 */
export default function ReportBugPage({ params }: ReportBugPageProps) {
  const { locale } = React.use(params);

  const [successKey, setSuccessKey] = React.useState<string | null>(null);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--color-background)] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-main)] font-serif mb-4">
            Help Us Improve
          </h1>
          <div className="w-24 h-1 bg-[var(--color-primary-red)] mx-auto mb-6"></div>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Our community platform is built by members, for members. If you find a technical issue, please let us know so we can fix it.
          </p>
        </div>

        {successKey ? (
          <div className="max-w-2xl mx-auto bg-green-50 border border-green-100 p-8 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Thank You!</h2>
            <p className="text-gray-600">Your bug report has been submitted successfully.</p>
            <div className="bg-white py-2 px-4 rounded-lg font-mono text-sm text-[var(--color-primary-blue)] font-bold inline-block border border-green-200">
              JIRA Ticket: {successKey}
            </div>
            <div className="pt-4">
              <Link href="/" className="text-[var(--color-primary-blue)] font-bold hover:underline">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <BugReportForm onSuccess={(key) => setSuccessKey(key)} />
        )}
      </div>
    </main>
  );
}
