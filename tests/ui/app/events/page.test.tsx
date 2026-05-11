import { render, screen } from '@testing-library/react';
import EventsPage from '@/app/[locale]/events/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    event: {
      findMany: vi.fn(),
    },
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render event listing', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Summer BBQ',
        description: 'Fun in the sun',
        date: new Date('2026-07-04T12:00:00'),
        location: 'Strasbourg Park',
        published: true,
        memberPrice: 0,
        capacity: 100,
        category: { name: 'Social' },
        _count: { rsvps: 25 }
      }
    ];

    vi.mocked(prisma.event.findMany).mockResolvedValue(mockEvents as any);

    const Result = await EventsPage();
    render(Result);

    expect(screen.getByText('Community Events')).toBeInTheDocument();
    expect(screen.getByText('Summer BBQ')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
    expect(screen.getByText('04 Jul 2026')).toBeInTheDocument();
    expect(screen.getByText(/25 \/ 100 attending/i)).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([]);

    const Result = await EventsPage();
    render(Result);

    expect(screen.getByText(/No upcoming events scheduled/i)).toBeInTheDocument();
  });
});
