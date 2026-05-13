import { render, screen } from '@testing-library/react';
import RolesAdminPage from '@/app/[locale]/backoffice/roles/page';
import { prisma } from '@/lib/db';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    role: {
      findMany: vi.fn(),
    },
    permission: {
      findMany: vi.fn(),
    },
  },
}));

describe('RolesAdminPage', () => {
  it('renders correctly', async () => {
    vi.mocked(prisma.role.findMany).mockResolvedValue([
      { id: 1, name: 'Admin', permissions: [{ id: 1, resource: 'users', action: 'manage' }], _count: { users: 5 } },
    ] as any);
    
    vi.mocked(prisma.permission.findMany).mockResolvedValue([
      { id: 1, resource: 'users', action: 'manage' },
    ] as any);

    const Result = await RolesAdminPage();
    render(Result);

    expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('users:manage')).toBeInTheDocument();
  });
});
