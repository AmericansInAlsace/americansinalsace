import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/[locale]/login/page';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/features/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders correctly', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const Result = await LoginPage({ params });
    render(Result);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Join the community')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
