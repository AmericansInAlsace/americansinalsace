import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import CategoriesPage from '@/app/[locale]/backoffice/improvements/categories/page';
import * as actions from '@/app/actions/improvements';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => ({ user: { role: 'SUPERADMIN' } })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/app/actions/improvements', () => ({
  getImprovementCategories: vi.fn(),
}));

vi.mock('@/components/features/backoffice/CategoryManager', () => ({
  default: () => <div data-testid="mock-category-manager"></div>,
}));

describe('CategoriesPage', () => {
  it('renders correctly for SUPERADMIN', async () => {
    vi.mocked(actions.getImprovementCategories).mockResolvedValue([]);

    const Result = await CategoriesPage();
    render(Result);

    expect(screen.getByText('Improvement Categories')).toBeInTheDocument();
    expect(screen.getByTestId('mock-category-manager')).toBeInTheDocument();
  });
});
