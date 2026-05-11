'use client';

import React from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';

/**
 * Main Navigation component for Americans in Alsace.
 * 
 * @description Renders a dynamic navbar based on user session status.
 * Adheres to RGAA, UI/UX expert mandates, and SOLID principles by segregating concerns.
 */
export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isLoading = status === 'loading';
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // SRP: Permission check logic is kept clear and typed
  const hasBackofficeAccess = session?.user?.permissions?.some(
    (p) => p.resource === 'Backoffice' && p.action === 'READ'
  );

  const navLinkClass = "text-base md:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary-red)] transition-colors py-3 md:py-2 block";
  const mobileLinkClass = "text-lg font-semibold text-[var(--color-text-main)] py-4 border-b border-gray-100 flex items-center justify-between";

  /**
   * Handles locale switching.
   * @param {string} newLocale - The target locale ('en' or 'fr').
   */
  const onLocaleChange = (newLocale: 'en' | 'fr') => {
    router.replace(pathname, { locale: newLocale });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]">
              <div className="relative w-10 h-10">
                <Image 
                  src="/AIA_copy.png" 
                  alt="AIA Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold font-serif text-[var(--color-primary-blue)] hidden sm:block">
                Americans <span className="whitespace-nowrap">in Alsace</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {/* Locale Switcher */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-6 mr-2">
              <button 
                onClick={() => onLocaleChange('en')}
                className={`text-xs font-black w-10 h-10 flex items-center justify-center rounded-full transition-all ${locale === 'en' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button 
                onClick={() => onLocaleChange('fr')}
                className={`text-xs font-black w-10 h-10 flex items-center justify-center rounded-full transition-all ${locale === 'fr' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                aria-label="Passer en Français"
              >
                FR
              </button>
            </div>

            <Link href="/" className={navLinkClass}>{t('home')}</Link>
            <Link href="/sponsors" className={navLinkClass}>{t('sponsors')}</Link>

            {session && (
              <Link href="/membership" className={navLinkClass}>{t('membership')}</Link>
            )}

            {isLoading ? (
              <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-full"></div>
            ) : session ? (
              <div className="flex items-center gap-4">
                {hasBackofficeAccess && (
                  <Link 
                    href="/backoffice" 
                    className="text-sm font-bold text-[var(--color-primary-blue)] hover:text-[var(--color-primary-red)] transition-colors py-2 px-4 border border-blue-100 rounded-full bg-blue-50 shadow-sm"
                  >
                    Backoffice
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="text-sm font-semibold text-[var(--color-text-main)] hover:text-[var(--color-primary-red)] transition-colors py-2 px-2"
                >
                  {t('profile')}
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-bold text-white bg-[var(--color-primary-red)] px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className={navLinkClass}>{t('login')}</Link>
                <Link 
                  href="/register" 
                  className="text-sm font-bold text-white bg-[var(--color-primary-blue)] px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-md active:scale-95"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-1 mr-2">
               <button 
                onClick={() => onLocaleChange(locale === 'en' ? 'fr' : 'en')}
                className="text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700"
              >
                {locale.toUpperCase()}
              </button>
            </div>
            <button 
              onClick={toggleMenu}
              className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 text-[var(--color-primary-blue)] active:bg-gray-100"
              aria-label="Toggle Menu"
            >
              <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-40 animate-in slide-in-from-right duration-300">
          <div className="p-6 flex flex-col h-full">
            <div className="flex-grow">
              <Link href="/" onClick={toggleMenu} className={mobileLinkClass}>
                {t('home')} <span>→</span>
              </Link>
              <Link href="/sponsors" onClick={toggleMenu} className={mobileLinkClass}>
                {t('sponsors')} <span>→</span>
              </Link>

              {session ? (
                <>
                  <Link href="/membership" onClick={toggleMenu} className={mobileLinkClass}>
                    {t('membership')} <span>→</span>
                  </Link>
                  <Link href="/profile" onClick={toggleMenu} className={mobileLinkClass}>
                    {t('profile')} <span>👤</span>
                  </Link>
                  {hasBackofficeAccess && (
                    <Link href="/backoffice" onClick={toggleMenu} className={`${mobileLinkClass} text-[var(--color-primary-blue)]`}>
                      Backoffice Dashboard <span>🛠️</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login" onClick={toggleMenu} className={mobileLinkClass}>
                  {t('login')} <span>→</span>
                </Link>
              )}
            </div>

            <div className="mt-auto pb-10 space-y-4">
              {!session ? (
                <Link 
                  href="/register" 
                  onClick={toggleMenu}
                  className="block w-full text-center bg-[var(--color-primary-blue)] text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                >
                  {t('register')}
                </Link>
              ) : (
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-center bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
