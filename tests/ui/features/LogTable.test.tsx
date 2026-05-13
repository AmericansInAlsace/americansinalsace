import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LogTable } from '@/components/features/backoffice/LogTable';
import React from 'react';

describe('LogTable', () => {
  it('renders correctly with logs', () => {
    const logs = [
      { id: 1, timestamp: new Date('2024-01-01T10:00:00Z'), level: 'ERROR', origin: 'WEB', message: 'Test error', details: { code: 500 } },
      { id: 2, timestamp: new Date('2024-01-02T10:00:00Z'), level: 'INFO', origin: 'DATABASE', message: 'Test info' }
    ];

    render(<LogTable logs={logs} />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('WEB')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
    
    expect(screen.getByText('Test info')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.getByText('DATABASE')).toBeInTheDocument();
  });

  it('renders correctly with empty logs', () => {
    render(<LogTable logs={[]} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});
