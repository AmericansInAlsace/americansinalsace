import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BackofficeContainer from '@/components/ui/backoffice/BackofficeContainer';
import React from 'react';

/**
 * Shared Backoffice Layout.
 * Adheres to SOLID by using structured authorization checks.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Layout content.
 */
export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Authorization check - strictly typed and clean
  const role = session?.user?.role;
  if (!session?.user || (role !== 'SUPERADMIN' && role !== 'ADMIN')) {
    redirect('/');
  }

  return (
    <BackofficeContainer user={session.user}>
      {children}
    </BackofficeContainer>
  );
}
