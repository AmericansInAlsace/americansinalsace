import { prisma } from '@/lib/db';
import { MembershipTable } from '@/components/features/backoffice/MembershipTable';

/**
 * Backoffice Memberships Listing Page.
 * 
 * @description Manages individual user subscriptions.
 */
export default async function MembershipsListPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
      tier: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const availableTiers = await prisma.membershipTier.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Active Memberships</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all active and pending community subscriptions.</p>
      </header>

      <section>
        <MembershipTable 
          subscriptions={subscriptions} 
          availableTiers={availableTiers.map(t => ({ id: t.id, name: t.name }))} 
        />
      </section>
    </div>
  );
}

