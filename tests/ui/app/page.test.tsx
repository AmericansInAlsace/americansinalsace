import { render, screen } from '@testing-library/react';
import HomePage from '@/app/[locale]/page';
import { describe, it, expect, vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.rich = (key: string) => key;
    return t;
  },
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock UpcomingEventsSection
vi.mock('@/components/features/home/UpcomingEventsSection', () => ({
  default: () => <div>UpcomingEventsSection</div>,
}));

describe('HomePage', () => {
  it('should render the landing page for guests', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any);
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn() } as any);

    const Page = await HomePage();
    render(Page);

    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Join Us\?/i)).toBeInTheDocument();
  });

  it('should show verification success banner', async () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any);
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key) => key === 'verified' ? 'true' : null)
    } as any);

    const Page = await HomePage();
    render(Page);

    expect(screen.getByText(/Your email has been successfully verified/i)).toBeInTheDocument();
  });
});
