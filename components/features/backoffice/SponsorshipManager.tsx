'use client';

import React, { useState, useEffect } from 'react';
import { getSponsorships, updateSponsorshipStatus, createSponsorshipAction, searchUsersForSponsorship, updateSponsorshipAction } from '@/app/actions/sponsorship';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';

interface Sponsorship {
  id: number;
  userId: number;
  tierId: number;
  startDate: Date;
  endDate: Date;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tier: {
    name: string;
  };
}

interface SponsorshipManagerProps {
  initialSponsorships: Sponsorship[];
  tiers: { id: number; name: string }[];
}

export default function SponsorshipManager({ initialSponsorships, tiers }: SponsorshipManagerProps) {
  const [sponsorships, setSponsorships] = useState(initialSponsorships);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsorship, setEditingSponsorship] = useState<Sponsorship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(tiers[0]?.id || 0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const results = await searchUsersForSponsorship(searchQuery);
        setSearchUsers(results);
      } else {
        setSearchUsers([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingSponsorship(null);
    setSelectedUser(null);
    setSelectedTier(tiers[0]?.id || 0);
    setStartDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Sponsorship) => {
    setEditingSponsorship(s);
    setSelectedUser(s.user);
    setSelectedTier(s.tierId);
    setStartDate(new Date(s.startDate).toISOString().split('T')[0]);
    setStatus(s.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      if (editingSponsorship) {
        await updateSponsorshipAction(editingSponsorship.id, {
          tierId: selectedTier,
          startDate,
          status,
        });
      } else {
        await createSponsorshipAction(selectedUser.id, selectedTier, startDate);
      }
      const updated = await getSponsorships();
      setSponsorships(updated as any);
      setIsModalOpen(false);
    } catch (error) {
      alert('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateSponsorshipStatus(id, status);
      const updated = await getSponsorships();
      setSponsorships(updated as any);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const columns: Column<Sponsorship>[] = [
    {
      header: 'User',
      accessorKey: 'user.email',
      cell: (s) => (
        <div>
          <div className="font-bold text-gray-900">{s.user.firstName} {s.user.lastName}</div>
          <div className="text-xs text-gray-500">{s.user.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Tier',
      accessorKey: 'tier.name',
      cell: (s) => <span className="font-medium text-gray-700">{s.tier.name}</span>,
      sortable: true,
    },
    {
      header: 'Period',
      cell: (s) => (
        <span className="text-gray-600">
          {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (s) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
          s.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {s.status}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (s) => (
        <div className="space-x-2">
          {s.status === 'ACTIVE' ? (
            <button 
              onClick={() => handleStatusChange(s.id, 'CANCELLED')}
              className="text-orange-600 hover:text-orange-800 text-xs font-bold"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={() => handleStatusChange(s.id, 'ACTIVE')}
              className="text-green-600 hover:text-green-800 text-xs font-bold"
            >
              Reactivate
            </button>
          )}
          <button 
            onClick={() => handleOpenEdit(s)}
            className="text-blue-600 hover:text-blue-800 text-xs font-bold"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      id: 'status',
      label: 'All Statuses',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
    },
    {
      id: 'tierId',
      label: 'All Tiers',
      type: 'select',
      options: tiers.map(t => ({ label: t.name, value: String(t.id) })),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Sponsorship Assignments</h2>
        <button
          onClick={handleOpenCreate}
          className="bg-[#E30613] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 transition-colors"
        >
          + Assign Sponsor
        </button>
      </div>

      <DataTable 
        data={sponsorships} 
        columns={columns} 
        filters={filters}
        searchPlaceholder="Search sponsor name or email..."
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {editingSponsorship ? 'Edit Sponsorship' : 'Assign New Sponsor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* User Search (Disabled if editing) */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1">User</label>
                {selectedUser ? (
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${editingSponsorship ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{selectedUser.firstName} {selectedUser.lastName}</div>
                      <div className="text-xs text-gray-500">{selectedUser.email}</div>
                    </div>
                    {!editingSponsorship && (
                      <button onClick={() => setSelectedUser(null)} className="text-blue-500 hover:text-blue-700">✕</button>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Name or email..."
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                        {searchResults.map(user => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-0 transition-colors"
                          >
                            <div className="font-bold text-sm text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Sponsor Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {tiers.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {editingSponsorship && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                  >
                    <option value="ACTIVE" className="text-green-600">ACTIVE</option>
                    <option value="CANCELLED" className="text-orange-600">CANCELLED</option>
                    <option value="EXPIRED" className="text-red-600">EXPIRED</option>
                  </select>
                </div>
              )}

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
                  disabled={isSubmitting || !selectedUser}
                  className="bg-[#3C3B6E] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Processing...' : (editingSponsorship ? 'Save Changes' : 'Confirm Assignment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
