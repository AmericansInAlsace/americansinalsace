import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BugReportForm from '@/components/features/BugReportForm';
import * as bugsActions from '@/app/actions/bugs';

vi.mock('@/app/actions/bugs', () => ({
  submitBugReport: vi.fn(),
}));

describe('BugReportForm', () => {
  it('renders the form correctly', () => {
    render(<BugReportForm />);
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    render(<BugReportForm hideHeader={true} />);
    expect(screen.queryByText('Report a Bug')).not.toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const mockSubmit = vi.mocked(bugsActions.submitBugReport).mockResolvedValue({ jiraKey: 'BUG-123' } as any);
    const onSuccess = vi.fn();
    
    render(<BugReportForm onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Bug' } });
    fireEvent.click(screen.getByText('Submit Bug Report'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Test Bug' }));
      expect(onSuccess).toHaveBeenCalledWith('BUG-123');
    });
  });

  it('shows error on submission failure', async () => {
    vi.mocked(bugsActions.submitBugReport).mockRejectedValue(new Error('Submission failed'));
    
    render(<BugReportForm />);
    
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test Bug' } });
    fireEvent.click(screen.getByText('Submit Bug Report'));
    
    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });
});
