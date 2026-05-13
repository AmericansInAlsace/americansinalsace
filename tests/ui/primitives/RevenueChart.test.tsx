import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RevenueChart from '@/components/ui/RevenueChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('RevenueChart', () => {
  it('renders "No revenue data available" when data is empty', () => {
    render(<RevenueChart data={[]} />);
    expect(screen.getByText('No revenue data available.')).toBeInTheDocument();
  });

  it('renders "No revenue data available" when data is undefined', () => {
    // @ts-ignore
    render(<RevenueChart data={undefined} />);
    expect(screen.getByText('No revenue data available.')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const data = [{ month: 'Jan', revenue: 1000 }];
    render(<RevenueChart data={data} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('renders previous revenue line when data includes previousRevenue', () => {
    const data = [{ month: 'Jan', revenue: 1000, previousRevenue: 800 }];
    render(<RevenueChart data={data} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
