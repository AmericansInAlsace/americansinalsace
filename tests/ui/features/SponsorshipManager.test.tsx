import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SponsorshipManager from '@/components/features/backoffice/SponsorshipManager';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import * as actions from '@/app/actions/sponsorship';

// Mock dependencies
vi.mock('@/app/actions/sponsorship', () => ({
  getSponsorships: vi.fn(),
  updateSponsorshipStatus: vi.fn(),
  createSponsorshipAction: vi.fn(),
  searchUsersForSponsorship: vi.fn(),
  updateSponsorshipAction: vi.fn(),
}));

// Mock DataTable to avoid complexity
vi.mock('@/components/ui/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <div data-testid="mock-data-table">
      {data.map((item: any) => (
        <div key={item.id}>
          {columns.map((col: any, idx: number) => (
            <div key={idx}>{col.cell ? col.cell(item) : item[col.accessorKey]}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const mockTiers = [
  { id: 1, name: 'Gold' },
  { id: 2, name: 'Silver' },
];

const mockSponsorships = [
  {
    id: 101,
    userId: 1,
    tierId: 1,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    status: 'ACTIVE',
    user: { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
    tier: { name: 'Gold' },
  },
];

describe('SponsorshipManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the list of sponsorships', () => {
    render(<SponsorshipManager initialSponsorships={mockSponsorships} tiers={mockTiers} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
  });

  it('should handle status change', async () => {
    vi.mocked(actions.updateSponsorshipStatus).mockResolvedValue({ success: true } as any);
    vi.mocked(actions.getSponsorships).mockResolvedValue([]);

    render(<SponsorshipManager initialSponsorships={mockSponsorships} tiers={mockTiers} />);
    
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(actions.updateSponsorshipStatus).toHaveBeenCalledWith(101, 'CANCELLED');
    await waitFor(() => {
      expect(actions.getSponsorships).toHaveBeenCalled();
    });
  });

  it('should open create modal and search users', async () => {
    vi.mocked(actions.searchUsersForSponsorship).mockResolvedValue([
      { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }
    ]);

    render(<SponsorshipManager initialSponsorships={[]} tiers={mockTiers} />);
    
    fireEvent.click(screen.getByText('+ Assign Sponsor'));
    expect(screen.getByText('Assign New Sponsor')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Name or email...');
    fireEvent.change(searchInput, { target: { value: 'Bob' } });

    await waitFor(() => {
      expect(actions.searchUsersForSponsorship).toHaveBeenCalledWith('Bob');
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    // Select user
    fireEvent.click(screen.getByText('Bob Jones'));
    expect(screen.getByText('Confirm Assignment')).toBeEnabled();
  });

  it('should create a new sponsorship', async () => {
    vi.mocked(actions.createSponsorshipAction).mockResolvedValue({ success: true } as any);
    vi.mocked(actions.getSponsorships).mockResolvedValue([]);

    render(<SponsorshipManager initialSponsorships={[]} tiers={mockTiers} />);
    fireEvent.click(screen.getByText('+ Assign Sponsor'));

    // Manually set selected user since we tested search above
    const searchInput = screen.getByPlaceholderText('Name or email...');
    vi.mocked(actions.searchUsersForSponsorship).mockResolvedValue([{ id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }]);
    fireEvent.change(searchInput, { target: { value: 'Bob' } });

    const userBtn = await screen.findByText('Bob Jones', { exact: false });
    fireEvent.click(userBtn);

    fireEvent.click(screen.getByText('Confirm Assignment'));

    await waitFor(() => {
      expect(actions.createSponsorshipAction).toHaveBeenCalledWith(2, 1, expect.any(String));
      expect(actions.getSponsorships).toHaveBeenCalled();
    });
  });

  it('should handle edit sponsorship', async () => {
    vi.mocked(actions.updateSponsorshipAction).mockResolvedValue({ success: true } as any);
    vi.mocked(actions.getSponsorships).mockResolvedValue([]);

    render(<SponsorshipManager initialSponsorships={mockSponsorships} tiers={mockTiers} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Sponsorship')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(actions.updateSponsorshipAction).toHaveBeenCalled();
      expect(actions.getSponsorships).toHaveBeenCalled();
    });
  });

  it('should show alert on operation failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(actions.createSponsorshipAction).mockRejectedValue(new Error('Failed'));

    render(<SponsorshipManager initialSponsorships={[]} tiers={mockTiers} />);
    fireEvent.click(screen.getByText('+ Assign Sponsor'));
    
    // Select user
    vi.mocked(actions.searchUsersForSponsorship).mockResolvedValue([{ id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }]);
    fireEvent.change(screen.getByPlaceholderText('Name or email...'), { target: { value: 'Bob' } });

    fireEvent.click(await screen.findByText('Bob Jones', { exact: false }));

    fireEvent.click(screen.getByText('Confirm Assignment'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Operation failed');
    });
    alertSpy.mockRestore();
  });

  it('should handle status change failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(actions.updateSponsorshipStatus).mockRejectedValue(new Error('Failed'));

    render(<SponsorshipManager initialSponsorships={mockSponsorships} tiers={mockTiers} />);
    
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to update status');
    });
    alertSpy.mockRestore();
  });

  it('should handle reactivation', async () => {
    const expiredSponsorship = [{ ...mockSponsorships[0], status: 'EXPIRED' }];
    vi.mocked(actions.updateSponsorshipStatus).mockResolvedValue({ success: true } as any);

    render(<SponsorshipManager initialSponsorships={expiredSponsorship} tiers={mockTiers} />);
    
    const reactivateBtn = screen.getByText('Reactivate');
    fireEvent.click(reactivateBtn);

    expect(actions.updateSponsorshipStatus).toHaveBeenCalledWith(101, 'ACTIVE');
  });

  it('should handle modal interactions: closing, deselecting user, and changing fields', async () => {
    vi.mocked(actions.searchUsersForSponsorship).mockResolvedValue([{ id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }]);
    
    render(<SponsorshipManager initialSponsorships={[]} tiers={mockTiers} />);
    
    // Open and close modal
    fireEvent.click(screen.getByText('+ Assign Sponsor'));
    expect(screen.getByText('Assign New Sponsor')).toBeInTheDocument();
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Assign New Sponsor')).not.toBeInTheDocument();

    // Reopen and search
    fireEvent.click(screen.getByText('+ Assign Sponsor'));
    fireEvent.change(screen.getByPlaceholderText('Name or email...'), { target: { value: 'Bob' } });
    fireEvent.click(await screen.findByText('Bob Jones', { exact: false }));
    
    // Deselect user
    const closeButtons = screen.getAllByText('✕');
    // The user deselect button is inside the blue box, usually the second '✕' (the first is modal header)
    fireEvent.click(closeButtons[1]);
    expect(screen.getByPlaceholderText('Name or email...')).toBeInTheDocument();

    // Re-select and change other fields
    fireEvent.change(screen.getByPlaceholderText('Name or email...'), { target: { value: 'Bob' } });
    fireEvent.click(await screen.findByText('Bob Jones', { exact: false }));
    
    fireEvent.change(screen.getByDisplayValue('Gold'), { target: { value: '2' } });
    const dateInput = screen.getByText('Start Date').parentElement?.querySelector('input');
    if (dateInput) fireEvent.change(dateInput, { target: { value: '2023-01-01' } });

    fireEvent.click(screen.getByText('Confirm Assignment'));
    await waitFor(() => {
      expect(actions.createSponsorshipAction).toHaveBeenCalledWith(2, 2, '2024-01-01');
    });
  });

  it('should allow changing status when editing', async () => {
    vi.mocked(actions.updateSponsorshipAction).mockResolvedValue({ success: true } as any);
    render(<SponsorshipManager initialSponsorships={mockSponsorships} tiers={mockTiers} />);
    
    fireEvent.click(screen.getByText('Edit'));
    
    const statusSelect = screen.getByDisplayValue('ACTIVE');
    fireEvent.change(statusSelect, { target: { value: 'CANCELLED' } });
    
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(actions.updateSponsorshipAction).toHaveBeenCalledWith(101, expect.objectContaining({ status: 'CANCELLED' }));
    });
  });

  it('should handle search debounce and short query', async () => {
    vi.useFakeTimers();
    render(<SponsorshipManager initialSponsorships={[]} tiers={mockTiers} />);
    fireEvent.click(screen.getByText('+ Assign Sponsor'));

    const searchInput = screen.getByPlaceholderText('Name or email...');
    
    // Short query
    fireEvent.change(searchInput, { target: { value: 'a' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(actions.searchUsersForSponsorship).not.toHaveBeenCalled();

    // Long query
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(actions.searchUsersForSponsorship).toHaveBeenCalledWith('alice');
    
    vi.useRealTimers();
  });
});
