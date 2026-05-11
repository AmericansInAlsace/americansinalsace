'use client';

import React, { useState, useTransition } from 'react';
import { updateSubscriptionStatus, updateSubscriptionTier } from '@/app/actions/backoffice';

interface MembershipActionsProps {
  subscriptionId: number;
  currentStatus: string;
  currentTierId: number;
  availableTiers: { id: number; name: string }[];
}

export default function MembershipActions({ 
  subscriptionId, 
  currentStatus, 
  currentTierId,
  availableTiers 
}: MembershipActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState(currentTierId);

  const handleStatusChange = (newStatus: string) => {
    const actionName = newStatus === 'ACTIVE' ? 'activate' : (newStatus === 'CANCELLED' ? 'cancel' : 'expire');
    if (!confirm(`Are you sure you want to ${actionName} this membership?`)) return;
    
    startTransition(async () => {
      try {
        await updateSubscriptionStatus(subscriptionId, newStatus);
      } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update status. Please check permissions.');
      }
    });
  };

  const handleTierUpdate = () => {
    if (selectedTierId === currentTierId) {
      setIsEditModalOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateSubscriptionTier(subscriptionId, selectedTierId);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Failed to update tier:', error);
        alert('Failed to update tier.');
      }
    });
  };

  return (
    <div className="flex justify-end gap-3 items-center">
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
      >
        Edit
      </button>

      <div className="h-4 w-px bg-gray-200 mx-1"></div>

      {currentStatus !== 'ACTIVE' ? (
        <button
          onClick={() => handleStatusChange('ACTIVE')}
          disabled={isPending}
          className="text-green-600 hover:text-green-900 font-medium text-sm disabled:opacity-50"
        >
          Activate
        </button>
      ) : (
        <button
          onClick={() => handleStatusChange('EXPIRED')}
          disabled={isPending}
          className="text-yellow-600 hover:text-yellow-900 font-medium text-sm disabled:opacity-50"
        >
          Expire
        </button>
      )}
      
      <button
        onClick={() => handleStatusChange('CANCELLED')}
        disabled={isPending || currentStatus === 'CANCELLED'}
        className="text-red-600 hover:text-red-900 font-medium text-sm disabled:opacity-50"
      >
        Cancel
      </button>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-left">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Edit Membership</h2>
            
            <div className="mb-6">
              <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-2">
                Membership Tier
              </label>
              <select
                id="tier"
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {availableTiers.map(tier => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTierUpdate}
                disabled={isPending}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md disabled:opacity-50"
              >
                {isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
