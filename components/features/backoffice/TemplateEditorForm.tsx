'use client';

import React, { useState, useMemo } from 'react';
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
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const router = useRouter();

  const availablePlaceholders = useMemo(() => {
    switch (template.slug) {
      case 'verification-email':
      case 'reset-password':
        return ['actionUrl'];
      case 'event-rsvp-confirmation':
        return ['eventTitle', 'eventDate', 'eventLocation', 'userName'];
      case 'data-export':
        return ['userName'];
      default:
        return [];
    }
  }, [template.slug]);

  const previewContent = useMemo(() => {
    let preview = content;
    const samples: Record<string, string> = {
      actionUrl: 'https://americansinalsace.fr/verify?token=example-token',
      eventTitle: 'Annual Summer BBQ',
      eventDate: 'July 4, 2026',
      eventLocation: 'Parc de l’Orangerie, Strasbourg',
      userName: 'John Doe',
    };

    availablePlaceholders.forEach(p => {
      const regex = new RegExp(`{{${p}}}`, 'g');
      preview = preview.replace(regex, `<span class="bg-yellow-100 text-yellow-800 px-1 rounded font-bold">${samples[p] || p}</span>`);
    });

    return preview;
  }, [content, availablePlaceholders]);

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-[var(--color-text-main)]">Edit Template</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('edit')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setView('preview')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Preview
          </button>
        </div>
      </div>

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

      {view === 'edit' ? (
        <div>
          <label htmlFor="template-content" className="block text-sm font-bold text-gray-700 mb-2">Template Content (HTML)</label>
          <EmailEditor 
            id="template-content" 
            value={content} 
            onChange={setContent} 
            availablePlaceholders={availablePlaceholders}
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Email Preview (Simulated)</label>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 p-8 min-h-[400px]">
            <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm border border-gray-100 rounded-lg prose prose-blue">
              <div className="mb-8 border-b pb-4">
                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Subject:</div>
                <div className="text-lg font-bold">{subject}</div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400 italic">
            * Highlighted values are sample data for demonstration.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t">
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
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
