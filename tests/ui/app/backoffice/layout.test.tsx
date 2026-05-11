import { render, screen } from '@testing-library/react';
import BackofficeLayout from '@/app/[locale]/backoffice/layout';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePathname: vi.fn().mockReturnValue('/backoffice'),
}));

describe('BackofficeLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect if not SUPERADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'USER' } } as any);
    await BackofficeLayout({ children: <div>Content</div> });
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('should render for SUPERADMIN', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { role: 'SUPERADMIN', name: 'Admin User' }
    } as any);

    const Result = await BackofficeLayout({ children: <div data-testid="child">Content</div> });
    render(Result);

    expect(screen.getByText('Administrator Panel')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
