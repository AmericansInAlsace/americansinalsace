'use client';

import React, { useState } from 'react';
import { submitBugReport } from '@/app/actions/bugs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface BugReportFormProps {
  onSuccess?: (jiraKey: string) => void;
  hideHeader?: boolean;
}

/**
 * BugReportForm component for all users to submit bugs directly to JIRA.
 */
export default function BugReportForm({ onSuccess, hideHeader }: BugReportFormProps) {
  const bugTemplate = `[STEPS TO REPRODUCE]
1. 
2. 

[EXPECTED RESULT]
- 

[ACTUAL RESULT]
- 

[ENVIRONMENT]
- Browser:
- Device:`;

  const [formData, setFormData] = useState({
    subject: '',
    description: bugTemplate,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitBugReport(formData);
      if (onSuccess) {
        onSuccess(result.jiraKey);
      }
      setFormData({ subject: '', description: bugTemplate });
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit bug report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white ${!hideHeader ? 'rounded-2xl shadow-sm border border-gray-100' : ''} overflow-hidden max-w-2xl mx-auto`}>
      {!hideHeader && (
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Report a Bug</h2>
          <p className="text-sm text-gray-500 mt-1">Spotted something broken? Help us improve the site by reporting it below.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${!hideHeader ? 'p-8' : 'p-0'} space-y-6`}>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject" className="mb-2 block font-bold">Subject</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="e.g. Login button is not responsive on mobile"
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <Label htmlFor="description" className="font-bold">Detailed Description</Label>
              <span className="text-[10px] text-gray-400 italic font-medium uppercase tracking-wider">Required Template</span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto px-12 font-bold shadow-md"
          >
            Submit Bug Report
          </Button>
        </div>
      </form>
    </div>
  );
}
