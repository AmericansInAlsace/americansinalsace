import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/[locale]/backoffice/page';
import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      count: vi.fn(),
    },
    subscription: {
      count: vi.fn(),
    },
    membershipTier: {
      count: vi.fn(),
    },
  },
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('DashboardPage', () => {
  it('should render dashboard with stats', async () => {
    vi.mocked(prisma.user.count).mockResolvedValue(10);
    vi.mocked(prisma.subscription.count).mockResolvedValue(5);
    vi.mocked(prisma.membershipTier.count).mockResolvedValue(3);

    const Result = await DashboardPage();
    render(Result);

    expect(screen.getByText('Administration Dashboard')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total users
    expect(screen.getAllByText('5')).toHaveLength(2); // Active members and Pending
    expect(screen.getByText('Membership Tiers')).toBeInTheDocument();
  });
});
