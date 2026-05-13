import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import SponsorshipListPage from '@/app/[locale]/backoffice/sponsors/list/page';
import * as actions from '@/app/actions/sponsorship';

vi.mock('@/app/actions/sponsorship', () => ({
  getSponsorships: vi.fn(),
  getSponsorTiers: vi.fn(),
}));

vi.mock('@/components/features/backoffice/SponsorshipManager', () => ({
  default: () => <div data-testid="mock-sponsorship-manager"></div>,
}));

describe('SponsorshipListPage', () => {
  it('renders correctly', async () => {
    vi.mocked(actions.getSponsorships).mockResolvedValue([]);
    vi.mocked(actions.getSponsorTiers).mockResolvedValue([]);

    const Result = await SponsorshipListPage();
    render(Result);

    expect(screen.getByText('Sponsorship Assignments')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sponsorship-manager')).toBeInTheDocument();
  });
});
