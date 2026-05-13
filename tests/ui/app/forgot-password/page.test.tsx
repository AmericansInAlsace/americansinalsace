import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '@/app/[locale]/forgot-password/page';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/features/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form" />,
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  it('renders correctly', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const Result = await ForgotPasswordPage({ params });
    render(Result);

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByText('Go back to login')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
