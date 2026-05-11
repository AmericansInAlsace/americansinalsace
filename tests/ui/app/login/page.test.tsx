import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/[locale]/login/page';
import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

// Mock LoginForm
vi.mock('@/components/features/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('LoginPage', () => {
  it('should render the login page', async () => {
    const params = { locale: 'en' };
    const Result = await LoginPage({ params });
    render(Result);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
