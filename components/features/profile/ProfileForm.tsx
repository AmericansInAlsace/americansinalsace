'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { handleUpdateProfile } from '@/app/actions/profile';

interface ProfileFormProps {
  user: {
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  return (
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
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
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
  );
}
