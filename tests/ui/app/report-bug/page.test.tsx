import React, { Suspense } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReportBugPage from '@/app/[locale]/report-bug/page';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/components/features/BugReportForm', () => ({
  default: ({ onSuccess }: { onSuccess: (key: string) => void }) => (
    <button data-testid="bug-report-form" onClick={() => onSuccess('JIRA-123')}>
      Submit
    </button>
  )
}));
vi.mock('@/i18n/routing', () => ({
  Link: ({ children }: any) => <a>{children}</a>
}));

describe('ReportBugPage', () => {
  it('renders correctly', async () => {
    const params = Promise.resolve({ locale: 'en' });
    
    await act(async () => {
      render(
        <Suspense fallback="Loading...">
          <ReportBugPage params={params} />
        </Suspense>
      );
    });

    expect(await screen.findByText('Help Us Improve')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('bug-report-form'));
    });
    
    expect(screen.getByText('Thank You!')).toBeInTheDocument();
    expect(screen.getByText('JIRA Ticket: JIRA-123')).toBeInTheDocument();
  });
});
