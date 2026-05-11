import React from 'react';
import { getSystemLogs, getLogStats } from '@/app/actions/system';
import { LogTable } from '@/components/features/backoffice/LogTable';
import { LogChart } from '@/components/features/backoffice/LogChart';

/**
 * System Logs Dashboard Page.
 * 
 * @description Provides a comprehensive view of system logs and health metrics.
 */
export default async function SystemLogsPage() {
  const { logs } = await getSystemLogs({ page: 1, pageSize: 100 });
  const stats = await getLogStats();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">System Logs</h1>
        <p className="text-gray-600 mt-2">Monitor application health, database operations, and client-side stability.</p>
      </header>

      <section>
        <LogChart data={stats} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 font-serif">Log Events</h2>
          <div className="text-xs text-gray-400 italic">Showing latest 100 entries</div>
        </div>
        <LogTable logs={logs} />
      </section>
    </div>
  );
}
