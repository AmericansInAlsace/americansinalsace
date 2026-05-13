import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import EventCategoriesAdminPage from '@/app/[locale]/backoffice/events/categories/page';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    eventCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe('EventCategoriesAdminPage', () => {
  it('renders correctly', async () => {
    vi.mocked(prisma.eventCategory.findMany).mockResolvedValue([
      { id: 1, name: 'Tech', description: 'Tech events', _count: { events: 5 } } as any,
    ]);

    const Result = await EventCategoriesAdminPage();
    render(Result);

    expect(screen.getByText('Event Categories')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Tech events')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
