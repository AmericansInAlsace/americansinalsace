import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmailLogTable } from '@/components/features/backoffice/EmailLogTable';
import { describe, it, expect } from 'vitest';

describe('EmailLogTable UI', () => {
  const logs = [
    { id: 1, sentAt: new Date('2023-01-01T10:00:00Z'), recipient: 'test@example.com', subject: 'Test Subject', status: 'SUCCESS', error: null },
    { id: 2, sentAt: new Date('2023-01-02T10:00:00Z'), recipient: 'error@example.com', subject: 'Error Subject', status: 'FAILED', error: 'SMTP Error' },
  ];

  it('renders logs correctly', () => {
    render(<EmailLogTable logs={logs} />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('error@example.com')).toBeInTheDocument();
    expect(screen.getByText('Error Subject')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('SMTP Error')).toBeInTheDocument();
  });
});
