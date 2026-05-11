/**
 * @file This file configures `next-intl` to load the correct translation messages
 * for the current request's locale. It validates the incoming locale against the
 * supported locales defined in `i18n/routing.ts` and serves the corresponding
 * JSON message file.
 */
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale || routing.defaultLocale,
    messages: (await import(`../messages/${locale || routing.defaultLocale}.json`)).default
  };
});
