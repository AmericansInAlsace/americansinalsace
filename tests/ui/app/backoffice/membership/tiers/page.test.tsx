import { render, screen } from '@testing-library/react';
import TiersAdminPage from '@/app/[locale]/backoffice/membership/tiers/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MembershipService } from '@/services/MembershipService';

// Mock MembershipService
vi.mock('@/services/MembershipService', () => ({
  MembershipService: {
    getActiveTiers: vi.fn(),
  },
}));

describe('TiersAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render membership tiers table', async () => {
    const mockTiers = [
      { id: 1, name: 'Basic', description: 'Basic tier', price: 20, paypalPlanId: 'P-123', active: true },
    ];

    vi.mocked(MembershipService.getActiveTiers).mockResolvedValue(mockTiers as any);

    const Result = await TiersAdminPage();
    render(Result);

    expect(screen.getByText('Membership Tiers')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('20€ / yr')).toBeInTheDocument();
    expect(screen.getByText('P-123')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
