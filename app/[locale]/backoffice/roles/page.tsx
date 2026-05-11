import { prisma } from '@/lib/db';

/**
 * Backoffice Roles Administration Page.
 * 
 * @description Allows administrators to view and manage roles and permissions.
 */
export default async function RolesAdminPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: {
        select: { users: true },
      },
    },
  });

  const permissions = await prisma.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' },
    ],
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Roles & Permissions</h1>
        <p className="text-gray-600 mt-2">Manage system roles and their granular access levels.</p>
      </header>

      <div className="grid grid-cols-1 gap-10">
          {/* Roles Table */}
          <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Defined Roles</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--color-primary-blue)]">{role.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{role._count.users}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((p) => (
                            <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {p.resource}:{p.action}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Master Permissions List */}
          <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Master Permission Matrix</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {permissions.map((p) => (
                  <div key={p.id} className="p-3 border rounded-lg bg-gray-50 flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase">{p.action}</span>
                    <span className="text-sm font-medium text-gray-900">{p.resource}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
    </div>
  );
}
