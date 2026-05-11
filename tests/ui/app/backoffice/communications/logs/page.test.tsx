import { render, screen } from '@testing-library/react';
import EmailLogsPage from '@/app/[locale]/backoffice/communications/logs/page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    emailLog: {
      findMany: vi.fn(),
    },
  },
}));

describe('EmailLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email logs table', async () => {
    const mockLogs = [
      { id: 1, recipient: 'user@example.com', subject: 'Test', sentAt: new Date('2026-01-01T10:00:00'), status: 'SUCCESS', error: null },
      { id: 2, recipient: 'fail@example.com', subject: 'Fail', sentAt: new Date('2026-01-01T11:00:00'), status: 'FAILED', error: 'SMTP Error' },
    ];

    vi.mocked(prisma.emailLog.findMany).mockResolvedValue(mockLogs as any);

    const Result = await EmailLogsPage();
    render(Result);

    expect(screen.getByText('Delivery Logs')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    expect(screen.getByText('fail@example.com')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('SMTP Error')).toBeInTheDocument();
  });

  it('should render empty state', async () => {
    vi.mocked(prisma.emailLog.findMany).mockResolvedValue([]);

    const Result = await EmailLogsPage();
    render(Result);

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});
