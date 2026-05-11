import { render, screen } from '@testing-library/react';
import HomePage from '@/app/[locale]/page';
import { describe, it, expect, vi } from 'vitest';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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

// Mock Image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('HomePage', () => {
  it('should render the landing page for guests', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any);
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn() } as any);

    render(<HomePage />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByText('Why Join Us?')).toBeInTheDocument();
  });

  it('should show verification success banner', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any);
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn((key) => key === 'verified' ? 'true' : null)
    } as any);

    render(<HomePage />);

    expect(screen.getByText(/Your email has been successfully verified/i)).toBeInTheDocument();
  });
});
