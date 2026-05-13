import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BugReportModal from '@/components/features/BugReportModal';
import { vi, describe, it, expect } from 'vitest';

// Mock BugReportForm
vi.mock('@/components/features/BugReportForm', () => ({
  default: ({ onSuccess }: { onSuccess: (key: string) => void }) => (
    <div data-testid="mock-bug-form">
      <button onClick={() => onSuccess('AIA-999')}>Submit Mock</button>
    </div>
  ),
}));

describe('BugReportModal UI', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<BugReportModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when isOpen is true', () => {
    render(<BugReportModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bug-form')).toBeInTheDocument();
  });

  it('shows success popover on success and closes', () => {
    const handleClose = vi.fn();
    render(<BugReportModal isOpen={true} onClose={handleClose} />);
    
    fireEvent.click(screen.getByText('Submit Mock'));
    
    expect(screen.getByText('Report Submitted!')).toBeInTheDocument();
    expect(screen.getByText('Ticket ID: AIA-999')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Got it, thanks!'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on X button click', () => {
    const handleClose = vi.fn();
    render(<BugReportModal isOpen={true} onClose={handleClose} />);
    
    fireEvent.click(screen.getByText('✕'));
    expect(handleClose).toHaveBeenCalled();
  });
});
