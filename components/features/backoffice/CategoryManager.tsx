'use client';

import React, { useState } from 'react';
import { createImprovementCategory, updateImprovementCategory, deleteImprovementCategory } from '@/app/actions/improvements';

interface CategoryManagerProps {
  initialCategories: { id: number; name: string }[];
}

/**
 * CategoryManager component for SUPERADMIN to manage improvement categories.
 */
export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createImprovementCategory(newCategory);
      setCategories([...categories, result.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategory('');
    } catch (error) {
      alert('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await updateImprovementCategory(id, editingName);
      setCategories(categories.map(c => c.id === id ? result.category : c).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingId(null);
    } catch (error) {
      alert('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setIsSubmitting(true);
    try {
      await deleteImprovementCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      alert('Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 font-serif">Manage Categories</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the sections of the site for improvements.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category Name (e.g., Membership, Events)"
            className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCategory.trim()}
            className="bg-[#3C3B6E] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
          >
            Add
          </button>
        </form>

        {/* List */}
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:text-gray-700 text-sm font-bold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditingName(cat.name);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-gray-400 italic">
                    No categories found. Add one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
