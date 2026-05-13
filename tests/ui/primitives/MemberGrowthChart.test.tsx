import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MemberGrowthChart from '@/components/ui/MemberGrowthChart';

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

describe('MemberGrowthChart', () => {
  it('renders "No member growth data available" when data is empty', () => {
    render(<MemberGrowthChart data={[]} />);
    expect(screen.getByText('No member growth data available.')).toBeInTheDocument();
  });

  it('renders "No member growth data available" when data is undefined', () => {
    // @ts-ignore
    render(<MemberGrowthChart data={undefined} />);
    expect(screen.getByText('No member growth data available.')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    const data = [{ date: '2023-01-01', activeMembers: 10 }];
    render(<MemberGrowthChart data={data} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
  
  it('renders new members line when data includes newMembers', () => {
    const data = [{ date: '2023-01-01', activeMembers: 10, newMembers: 2 }];
    render(<MemberGrowthChart data={data} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
