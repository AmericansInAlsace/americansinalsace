import React from 'react';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | Americans in Alsace',
  description: 'Set a new password for your account.',
};

/**
 * The page where users can set a new password using a token from their email.
 * It renders the `ResetPasswordForm` wrapped in a Suspense boundary
 * to handle the token retrieval from the URL.
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <React.Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
