import { render, screen } from '@testing-library/react';
import UsersAdminPage from '@/app/[locale]/backoffice/users/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    role: {
      findMany: vi.fn(),
    },
  },
}));

// Mock components
vi.mock('@/components/features/backoffice/UserRoleSelector', () => ({
  UserRoleSelector: () => <div data-testid="role-selector">Role Selector</div>,
}));

describe('UsersAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user table', async () => {
    const mockUsers = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        emailVerified: new Date(),
        roleId: 1,
        createdAt: new Date('2026-01-01'),
        subscription: { tier: { name: 'Gold' }, status: 'active' }
      }
    ];
    const mockRoles = [{ id: 1, name: 'ADMIN' }];

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(prisma.role.findMany).mockResolvedValue(mockRoles as any);

    const Result = await UsersAdminPage();
    render(Result);

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
  });
});
