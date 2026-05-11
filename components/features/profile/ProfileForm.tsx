'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { handleUpdateProfile } from '@/app/actions/profile';
import { exportUserData, anonymizeUserData } from '@/app/actions/gdpr';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { signOut } from 'next-auth/react';

interface ProfileFormProps {
  user: {
    id: string; // Added ID to user prop for actions
    firstName: string;
    lastName: string;
    email: string;
    bio?: string | null;
    phone?: string | null;
  };
}

/**
 * Form for updating user profile.
 * 
 * @description Renders a controlled form for editing user details.
 * Adheres to UI/UX and Accessibility skill mandates.
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGdprLoading, setIsGdprLoading] = useState(false);
  const [isAnonymizeModalOpen, setIsAnonymizeModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await handleUpdateProfile(formData);

    setIsLoading(false);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
  }

  async function handleExport() {
    setIsGdprLoading(true);
    setMessage(null);
    try {
      await exportUserData(parseInt(user.id));
      setMessage({ type: 'success', text: `Data export initiated. An email with your JSON data will be sent to ${user.email} shortly.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to export data.' });
    } finally {
      setIsGdprLoading(false);
    }
  }

  async function handleAnonymize() {
    setIsGdprLoading(true);
    setIsAnonymizeModalOpen(false);
    try {
      await anonymizeUserData(parseInt(user.id));
      // Log out user after anonymization
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to anonymize data.' });
      setIsGdprLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Primary)</Label>
          <Input id="email" name="email" value={user.email} disabled className="bg-gray-50 italic" />
          <p className="text-xs text-gray-500">Email addresses cannot be changed at this time.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ''} placeholder="+33 0 00 00 00 00" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio / About You</Label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio || ''}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="Tell the community a bit about yourself..."
          />
        </div>

        {message && (
          <div 
            className={`p-4 rounded-md text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
          <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
            Save Changes
          </Button>
        </div>
      </form>

      {/* GDPR & Privacy Section */}
      <section className="pt-8 border-t-2 border-dashed border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 font-serif">GDPR & Privacy</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your data and privacy settings in accordance with GDPR regulations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
            <div>
              <h4 className="font-bold text-gray-900">Download Your Data</h4>
              <p className="text-sm text-gray-600 mt-1">Receive a copy of all personal data we have stored for your account in JSON format.</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleExport}
              isLoading={isGdprLoading}
            >
              Export My Data
            </Button>
          </div>

          <div className="bg-red-50/30 p-6 rounded-xl border border-red-100 space-y-4">
            <div>
              <h4 className="font-bold text-red-900">Anonymize Account</h4>
              <p className="text-sm text-red-700 mt-1">Permanently scrub your personal information from our records. This action cannot be undone.</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-700 hover:bg-red-50" 
              onClick={() => setIsAnonymizeModalOpen(true)}
              disabled={isGdprLoading}
            >
              Anonymize My Account
            </Button>
          </div>
        </div>
      </section>

      <ConfirmationModal
        isOpen={isAnonymizeModalOpen}
        onClose={() => setIsAnonymizeModalOpen(false)}
        onConfirm={handleAnonymize}
        title="Anonymize Your Account?"
        message="This will irreversibly remove your name, email, and other personal details from our system. You will be logged out immediately and will no longer be able to access this account. Financial records will be kept for accounting purposes but will be disconnected from your identity."
        confirmLabel="Anonymize Irreversibly"
        variant="destructive"
        isLoading={isGdprLoading}
      />
    </div>
  );
}
