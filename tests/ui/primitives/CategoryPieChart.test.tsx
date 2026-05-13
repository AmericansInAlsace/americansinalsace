import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryPieChart from '@/components/ui/CategoryPieChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('CategoryPieChart', () => {
  it('renders "No category data available" when data is empty', () => {
    render(<CategoryPieChart data={[]} />);
    expect(screen.getByText('No category data available.')).toBeInTheDocument();
  });

  it('renders "No category data available" when data is undefined', () => {
    // @ts-ignore
    render(<CategoryPieChart data={undefined} />);
    expect(screen.getByText('No category data available.')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const data = [{ name: 'A', value: 10 }];
    render(<CategoryPieChart data={data} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});
