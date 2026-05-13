import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LogChart } from '@/components/features/backoffice/LogChart';
import React from 'react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('LogChart', () => {
  it('renders chart with data', () => {
    const data = [
      { date: '2024-01-01', errors: 2, warnings: 5 }
    ];

    render(<LogChart data={data} />);
    
    expect(screen.getByText('System Health (Last 14 Days)')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar')).toHaveLength(2); // Errors and Warnings
  });
});
