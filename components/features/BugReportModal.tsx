'use client';

import React, { useState } from 'react';
import BugReportForm from './BugReportForm';
import { Button } from '@/components/ui/Button';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A modal wrapper for the BugReportForm.
 * Coordinates between the form and a success popover.
 */
export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [jiraKey, setJiraKey] = useState<string | null>(null);

  const handleSuccess = (key: string) => {
    setJiraKey(key);
    setIsSuccessOpen(true);
  };

  const handleFinalClose = () => {
    setIsSuccessOpen(false);
    setJiraKey(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      {/* Success Popover */}
      {isSuccessOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4 border border-green-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-serif">Report Submitted!</h3>
            <p className="text-sm text-gray-500">
              Thank you for helping us improve. Your issue has been logged in JIRA.
            </p>
            <div className="bg-gray-50 py-2 px-4 rounded-lg font-mono text-xs text-[var(--color-primary-blue)] font-bold">
              Ticket ID: {jiraKey}
            </div>
            <Button onClick={handleFinalClose} className="w-full" variant="secondary">
              Got it, thanks!
            </Button>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all ${isSuccessOpen ? 'opacity-20 pointer-events-none scale-95' : 'scale-100'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif leading-none">Report a Bug</h2>
            <p className="text-xs text-gray-500 mt-1">Found something broken? Let us know.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
        </div>

        <div className="p-8">
          <BugReportForm onSuccess={handleSuccess} hideHeader />
        </div>
      </div>
    </div>
  );
}
