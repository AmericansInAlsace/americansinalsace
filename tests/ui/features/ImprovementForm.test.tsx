import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImprovementForm from '@/components/features/backoffice/ImprovementForm';
import { vi, describe, it, expect } from 'vitest';
import * as actions from '@/app/actions/improvements';

vi.mock('@/app/actions/improvements', () => ({
  submitImprovement: vi.fn(),
}));

describe('ImprovementForm UI', () => {
  const categories = [
    { id: 1, name: 'General' },
    { id: 2, name: 'Events' },
  ];

  it('renders correctly', () => {
    render(<ImprovementForm categories={categories} />);
    expect(screen.getByText('Submit an Improvement')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create JIRA Ticket/i })).toBeInTheDocument();
  });

  it('submits improvement successfully', async () => {
    vi.mocked(actions.submitImprovement).mockResolvedValue({ success: true, jiraKey: 'AIA-123' });

    render(<ImprovementForm categories={categories} />);
    
    fireEvent.change(screen.getByPlaceholderText('Brief summary of the enhancement'), { target: { value: 'New Feature' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Events' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create JIRA Ticket/i }));

    await waitFor(() => {
      expect(actions.submitImprovement).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'New Feature',
        category: 'Events',
      }));
      expect(screen.getByText(/Improvement submitted successfully/)).toBeInTheDocument();
    });
  });
});
