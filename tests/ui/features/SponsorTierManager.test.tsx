import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SponsorTierManager from '@/components/features/backoffice/SponsorTierManager';
import { vi, describe, it, expect } from 'vitest';
import * as actions from '@/app/actions/sponsorship';

vi.mock('@/app/actions/sponsorship', () => ({
  createSponsorTier: vi.fn(),
  updateSponsorTier: vi.fn(),
  deleteSponsorTier: vi.fn(),
}));

describe('SponsorTierManager UI', () => {
  const initialTiers = [
    { id: 1, name: 'Gold', description: 'Gold tier', price: 1000, priority: 10, active: true },
    { id: 2, name: 'Silver', description: 'Silver tier', price: 500, priority: 5, active: false },
  ];

  it('renders tiers list', () => {
    render(<SponsorTierManager initialTiers={initialTiers} />);
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
  });

  it('opens create modal', () => {
    render(<SponsorTierManager initialTiers={initialTiers} />);
    fireEvent.click(screen.getByText('+ Add New Tier'));
    expect(screen.getByText('New Sponsor Tier')).toBeInTheDocument();
  });

  it('opens edit modal and saves', async () => {
    vi.mocked(actions.updateSponsorTier).mockResolvedValue({ tier: { ...initialTiers[0], name: 'Updated Gold' } } as any);
    render(<SponsorTierManager initialTiers={initialTiers} />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByDisplayValue('Gold')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('Gold'), { target: { value: 'Updated Gold' } });

    fireEvent.click(screen.getByText('Save Tier'));

    await waitFor(() => {
      expect(actions.updateSponsorTier).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Updated Gold' }));
    });
  });

  it('toggles active status', async () => {
    vi.mocked(actions.updateSponsorTier).mockResolvedValue({ tier: { ...initialTiers[0], active: false } } as any);
    render(<SponsorTierManager initialTiers={initialTiers} />);
    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);

    await waitFor(() => {
      expect(actions.updateSponsorTier).toHaveBeenCalledWith(1, expect.objectContaining({ active: false }));
    });
  });

  it('handles delete tier', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(actions.deleteSponsorTier).mockResolvedValue({ success: true });

    render(<SponsorTierManager initialTiers={initialTiers} />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(actions.deleteSponsorTier).toHaveBeenCalledWith(1);
    });
  });
});
