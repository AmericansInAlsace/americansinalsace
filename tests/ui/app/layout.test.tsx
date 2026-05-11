import { render, screen } from '@testing-library/react';
import LocaleLayout from '@/app/[locale]/layout';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(),
  setRequestLocale: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock components
vi.mock('@/components/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}));

vi.mock('@/components/ui/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

// Mock next-intl client provider
vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: any) => <div data-testid="intl-provider">{children}</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'fr'],
    defaultLocale: 'en'
  },
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('LocaleLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly for valid locale', async () => {
    vi.mocked(getMessages).mockResolvedValue({} as any);

    const Result = await LocaleLayout({
      children: <div data-testid="child">Content</div>,
      params: { locale: 'en' }
    });

    render(Result);

    expect(setRequestLocale).toHaveBeenCalledWith('en');
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should call notFound for invalid locale', async () => {
    await LocaleLayout({
      children: <div>Content</div>,
      params: { locale: 'invalid' }
    });

    expect(notFound).toHaveBeenCalled();
  });
});
