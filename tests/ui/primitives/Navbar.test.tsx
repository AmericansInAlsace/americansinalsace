import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navbar } from '@/components/ui/Navbar';
import { useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

// Mock the hooks
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>,
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe('Navbar', () => {
  const mockRouter = {
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslations as any).mockReturnValue((key: string) => key);
    (useLocale as any).mockReturnValue('en');
    (useRouter as any).mockReturnValue(mockRouter);
    (usePathname as any).mockReturnValue('/');
  });

  it('renders loading state correctly', () => {
    (useSession as any).mockReturnValue({ data: null, status: 'loading' });
    render(<Navbar />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders unauthenticated state correctly', () => {
    (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Navbar />);

    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('register')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('sponsors')).toBeInTheDocument();
    expect(screen.queryByText('membership')).not.toBeInTheDocument();
  });

  it('renders authenticated state correctly without backoffice access', () => {
    (useSession as any).mockReturnValue({
      data: { user: { name: 'John Doe', permissions: [] } },
      status: 'authenticated',
    });
    render(<Navbar />);

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('membership')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
    expect(screen.queryByText('Backoffice')).not.toBeInTheDocument();
  });

  it('renders authenticated state with backoffice access', () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          name: 'Admin',
          permissions: [{ resource: 'Backoffice', action: 'READ' }],
        },
      },
      status: 'authenticated',
    });
    render(<Navbar />);

    expect(screen.getByText('Backoffice')).toBeInTheDocument();
  });

  it('handles locale switching', () => {
    (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Navbar />);

    const frButton = screen.getByLabelText('Passer en Français');
    fireEvent.click(frButton);

    expect(mockRouter.replace).toHaveBeenCalledWith('/', { locale: 'fr' });

    const enButton = screen.getByLabelText('Switch to English');
    fireEvent.click(enButton);
    expect(mockRouter.replace).toHaveBeenCalledWith('/', { locale: 'en' });
  });

  it('handles sign out', () => {
    (useSession as any).mockReturnValue({
      data: { user: { name: 'John Doe' } },
      status: 'authenticated',
    });
    render(<Navbar />);

    const logoutButton = screen.getByText('logout');
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('highlights active locale', () => {
    (useLocale as any).mockReturnValue('fr');
    (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Navbar />);

    const frButton = screen.getByLabelText('Passer en Français');
    expect(frButton).toHaveClass('bg-blue-100');
  });
});
