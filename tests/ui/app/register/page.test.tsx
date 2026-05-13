import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/[locale]/register/page';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/features/auth/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

describe('RegisterPage', () => {
  it('renders correctly', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const Result = await RegisterPage({ params });
    render(Result);

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByText('Log in here')).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
