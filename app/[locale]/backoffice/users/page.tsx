import { prisma } from '@/lib/db';
import { UserTable } from '@/components/features/backoffice/UserTable';

/**
 * Backoffice Users Administration Page.
 */
export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({
    include: {
      role: true,
      subscription: {
        include: {
          tier: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  });

  const tiers = await prisma.membershipTier.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">User Management</h1>
        <p className="text-gray-600 mt-2">Oversee all registered members, their roles, and subscription status.</p>
      </header>

      <section>
        <UserTable users={users} roles={roles} tiers={tiers} />
      </section>
    </div>
  );
}

