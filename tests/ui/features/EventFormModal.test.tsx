import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventFormModal from '@/components/features/backoffice/EventFormModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import * as actions from '@/app/actions/backoffice';

// Mock dependencies
vi.mock('@/app/actions/backoffice', () => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));

// Mock EmailEditor before it's imported by EventFormModal if possible,
// but since it's already imported, we use vi.mock which is hoisted.
vi.mock('@/components/features/backoffice/EmailEditor', () => ({
  EmailEditor: ({ value, onChange, __test_loading }: any) => {
    if (__test_loading) return <div data-testid="quill-loading">Loading...</div>;
    return (
      <div data-testid="mock-email-editor">
        <textarea 
          data-testid="description-textarea"
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
        />
      </div>
    );
  }
}));

const mockCategories = [
  { id: 1, name: 'Social' },
  { id: 2, name: 'Cultural' },
];

const mockEvent = {
  id: 123,
  title: 'Existing Event',
  description: '<p>Old description</p>',
  location: 'Old Location',
  date: '2023-10-10T10:00:00.000Z',
  capacity: 50,
  memberPrice: 10,
  nonMemberPrice: 20,
  published: true,
  categoryId: 1,
};

describe('EventFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<EventFormModal isOpen={false} onClose={() => {}} categories={mockCategories} />);
    expect(screen.queryByText('Create New Event')).not.toBeInTheDocument();
  });

  it('should render creation form correctly', () => {
    render(<EventFormModal isOpen={true} onClose={() => {}} categories={mockCategories} />);
    expect(screen.getByText('Create New Event')).toBeInTheDocument();
    expect((screen.getByLabelText('Event Title') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('1');
  });

  it('should render edit form correctly', async () => {
    render(<EventFormModal isOpen={true} onClose={() => {}} categories={mockCategories} event={mockEvent} />);
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect((screen.getByLabelText('Event Title') as HTMLInputElement).value).toBe('Existing Event');
    
    const editor = await screen.findByTestId('description-textarea');
    expect((editor as HTMLTextAreaElement).value).toBe('<p>Old description</p>');
    
    const checkbox = screen.getByLabelText('Visible to Community') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should handle input changes', () => {
    render(<EventFormModal isOpen={true} onClose={() => {}} categories={mockCategories} />);
    
    const titleInput = screen.getByLabelText('Event Title');
    fireEvent.change(titleInput, { target: { name: 'title', value: 'New Event Title' } });
    expect((titleInput as HTMLInputElement).value).toBe('New Event Title');

    const publishedCheckbox = screen.getByLabelText('Visible to Community');
    fireEvent.click(publishedCheckbox);
    expect((publishedCheckbox as HTMLInputElement).checked).toBe(true);
  });

  it('should handle description change from EmailEditor', async () => {
    render(<EventFormModal isOpen={true} onClose={() => {}} categories={mockCategories} />);
    const editor = await screen.findByTestId('description-textarea');
    fireEvent.change(editor, { target: { value: 'New HTML Content' } });
    expect((editor as HTMLTextAreaElement).value).toBe('New HTML Content');
  });

  it('should call createEvent on new event submission', async () => {
    const onClose = vi.fn();
    vi.mocked(actions.createEvent).mockResolvedValue({} as any);

    render(<EventFormModal isOpen={true} onClose={onClose} categories={mockCategories} />);
    
    fireEvent.change(screen.getByLabelText('Event Title'), { target: { name: 'title', value: 'New Event' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { name: 'location', value: 'New Location' } });
    fireEvent.change(screen.getByLabelText('Date & Time'), { target: { name: 'date', value: '2023-10-10T10:00' } });
    
    fireEvent.click(screen.getByText('Create Event'));

    await waitFor(() => {
      expect(actions.createEvent).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should call updateEvent on existing event submission', async () => {
    const onClose = vi.fn();
    vi.mocked(actions.updateEvent).mockResolvedValue({} as any);

    render(<EventFormModal isOpen={true} onClose={onClose} categories={mockCategories} event={mockEvent} />);
    
    fireEvent.click(screen.getByText('Update Event'));

    await waitFor(() => {
      expect(actions.updateEvent).toHaveBeenCalledWith(mockEvent.id, expect.any(Object));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should display error message on failure', async () => {
    vi.mocked(actions.createEvent).mockRejectedValue(new Error('Failed to create event'));

    render(<EventFormModal isOpen={true} onClose={() => {}} categories={mockCategories} />);
    
    fireEvent.change(screen.getByLabelText('Event Title'), { target: { name: 'title', value: 'New Event' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { name: 'location', value: 'New Location' } });
    fireEvent.change(screen.getByLabelText('Date & Time'), { target: { name: 'date', value: '2023-10-10T10:00' } });

    fireEvent.click(screen.getByText('Create Event'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create event')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<EventFormModal isOpen={true} onClose={onClose} categories={mockCategories} />);
    
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<EventFormModal isOpen={true} onClose={onClose} categories={mockCategories} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
