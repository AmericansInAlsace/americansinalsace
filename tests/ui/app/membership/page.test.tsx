import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MembershipPage from '@/app/[locale]/membership/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  useRouter: vi.fn(),
}));

// Mock PayPal
vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: any) => <div>{children}</div>,
  PayPalButtons: () => <div data-testid="paypal-buttons">PayPal Buttons</div>,
}));

// Mock fetch
global.fetch = vi.fn();
global.alert = vi.fn();

describe('MembershipPage', () => {
  const mockTiers = [
    { id: 1, name: 'Basic', description: 'Basic tier', price: 20, paypalPlanId: 'P-1' },
    { id: 2, name: 'Premium', description: 'Premium tier', price: 50, paypalPlanId: 'P-2' },
  ];

  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    // Default fetch mock to prevent unhandled rejections
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ tiers: mockTiers }),
      ok: true,
    } as any);
  });

  it('should render loading state', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading', data: null } as any);
    render(<MembershipPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('should render login prompt for unauthenticated users', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated', data: null } as any);
    render(<MembershipPage />);
    expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Go to Login/i }));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should render tiers and allow selection', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 1 } }
    } as any);

    render(<MembershipPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Basic' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('heading', { name: 'Premium' }));
    const confirmationMsg = screen.getByText(/You are subscribing to the/i);
    expect(confirmationMsg).toBeInTheDocument();
    expect(confirmationMsg).toHaveTextContent(/Premium/i);
  });

  it('should handle mock payment', async () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 1 } }
    } as any);

    vi.mocked(fetch)
      .mockResolvedValueOnce({ json: async () => ({ tiers: mockTiers }), ok: true } as any) // fetch tiers
      .mockResolvedValueOnce({ ok: true } as any); // mock payment

    render(<MembershipPage />);

    await waitFor(() => screen.getByRole('heading', { name: 'Basic' }));

    const mockBtn = screen.getByText(/Mock Payment Success/i);
    fireEvent.click(mockBtn);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Successful'));
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });
});
