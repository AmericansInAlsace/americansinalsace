'use client';

import React from 'react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return '---';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Profile Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Role</label>
                <span className="text-sm font-semibold text-gray-900">{user.role?.name || 'N/A'}</span>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone</label>
                <span className="text-sm text-gray-900">{user.phone || '---'}</span>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Joined Date</label>
                <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Biography</label>
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  {user.bio || 'No biography provided.'}
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Section */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Active Subscription</h3>
            {user.subscription ? (
              <div className="border border-blue-100 bg-blue-50/30 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-blue-900">{user.subscription.tier.name}</div>
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-tighter mt-1">
                    Status: {user.subscription.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Renewal Date</div>
                  <div className="text-sm font-bold text-gray-900">{formatDate(user.subscription.endDate).split(',')[0]}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 italic">No active membership plan found.</p>
              </div>
            )}
          </section>

          {/* Activity Placeholder */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm text-gray-500 italic">
              <p>User account features being expanded. Transaction history and event RSVP logs will appear here in future updates.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
