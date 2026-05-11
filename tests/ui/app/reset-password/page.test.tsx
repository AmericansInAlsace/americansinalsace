import { render, screen } from '@testing-library/react';
import ResetPasswordPage from '@/app/[locale]/reset-password/page';
import { describe, it, expect, vi } from 'vitest';

// Mock ResetPasswordForm
vi.mock('@/components/features/auth/ResetPasswordForm', () => ({
  ResetPasswordForm: () => <div data-testid="reset-password-form">ResetPasswordForm</div>,
}));

describe('ResetPasswordPage', () => {
  it('should render the reset password page', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });
});
