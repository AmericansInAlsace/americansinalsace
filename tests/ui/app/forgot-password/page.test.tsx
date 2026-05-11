import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '@/app/[locale]/forgot-password/page';
import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

// Mock ForgotPasswordForm
vi.mock('@/components/features/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">ForgotPasswordForm</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('ForgotPasswordPage', () => {
  it('should render the forgot password page', async () => {
    const params = { locale: 'en' };
    const Result = await ForgotPasswordPage({ params });
    render(Result);

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });
});
