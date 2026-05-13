import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MembershipTable } from '@/components/features/backoffice/MembershipTable';
import React from 'react';

vi.mock('@/app/[locale]/backoffice/membership/list/MembershipActions', () => ({
  default: () => <div data-testid="membership-actions" />
}));

describe('MembershipTable', () => {
  it('renders correctly with subscriptions', () => {
    const subscriptions = [
      {
        id: 1,
        user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        tier: { name: 'Premium' },
        tierId: 2,
        status: 'ACTIVE',
        startDate: new Date('2024-01-01T10:00:00Z'),
        endDate: new Date('2025-01-01T10:00:00Z')
      },
      {
        id: 2,
        user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        tier: { name: 'Basic' },
        tierId: 1,
        status: 'PENDING',
        startDate: null,
        endDate: null
      }
    ];
    const availableTiers = [
      { id: 1, name: 'Basic' },
      { id: 2, name: 'Premium' }
    ];

    render(<MembershipTable subscriptions={subscriptions} availableTiers={availableTiers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Premium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Basic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    
    // There might be multiple elements with "---" or "No data available" but for null date it shows "---"
    expect(screen.getAllByText('---').length).toBeGreaterThan(0);
    
    expect(screen.getAllByTestId('membership-actions')).toHaveLength(2);
  });

  it('renders correctly with empty subscriptions', () => {
    render(<MembershipTable subscriptions={[]} availableTiers={[]} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});
