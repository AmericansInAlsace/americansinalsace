import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionTable from '@/components/ui/TransactionTable';

vi.mock('@/components/ui/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <div data-testid="data-table">
      {data.map((row: any, i: number) => (
        <div key={i} data-testid="data-row">
          {columns.map((col: any, j: number) => (
            <span key={j}>{col.cell(row)}</span>
          ))}
        </div>
      ))}
    </div>
  )
}));

vi.mock('@/lib/formatters', () => ({
  formatCurrency: vi.fn((amount) => '€' + amount)
}));

describe('TransactionTable', () => {
  it('renders transaction table correctly', () => {
    const transactions = [
      {
        id: 1,
        userId: 10,
        amount: 50,
        currency: 'EUR',
        type: 'MEMBERSHIP',
        status: 'SUCCESS',
        transactionDate: '2023-01-01T00:00:00.000Z',
        user: { id: 10, email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
        description: 'Yearly membership',
        paypalTransactionId: 'PAYPAL123'
      }
    ];
    render(<TransactionTable transactions={transactions} />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    
    // Check cell renderings
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('MEMBERSHIP')).toBeInTheDocument();
    expect(screen.getByText('€50')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    expect(screen.getByText('Yearly membership')).toBeInTheDocument();
    expect(screen.getByText('PAYPAL123')).toBeInTheDocument();
  });
  
  it('handles fallback values when fields are missing', () => {
    const transactions = [
      {
        id: 2,
        userId: 11,
        amount: 25,
        currency: 'USD',
        type: 'MANUAL_PAYMENT',
        status: 'PENDING',
        transactionDate: '2023-01-02T00:00:00.000Z',
      }
    ];
    render(<TransactionTable transactions={transactions} />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument(); // No user
    expect(screen.getByText('MANUAL PAYMENT')).toBeInTheDocument();
    expect(screen.getByText('€25')).toBeInTheDocument(); // Formatter mocked
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0); // Description & PayPal ID fallbacks
  });
});
