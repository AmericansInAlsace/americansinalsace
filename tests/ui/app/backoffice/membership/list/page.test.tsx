import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import MembershipsListPage from '@/app/[locale]/backoffice/membership/list/page';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    subscription: {
      findMany: vi.fn(),
    },
    membershipTier: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/components/features/backoffice/MembershipTable', () => ({
  MembershipTable: () => <div data-testid="mock-membership-table"></div>,
}));

describe('MembershipsListPage', () => {
  it('renders correctly', async () => {
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([]);
    vi.mocked(prisma.membershipTier.findMany).mockResolvedValue([]);

    const Result = await MembershipsListPage();
    render(Result);

    expect(screen.getByText('Active Memberships')).toBeInTheDocument();
    expect(screen.getByTestId('mock-membership-table')).toBeInTheDocument();
  });
});
