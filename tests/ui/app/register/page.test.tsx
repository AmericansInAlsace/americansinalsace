import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/[locale]/register/page';
import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

// Mock RegisterForm
vi.mock('@/components/features/auth/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('RegisterPage', () => {
  it('should render the register page', async () => {
    const params = { locale: 'en' };
    const Result = await RegisterPage({ params });
    render(Result);

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
