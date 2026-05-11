import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { handleUpdateProfile } from '@/app/actions/profile';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/actions/profile', () => ({
  handleUpdateProfile: vi.fn(),
}));

describe('ProfileForm', () => {
  const mockUser = {
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
});
