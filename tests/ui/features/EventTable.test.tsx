import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventTable } from '@/components/features/backoffice/EventTable';
import React from 'react';

vi.mock('@/app/[locale]/backoffice/events/EventActions', () => ({
  default: () => <div data-testid="event-actions" />
}));

vi.mock('@/lib/formatters', () => ({
  formatCurrency: (val: number) => `$${val}`
}));

describe('EventTable', () => {
  it('renders correctly with events', () => {
    const events = [
      {
        id: 1,
        title: 'Test Event 1',
        date: new Date('2024-01-01T10:00:00Z'),
        location: 'Paris',
        category: { name: 'Tech' },
        categoryId: 1,
        capacity: 10,
        _count: { rsvps: 2 },
        memberPrice: 10,
        nonMemberPrice: 20,
        published: true
      },
      {
        id: 2,
        title: 'Hidden Event',
        date: new Date('2024-02-01T10:00:00Z'),
        location: 'Berlin',
        category: { name: 'Art' },
        categoryId: 2,
        capacity: 0,
        _count: { rsvps: 0 },
        memberPrice: 0,
        nonMemberPrice: 0,
        published: false
      }
    ];
    const categories = [
      { id: 1, name: 'Tech' },
      { id: 2, name: 'Art' }
    ];

    render(<EventTable events={events} categories={categories} />);
    
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getAllByText('Tech').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Visible').length).toBeGreaterThan(0);
    
    expect(screen.getByText('Hidden Event')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getAllByText('Art').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hidden').length).toBeGreaterThan(0);
    
    expect(screen.getAllByTestId('event-actions')).toHaveLength(2);
  });

  it('renders correctly with empty events', () => {
    render(<EventTable events={[]} categories={[]} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});
