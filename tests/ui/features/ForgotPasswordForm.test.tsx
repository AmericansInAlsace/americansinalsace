import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';
import { handleRequestReset } from '@/app/actions/reset-password';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/actions/reset-password', () => ({
  handleRequestReset: vi.fn(),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('should call handleRequestReset on submit', async () => {
    vi.mocked(handleRequestReset).mockResolvedValue({ success: true });
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    expect(await screen.findByText(/If an account exists/i)).toBeInTheDocument();
  });

  it('should display error message on failure', async () => {
    vi.mocked(handleRequestReset).mockResolvedValue({ error: 'Too many requests' });
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many requests/i);
  });
});
