import { prisma } from '@/lib/db';
import { MembershipService } from '@/services/MembershipService';
import { formatCurrency } from '@/lib/formatters';

/**
 * Backoffice Membership Tiers Configuration Page.
 */
export default async function TiersAdminPage() {
  const tiers = await MembershipService.getActiveTiers();

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Membership Tiers</h1>
          <p className="text-gray-600 mt-2">Configure membership pricing, descriptions, and PayPal plan links.</p>
        </div>
        <button className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90">
          + Add New Tier
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PayPal Plan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiers.map((tier) => (
                <tr key={tier.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{tier.name}</div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">{tier.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[var(--color-primary-blue)]">
                    {formatCurrency(tier.price)} / yr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {tier.paypalPlanId || '---'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tier.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tier.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex gap-4">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Integration Tip</p>
            <p>Ensure that the <strong>PayPal Plan ID</strong> matches the one configured in your PayPal Developer Dashboard. Updates here will reflect immediately on the public membership selection page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
