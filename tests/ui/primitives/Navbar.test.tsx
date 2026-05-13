import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    expect(screen.getByText('backoffice')).toBeInTheDocument();
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

  describe('Mobile Menu', () => {
    beforeEach(() => {
      // Set viewport to mobile if necessary, though the component uses md:hidden classes
      // which JSDOM doesn't really "render" but we can still test the logic.
    });

    it('toggles mobile menu', () => {
      (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<Navbar />);

      const toggleButton = screen.getByLabelText('Toggle Menu');
      
      // Menu should be closed initially
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();

      // Open menu
      fireEvent.click(toggleButton);
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('✕');

      // Close menu
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('☰');
    });

    it('renders unauthenticated mobile links', () => {
      (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<Navbar />);

      fireEvent.click(screen.getByLabelText('Toggle Menu'));

      expect(screen.getByText('Account')).toBeInTheDocument();
      const loginLinks = screen.getAllByText('login');
      // One in desktop, one in mobile
      expect(loginLinks.length).toBeGreaterThan(0);
      
      const registerLinks = screen.getAllByText('register');
      expect(registerLinks.length).toBeGreaterThan(0);
    });

    it('renders authenticated mobile links with backoffice', () => {
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

      fireEvent.click(screen.getByLabelText('Toggle Menu'));

      expect(screen.getByText('backofficeDashboard')).toBeInTheDocument();
      expect(screen.getAllByText('profile').length).toBeGreaterThan(0);
      expect(screen.getAllByText('logout').length).toBeGreaterThan(0);
    });

    it('handles locale switching on mobile', () => {
      (useLocale as any).mockReturnValue('en');
      (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<Navbar />);

      // The mobile button is likely the one without aria-label and has text 'EN'
      const buttons = screen.getAllByText('EN');
      const mobileLocaleBtn = buttons.find(b => !b.hasAttribute('aria-label'));
      if (mobileLocaleBtn) fireEvent.click(mobileLocaleBtn);

      expect(mockRouter.replace).toHaveBeenCalledWith('/', { locale: 'fr' });
    });

    it('closes menu when a link is clicked', async () => {
      (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<Navbar />);

      fireEvent.click(screen.getByLabelText('Toggle Menu'));
      expect(screen.getByText('Navigation')).toBeInTheDocument();

      const homeLink = screen.getAllByText('home')[1]; // Second one is mobile
      fireEvent.click(homeLink);

      await waitFor(() => {
        expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
      });
    });
  });
});
