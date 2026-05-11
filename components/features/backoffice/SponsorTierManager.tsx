'use client';

import React, { useState } from 'react';
import { createSponsorTier, updateSponsorTier, deleteSponsorTier } from '@/app/actions/sponsorship';

interface SponsorTier {
  id: number;
  name: string;
  description: string | null;
  price: number;
  priority: number;
  active: boolean;
}

interface SponsorTierManagerProps {
  initialTiers: SponsorTier[];
}

export default function SponsorTierManager({ initialTiers }: SponsorTierManagerProps) {
  const [tiers, setTiers] = useState(initialTiers);
  const [editingTier, setEditingTier] = useState<SponsorTier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    priority: 0,
  });

  const handleOpenCreate = () => {
    setEditingTier(null);
    setFormData({ name: '', description: '', price: 0, priority: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tier: SponsorTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      description: tier.description || '',
      price: tier.price,
      priority: tier.priority,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTier) {
        const result = await updateSponsorTier(editingTier.id, formData);
        setTiers(tiers.map(t => t.id === editingTier.id ? result.tier as any : t).sort((a, b) => b.priority - a.priority));
      } else {
        const result = await createSponsorTier(formData);
        setTiers([...tiers, result.tier as any].sort((a, b) => b.priority - a.priority));
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Failed to save tier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This will not affect existing sponsorships but will prevent new ones for this tier.')) return;
    try {
      await deleteSponsorTier(id);
      setTiers(tiers.filter(t => t.id !== id));
    } catch (error) {
      alert('Failed to delete tier');
    }
  };

  const toggleActive = async (tier: SponsorTier) => {
    try {
      const result = await updateSponsorTier(tier.id, { 
        name: tier.name,
        description: tier.description || undefined,
        price: tier.price,
        priority: tier.priority,
        active: !tier.active 
      });
      setTiers(tiers.map(t => t.id === tier.id ? result.tier as any : t));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Sponsor Tiers</h2>
        <button
          onClick={handleOpenCreate}
          className="bg-[#E30613] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition-colors"
        >
          + Add New Tier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tiers.map((tier) => (
              <tr key={tier.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{tier.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{tier.description}</div>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-gray-600">
                  €{tier.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-600">{tier.priority}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(tier)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      tier.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tier.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleOpenEdit(tier)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Edit</button>
                  <button onClick={() => handleDelete(tier.id)} className="text-red-600 hover:text-red-800 text-sm font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {editingTier ? 'Edit Sponsor Tier' : 'New Sponsor Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tier Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Gold Sponsor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-bold text-gray-700">Priority</label>
                  </div>
                  <input
                    type="number"
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 italic">Higher number = Displayed first</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3C3B6E] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
