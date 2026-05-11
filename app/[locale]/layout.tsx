import React from 'react';
import '../globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/ui/Navbar';
import { ErrorLogger } from '@/components/providers/ErrorLogger';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Americans in Alsace',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'An association for North Americans residing in Alsace, France.',
  icons: {
    icon: '/favicon.ico',
    apple: '/AIA_copy.png',
  },
};

/**
 * Generates static paths for all supported locales.
 * This is used by Next.js to pre-render all locale-based routes.
 * @returns {Array<{locale: string}>} An array of locale objects.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The root layout for the application. It sets up the HTML structure,
 * provides the Next-Intl context for internationalization, and includes
 * the main Navbar and AuthProvider.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered within the layout.
 * @param {Promise<{locale: string}>} props.params - The route parameters, containing the current locale.
 */
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased text-[var(--color-text-main)]">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ErrorLogger />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-grow">
                {children}
              </div>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
