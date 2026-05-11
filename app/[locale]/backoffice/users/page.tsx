import { prisma } from '@/lib/db';
import { UserRoleSelector } from '@/components/features/backoffice/UserRoleSelector';
import UserActions from './UserActions';

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

  const formatDate = (date: Date | null) => {
    if (!date) return '---';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">User Management</h1>
        <p className="text-gray-600 mt-2">Oversee all registered members, their roles, and subscription status.</p>
      </header>

      <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserRoleSelector 
                      userId={user.id} 
                      currentRoleId={user.roleId} 
                      roles={roles} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-blue-700">{user.subscription.tier.name}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{user.subscription.status}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No Active Plan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
