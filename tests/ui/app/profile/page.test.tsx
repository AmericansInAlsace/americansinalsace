import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/[locale]/profile/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSession } from 'next-auth';
import { AuthService } from '@/services/AuthService';
import { MembershipService } from '@/services/MembershipService';
import { redirect } from 'next/navigation';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock services
vi.mock('@/services/AuthService', () => ({
  AuthService: {
    getUserByEmail: vi.fn(),
  },
}));

vi.mock('@/services/MembershipService', () => ({
  MembershipService: {
    getUserSubscription: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock components
vi.mock('@/components/features/profile/ProfileForm', () => ({
  ProfileForm: () => <div data-testid="profile-form">Profile Form</div>,
}));

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await ProfilePage();
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('should render profile for authenticated user', async () => {
    const mockUser = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
    vi.mocked(AuthService.getUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(MembershipService.getUserSubscription).mockResolvedValue(null);

    const Result = await ProfilePage();
    render(Result);

    expect(screen.getByText('Member Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByText('Get Membership')).toBeInTheDocument();
  });

  it('should render subscription details if present', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockSub = {
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      tier: { name: 'Gold' }
    };
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@example.com' } } as any);
    vi.mocked(AuthService.getUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(MembershipService.getUserSubscription).mockResolvedValue(mockSub as any);

    const Result = await ProfilePage();
    render(Result);

    expect(screen.getByText('Membership Details')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('01 Jan 2027')).toBeInTheDocument();
  });
});
