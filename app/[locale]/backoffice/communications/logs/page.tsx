import { prisma } from '@/lib/db';
import { EmailLogTable } from '@/components/features/backoffice/EmailLogTable';

/**
 * Backoffice Email Delivery Logs Page.
 */
export default async function EmailLogsPage() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 500, // Increased limit for better history
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Delivery Logs</h1>
        <p className="text-gray-600 mt-2">Monitor all system-generated email transactions and delivery status.</p>
      </header>

      <section>
        <EmailLogTable logs={logs} />
      </section>
    </div>
  );
}

