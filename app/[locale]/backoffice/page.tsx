import { prisma } from '@/lib/db';
import { Link } from '@/i18n/routing';

/**
 * Backoffice Dashboard Page.
 */
export default async function DashboardPage() {
  const userCount = await prisma.user.count();
  const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
  const pendingSubscriptions = await prisma.subscription.count({ where: { status: 'PENDING' } });
  
  const stats = [
    { name: 'Total Registered Users', value: userCount, icon: '👥', color: 'bg-blue-500' },
    { name: 'Active Members', value: activeSubscriptions, icon: '✅', color: 'bg-green-500' },
    { name: 'Pending Payments', value: pendingSubscriptions, icon: '⏳', color: 'bg-yellow-500' },
    { name: 'Active Tiers', value: await prisma.membershipTier.count({ where: { active: true } }), icon: '💎', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Administration Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of community growth and membership status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} text-white rounded-lg flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/backoffice/membership/tiers"
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-primary-blue)] hover:bg-blue-50 transition-all text-gray-600 hover:text-[var(--color-primary-blue)]"
          >
            <span className="text-3xl mb-2">💎</span>
            <span className="font-bold">Membership Tiers</span>
          </Link>
          <Link 
            href="/backoffice/membership/list"
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-primary-blue)] hover:bg-blue-50 transition-all text-gray-600 hover:text-[var(--color-primary-blue)]"
          >
            <span className="text-3xl mb-2">💳</span>
            <span className="font-bold">Active Memberships</span>
          </Link>
          <Link 
            href="/backoffice/users"
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-primary-blue)] hover:bg-blue-50 transition-all text-gray-600 hover:text-[var(--color-primary-blue)]"
          >
            <span className="text-3xl mb-2">👥</span>
            <span className="font-bold">Manage Users</span>
          </Link>
          <Link 
            href="/backoffice/communications/templates"
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[var(--color-primary-blue)] hover:bg-blue-50 transition-all text-gray-600 hover:text-[var(--color-primary-blue)]"
          >
            <span className="text-3xl mb-2">✉️</span>
            <span className="font-bold">Email Templates</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
