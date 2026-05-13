import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SponsorProfileForm from '@/components/features/profile/SponsorProfileForm';
import { updateSponsorProfileAction } from '@/app/actions/sponsorship';
import React from 'react';

vi.mock('@/app/actions/sponsorship', () => ({
  updateSponsorProfileAction: vi.fn()
}));

describe('SponsorProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form without initial profile', () => {
    render(<SponsorProfileForm initialProfile={null} />);
    expect(screen.getByPlaceholderText('e.g. Acme Corporation')).toHaveValue('');
    expect(screen.getByPlaceholderText('https://example.com')).toHaveValue('');
  });

  it('renders with initial profile', () => {
    render(<SponsorProfileForm initialProfile={{ companyName: 'Acme Corp', websiteUrl: 'https://acme.com', logoUrl: 'https://acme.com/logo.png', bio: 'A great company' }} />);
    expect(screen.getByPlaceholderText('e.g. Acme Corporation')).toHaveValue('Acme Corp');
    expect(screen.getByPlaceholderText('https://example.com')).toHaveValue('https://acme.com');
    expect(screen.getByPlaceholderText('https://example.com/logo.png')).toHaveValue('https://acme.com/logo.png');
    expect(screen.getByPlaceholderText('Tell our members about your business...')).toHaveValue('A great company');
  });

  it('submits successfully', async () => {
    (updateSponsorProfileAction as any).mockResolvedValueOnce({});
    render(<SponsorProfileForm initialProfile={null} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Corporation'), { target: { value: 'New Company' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Advertising Space/i }));
    
    expect(screen.getByRole('button', { name: /Saving.../i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(updateSponsorProfileAction).toHaveBeenCalledWith({
        companyName: 'New Company',
        websiteUrl: '',
        logoUrl: '',
        bio: ''
      });
      expect(screen.getByText('Sponsor profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    (updateSponsorProfileAction as any).mockRejectedValueOnce(new Error('Network error'));
    render(<SponsorProfileForm initialProfile={null} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Acme Corporation'), { target: { value: 'New Company' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Advertising Space/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
