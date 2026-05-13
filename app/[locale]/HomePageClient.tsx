'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import BugReportModal from '@/components/features/BugReportModal';

/**
 * Displays feedback for email verification status.
 */
function VerificationBanner() {
  return (
    <React.Suspense fallback={null}>
      <VerificationContent />
    </React.Suspense>
  );
}

/**
 * Renders the content of the verification banner, checking URL search
 * parameters for 'verified' or 'error' messages.
 * This component is wrapped in a Suspense boundary.
 */
function VerificationContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');
  const t = useTranslations('HomePage');

  if (!verified && !error) return null;

  return (
    <div className={`py-3 px-4 text-center text-sm font-medium ${verified ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`} role="alert">
      {verified ? t('verificationSuccess') : t('verificationError', { error })}
    </div>
  );
}

interface HomePageClientProps {
  upcomingEventsSection: React.ReactNode;
}

/**
 * The client-side part of the homepage.
 * Receives the Server Component for events as a prop to maintain the server/client boundary.
 */
export default function HomePageClient({ upcomingEventsSection }: HomePageClientProps): React.JSX.Element {
  const { status } = useSession();
  const isGuest = status === 'unauthenticated';
  const t = useTranslations('HomePage');

  const [isBugModalOpen, setIsBugModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col bg-[var(--color-background)]">
      <VerificationBanner />

      <BugReportModal 
        isOpen={isBugModalOpen} 
        onClose={() => setIsBugModalOpen(false)} 
      />
      
      {/* Hero / Banner Section */}
      <header className="bg-white border-b border-[var(--color-border)] overflow-hidden" role="banner">
        <div className="relative h-64 md:h-96 bg-[var(--color-primary-blue)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-blue)] to-transparent opacity-60 z-10"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20 text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-serif max-w-2xl leading-tight mb-4">
              {t.rich('title', {
                span: (chunks) => <span className="whitespace-nowrap">{chunks}</span>
              })}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-xl font-medium">
              {t('description')}
            </p>
          </div>
          {/* Decorative pattern for the banner */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 flex flex-wrap gap-1 p-2">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-white"></div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content: News & Events */}
      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* News & Events Column */}
          <div className="lg:col-span-2 space-y-16">
            <section aria-labelledby="news-heading">
              <div className="flex items-center gap-4 mb-8">
                <h2 id="news-heading" className="text-4xl font-bold text-[var(--color-text-main)] font-serif">
                  {t('latestNews')}
                </h2>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
              <div className="grid gap-8">
                <article className="bg-white p-8 rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-bold text-[var(--color-primary-red)] uppercase tracking-widest mb-2">Announcement</div>
                  <h3 className="text-2xl font-bold mb-4 font-serif">{t('welcomeTitle')}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                    {t('welcomeDescription')}
                  </p>
                  <span className="text-sm font-semibold text-[var(--color-primary-blue)] hover:underline cursor-pointer">{t('readMore')} &rarr;</span>
                </article>
                <div className="bg-gray-50 p-12 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <p className="text-gray-400 italic">{t('moreNews')}</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="events-heading">
              <div className="flex items-center gap-4 mb-8">
                <h2 id="events-heading" className="text-4xl font-bold text-[var(--color-text-main)] font-serif">
                  {t('upcomingEvents')}
                </h2>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
              {upcomingEventsSection}
            </section>
          </div>

          {/* Side Info Column */}
          <aside className="space-y-12">
            {isGuest && (
              <section className="bg-[var(--color-primary-blue)] text-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4 font-serif">Why Join Us?</h3>
                <ul className="space-y-4 text-blue-50 text-sm">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-primary-red)] font-bold">✓</span>
                    Connect with fellow North Americans in Alsace.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-primary-red)] font-bold">✓</span>
                    Access exclusive member events and resources.
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-primary-red)] font-bold">✓</span>
                    Support the local expat community.
                  </li>
                </ul>
                <div className="mt-8">
                  <Link 
                    href="/register" 
                    className="block text-center bg-white text-[var(--color-primary-blue)] font-bold py-3 rounded-md hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Join Today
                  </Link>
                </div>
              </section>
            )}

            <section className="p-8 rounded-xl border border-[var(--color-border)] bg-white">
              <h3 className="text-xl font-bold mb-4 font-serif">Contact Us</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Have questions or want to get involved? Reach out to us at <a href="mailto:info@americansinalsace.fr" className="text-[var(--color-primary-red)] font-medium">info@americansinalsace.fr</a>.
              </p>
            </section>

            <section className="p-8 rounded-xl border-2 border-dashed border-red-100 bg-red-50/30">
              <h3 className="text-xl font-bold mb-4 font-serif text-[var(--color-text-main)] flex items-center gap-2">
                <span className="text-[var(--color-primary-red)]">🐛</span> Found a Bug?
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
                Help us keep our community platform running smoothly. If you spot a technical issue, report it directly to our dev team.
              </p>
              <button
                onClick={() => setIsBugModalOpen(true)}
                className="inline-flex items-center justify-center w-full bg-[var(--color-primary-red)] text-white font-bold py-3 rounded-md hover:opacity-90 transition-all shadow-sm"
              >
                Report Issue
              </button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="bg-[var(--color-gray-900)] text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 border-b border-gray-800 pb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10">
                  <Image 
                    src="/AIA_copy.png" 
                    alt="AIA Logo" 
                    fill 
                    className="object-contain" 
                  />
                </div>
                <h3 className="text-xl font-bold font-serif text-white">Americans <span className="whitespace-nowrap">in Alsace</span></h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                A bridge between North America and the Grand Est. Supporting our community since 2026.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 font-serif">Quick Links</h3>
              <nav aria-label="Footer Navigation">
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/news" className="hover:text-white transition-colors">News</Link></li>
                  <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
                  <li><Link href="/sponsors" className="hover:text-white transition-colors">Sponsors</Link></li>
                </ul>
              </nav>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 font-serif">Legal & Accessibility</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/accessibility" className="hover:text-white transition-colors">Accessibility Statement</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors">Legal Mentions</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Americans <span className="whitespace-nowrap">in Alsace</span>. All rights reserved.</p>
            <p>Accessibility: Partially Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
