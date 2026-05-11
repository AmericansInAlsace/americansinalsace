'use client';

import React, { useState } from 'react';
import { submitImprovement } from '@/app/actions/improvements';

interface ImprovementFormProps {
  categories: { id: number; name: string }[];
}

/**
 * ImprovementForm component for backoffice users to submit suggestions/bugs to JIRA.
 */
export default function ImprovementForm({ categories }: ImprovementFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: `[CONTEXT / PROBLEM]
- 

[EXPECTED BEHAVIOR]
- 

[SUGGESTIONS / NOTES]
- `,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await submitImprovement(formData);
      setSuccess(`Improvement submitted successfully! JIRA Ticket: ${result.jiraKey}`);
      setFormData({ subject: '', category: '', description: '' });
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit improvement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 font-serif">Submit an Improvement</h2>
        <p className="text-sm text-gray-500 mt-1">Suggest a new feature or an enhancement. For technical bugs, please use the general Bug Report feature.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Brief summary of the enhancement"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-gray-700">Description</label>
              <span className="text-[10px] text-gray-400 italic font-medium">Please keep the headers below to ensure structured feedback</span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={9}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Detailed explanation of the suggested enhancement..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#3C3B6E] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : 'Create JIRA Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
