import { prisma } from '@/lib/db';

/**
 * Backoffice Event Categories Management Page.
 */
export default async function EventCategoriesAdminPage() {
  const categories = await prisma.eventCategory.findMany({
    include: {
      _count: {
        select: { events: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Event Categories</h1>
          <p className="text-gray-600 mt-2">Manage the different types of events offered to the community.</p>
        </div>
        <button className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90">
          + Add Category
        </button>
      </header>

      <section className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--color-primary-blue)]">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {category.description || <span className="text-gray-400 italic">No description</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {category._count.events}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
