import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';
import { handleResetPassword } from '@/app/actions/reset-password';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSearchParams, useRouter } from 'next/navigation';

vi.mock('@/app/actions/reset-password', () => ({
  handleResetPassword: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

describe('ResetPasswordForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('should render invalid link message if token is missing', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as any);

    render(<ResetPasswordForm />);

    expect(screen.getByText(/Invalid Link/i)).toBeInTheDocument();
  });

  it('should render correctly if token is present', () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('test-token'),
    } as any);

    render(<ResetPasswordForm />);

    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
  });

  it('should display success message and redirect on success', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('test-token'),
    } as any);
    vi.mocked(handleResetPassword).mockResolvedValue({ success: true });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    expect(await screen.findByText(/successfully/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 4000 });
  });

  it('should display error message on failure', async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue('test-token'),
    } as any);
    vi.mocked(handleResetPassword).mockResolvedValue({ error: 'Passwords do not match' });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Passwords do not match/i);
  });
});
