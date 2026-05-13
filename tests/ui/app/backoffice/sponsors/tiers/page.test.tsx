import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import SponsorTiersPage from '@/app/[locale]/backoffice/sponsors/tiers/page';
import * as actions from '@/app/actions/sponsorship';

vi.mock('@/app/actions/sponsorship', () => ({
  getSponsorTiers: vi.fn(),
}));

vi.mock('@/components/features/backoffice/SponsorTierManager', () => ({
  default: () => <div data-testid="mock-tier-manager"></div>,
}));

describe('SponsorTiersPage', () => {
  it('renders correctly', async () => {
    vi.mocked(actions.getSponsorTiers).mockResolvedValue([]);

    const Result = await SponsorTiersPage();
    render(Result);

    expect(screen.getByText('Sponsor Tiers')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tier-manager')).toBeInTheDocument();
  });
});
