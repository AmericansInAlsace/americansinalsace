import { render, screen } from '@testing-library/react';
import SystemLogsPage from '@/app/[locale]/backoffice/system/logs/page';
import { getSystemLogs, getLogStats } from '@/app/actions/system';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/app/actions/system', () => ({
  getSystemLogs: vi.fn(),
  getLogStats: vi.fn(),
}));

vi.mock('@/components/features/backoffice/LogTable', () => ({
  LogTable: () => <div data-testid="log-table" />,
}));

vi.mock('@/components/features/backoffice/LogChart', () => ({
  LogChart: () => <div data-testid="log-chart" />,
}));

describe('SystemLogsPage', () => {
  it('renders correctly', async () => {
    vi.mocked(getSystemLogs).mockResolvedValue({ logs: [], total: 0 } as any);
    vi.mocked(getLogStats).mockResolvedValue([] as any);

    const Result = await SystemLogsPage();
    render(Result);

    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.getByTestId('log-table')).toBeInTheDocument();
    expect(screen.getByTestId('log-chart')).toBeInTheDocument();
  });
});
