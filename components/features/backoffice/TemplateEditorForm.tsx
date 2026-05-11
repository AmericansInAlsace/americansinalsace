'use client';

import React, { useState } from 'react';
import { EmailEditor } from './EmailEditor';
import { updateEmailTemplate } from '@/app/actions/email';
import { useRouter } from 'next/navigation';

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
  slug: string;
}

/**
 * A form for editing email templates in the backoffice.
 * It combines input fields for the template name and subject with the `EmailEditor`
 * for the main content, and handles saving the changes via a server action.
 *
 * @param {object} props - The component props.
 * @param {Template} props.template - The email template object to be edited.
 */
export function TemplateEditorForm({ template }: { template: Template }) {
  const [content, setContent] = useState(template.content);
  const [subject, setSubject] = useState(template.subject);
  const [name, setName] = useState(template.name);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateEmailTemplate(template.id, { name, subject, content });
      alert('Template updated successfully!');
      router.push('/backoffice/communications/templates');
    } catch (error) {
      alert('Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="display-name" className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
          <input 
            id="display-name"
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email-subject" className="block text-sm font-bold text-gray-700 mb-2">Email Subject</label>
          <input 
            id="email-subject"
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="template-content" className="block text-sm font-bold text-gray-700 mb-2">Template Content (HTML)</label>
        <EmailEditor id="template-content" value={content} onChange={setContent} />
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[var(--color-primary-blue)] text-white px-8 py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving...' : 'Save Template Changes'}
        </button>
      </div>
    </div>
  );
}
