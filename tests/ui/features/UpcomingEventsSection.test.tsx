import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UpcomingEventsSection from '@/components/features/home/UpcomingEventsSection';
import { EventService } from '@/services/EventService';

vi.mock('@/services/EventService', () => ({
  EventService: {
    getUpcomingEvents: vi.fn(),
  }
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ui/EventCard', () => ({
  EventCard: ({ event }: any) => <div data-testid="event-card">{event.title}</div>,
}));

describe('UpcomingEventsSection', () => {
  it('renders "noEvents" when there are no events', async () => {
    vi.mocked(EventService.getUpcomingEvents).mockResolvedValue([]);
    const Component = await UpcomingEventsSection();
    render(Component as React.ReactElement);
    expect(screen.getByText('noEvents')).toBeInTheDocument();
  });

  it('renders events when they exist', async () => {
    vi.mocked(EventService.getUpcomingEvents).mockResolvedValue([
      { id: 1, title: 'Event 1' } as any,
    ]);
    const Component = await UpcomingEventsSection();
    render(Component as React.ReactElement);
    expect(screen.getByTestId('event-card')).toBeInTheDocument();
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText(/viewAllEvents/)).toBeInTheDocument();
  });
});
