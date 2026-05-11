'use client';

import React, { useState } from 'react';
import { updateSponsorProfileAction } from '@/app/actions/sponsorship';

interface SponsorProfile {
  companyName: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  bio: string | null;
}

interface SponsorProfileFormProps {
  initialProfile: SponsorProfile | null;
}

export default function SponsorProfileForm({ initialProfile }: SponsorProfileFormProps) {
  const [formData, setFormData] = useState({
    companyName: initialProfile?.companyName || '',
    websiteUrl: initialProfile?.websiteUrl || '',
    logoUrl: initialProfile?.logoUrl || '',
    bio: initialProfile?.bio || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateSponsorProfileAction(formData);
      setMessage({ type: 'success', text: 'Sponsor profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold font-serif text-[var(--color-primary-blue)]">Advertising Profile</h2>
        <p className="text-sm text-gray-500 mt-1">This information will be displayed in our designated sponsor space.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Acme Corporation"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Website URL</label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL (Icon/Square)</label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Short Bio / Description</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            rows={4}
            placeholder="Tell our members about your business..."
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#3C3B6E] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Update Advertising Space'}
          </button>
        </div>
      </form>
    </div>
  );
}
