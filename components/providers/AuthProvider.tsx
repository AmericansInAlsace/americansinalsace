'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

/**
 * Provides the NextAuth session context to all child components.
 * This is a client-side component that wraps the root of the application
 * to make session data available globally.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
