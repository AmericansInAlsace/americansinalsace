import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDetailsModal from '@/components/features/backoffice/UserDetailsModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import * as gdprActions from '@/app/actions/gdpr';

// Mock actions
vi.mock('@/app/actions/gdpr', () => ({
  exportUserData: vi.fn(),
  anonymizeUserData: vi.fn(),
}));

// Mock ConfirmationModal
vi.mock('@/components/ui/ConfirmationModal', () => ({
  ConfirmationModal: ({ isOpen, onConfirm, onClose, title, message }: any) => isOpen ? (
    <div data-testid="confirmation-modal">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ) : null
}));

const mockUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  emailVerified: true,
  role: { name: 'Member' },
  phone: '123456789',
  createdAt: '2023-01-01T12:00:00.000Z',
  bio: 'A brief bio.',
  subscription: {
    tier: { name: 'Premium' },
    status: 'ACTIVE',
    endDate: '2024-01-01T12:00:00.000Z',
  },
};

describe('UserDetailsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<UserDetailsModal isOpen={false} user={mockUser} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render user details correctly', () => {
    render(<UserDetailsModal isOpen={true} user={mockUser} onClose={() => {}} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('A brief bio.')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Status: ACTIVE')).toBeInTheDocument();
  });

  it('should handle missing subscription', () => {
    const userNoSub = { ...mockUser, subscription: null };
    render(<UserDetailsModal isOpen={true} user={userNoSub} onClose={() => {}} />);
    expect(screen.getByText('No active membership plan found.')).toBeInTheDocument();
  });

  it('should handle export data', async () => {
    vi.mocked(gdprActions.exportUserData).mockResolvedValue({} as any);
    render(<UserDetailsModal isOpen={true} user={mockUser} onClose={() => {}} />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(gdprActions.exportUserData).toHaveBeenCalledWith(mockUser.id);
    await waitFor(() => {
      expect(screen.getByText(`Data export has been sent to ${mockUser.email}`)).toBeInTheDocument();
    });
  });

  it('should handle export error', async () => {
    vi.mocked(gdprActions.exportUserData).mockRejectedValue(new Error('Export failed'));
    render(<UserDetailsModal isOpen={true} user={mockUser} onClose={() => {}} />);
    
    fireEvent.click(screen.getByText('Export'));

    await waitFor(() => {
      expect(screen.getByText('Export failed')).toBeInTheDocument();
    });
  });

  it('should handle anonymization flow', async () => {
    vi.mocked(gdprActions.anonymizeUserData).mockResolvedValue({} as any);
    render(<UserDetailsModal isOpen={true} user={mockUser} onClose={() => {}} />);
    
    const anonymizeButton = screen.getByText('Anonymize');
    fireEvent.click(anonymizeButton);

    // Should open confirmation modal
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    expect(screen.getByText('Anonymize User Record?')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);

    expect(gdprActions.anonymizeUserData).toHaveBeenCalledWith(mockUser.id);
    await waitFor(() => {
      expect(screen.getByText('User has been successfully anonymized.')).toBeInTheDocument();
    });
  });

  it('should call onClose when clicking close buttons', () => {
    const onClose = vi.fn();
    render(<UserDetailsModal isOpen={true} user={mockUser} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Close Window'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
