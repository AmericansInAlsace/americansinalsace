'use client';

import React, { useState, useEffect } from 'react';
import { createEvent, updateEvent } from '@/app/actions/backoffice';
import { EmailEditor } from './EmailEditor';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any; // If provided, we are editing
  categories: { id: number; name: string }[];
}

export default function EventFormModal({ isOpen, onClose, event, categories }: EventFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    capacity: '',
    memberPrice: '0',
    nonMemberPrice: '0',
    published: false,
    categoryId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        capacity: event.capacity?.toString() || '',
        memberPrice: event.memberPrice?.toString() || '0',
        nonMemberPrice: event.nonMemberPrice?.toString() || '0',
        published: !!event.published,
        categoryId: event.categoryId?.toString() || (categories[0]?.id.toString() || ''),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: '',
        memberPrice: '0',
        nonMemberPrice: '0',
        published: false,
        categoryId: categories[0]?.id.toString() || '',
      });
    }
  }, [event, categories, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (event) {
        await updateEvent(event.id, formData);
      } else {
        await createEvent(formData);
      }
      onClose();
    } catch (err: any) {
      console.error('Event submission error:', err);
      setError(err.message || 'Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Annual Summer BBQ"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <div className="min-h-[300px]">
                <EmailEditor 
                  value={formData.description} 
                  onChange={handleDescriptionChange} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Parc de l'Orangerie, Strasbourg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Registration Limit (Capacity)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Member Price</label>
              <input
                type="number"
                step="0.01"
                name="memberPrice"
                value={formData.memberPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Non-Member Price</label>
              <input
                type="number"
                step="0.01"
                name="nonMemberPrice"
                value={formData.nonMemberPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="published" className="block text-sm font-bold text-blue-900">Visible to Community</label>
                <p className="text-xs text-blue-600">If checked, this event will be published on the website.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--color-primary-blue)] text-white px-8 py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
