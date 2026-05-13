import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import EventsAdminPage from '@/app/[locale]/backoffice/events/page';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    event: {
      findMany: vi.fn(),
    },
    eventCategory: {
      findMany: vi.fn(),
    },
  },
}));

// Mock the child component to simplify testing
vi.mock('@/components/features/backoffice/EventTable', () => ({
  EventTable: () => <div data-testid="mock-event-table"></div>,
}));

describe('EventsAdminPage', () => {
  it('renders correctly', async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([]);
    vi.mocked(prisma.eventCategory.findMany).mockResolvedValue([]);

    const Result = await EventsAdminPage();
    render(Result);

    expect(screen.getByText('Events Command Center')).toBeInTheDocument();
    expect(screen.getByTestId('mock-event-table')).toBeInTheDocument();
  });
});
