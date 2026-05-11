/**
 * @file This file sets up and exports the Next.js middleware for `next-intl`.
 * The middleware is responsible for handling internationalized routing,
 * locale detection, and prefixing paths with the current locale.
 * The `matcher` config ensures this middleware only runs on pages and not on
 * API routes or static asset requests.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const proxy = createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
