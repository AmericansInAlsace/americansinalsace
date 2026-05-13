import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { handleUpdateProfile } from '@/app/actions/profile';
import { exportUserData, anonymizeUserData } from '@/app/actions/gdpr';
import { signOut } from 'next-auth/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

vi.mock('@/app/actions/profile', () => ({
  handleUpdateProfile: vi.fn(),
}));

vi.mock('@/app/actions/gdpr', () => ({
  exportUserData: vi.fn(),
  anonymizeUserData: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

describe('ProfileForm', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    bio: 'Test bio',
    phone: '123456789',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with initial values', () => {
    render(<ProfileForm user={mockUser} />);
    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com');
  });

  it('should call handleUpdateProfile on submit', async () => {
    vi.mocked(handleUpdateProfile).mockResolvedValue({ success: true });
    render(<ProfileForm user={mockUser} />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Johnny' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(handleUpdateProfile).toHaveBeenCalled();
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    vi.mocked(handleUpdateProfile).mockResolvedValue({ error: 'Update failed' });
    render(<ProfileForm user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });

  it('should handle GDPR export', async () => {
    vi.mocked(exportUserData).mockResolvedValue({} as any);
    render(<ProfileForm user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Export My Data/i }));

    await waitFor(() => {
      expect(exportUserData).toHaveBeenCalledWith(1);
      expect(screen.getByText(/Data export initiated/i)).toBeInTheDocument();
    });
  });

  it('should handle GDPR export error', async () => {
    vi.mocked(exportUserData).mockRejectedValue(new Error('Export failed'));
    render(<ProfileForm user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Export My Data/i }));

    await waitFor(() => {
      expect(screen.getByText(/Export failed/i)).toBeInTheDocument();
    });
  });

  it('should handle GDPR anonymization flow', async () => {
    vi.mocked(anonymizeUserData).mockResolvedValue({} as any);
    render(<ProfileForm user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Anonymize My Account/i }));

    // Confirmation Modal should be open
    expect(screen.getByText(/Anonymize Your Account\?/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Anonymize Irreversibly/i }));

    await waitFor(() => {
      expect(anonymizeUserData).toHaveBeenCalledWith(1);
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });

  it('should handle GDPR anonymization error', async () => {
    vi.mocked(anonymizeUserData).mockRejectedValue(new Error('Anonymization failed'));
    render(<ProfileForm user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Anonymize My Account/i }));
    fireEvent.click(screen.getByRole('button', { name: /Anonymize Irreversibly/i }));

    await waitFor(() => {
      expect(screen.getByText(/Anonymization failed/i)).toBeInTheDocument();
    });
  });
});
