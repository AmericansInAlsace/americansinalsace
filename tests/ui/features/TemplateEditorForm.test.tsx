import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateEditorForm } from '@/components/features/backoffice/TemplateEditorForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailActions from '@/app/actions/email';

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

vi.mock('@/app/actions/email', () => ({
  updateEmailTemplate: vi.fn(),
}));

vi.mock('@/components/features/backoffice/EmailEditor', () => ({
  EmailEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('TemplateEditorForm', () => {
  const mockTemplate = {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to AIA',
    content: '<p>Welcome!</p>',
    slug: 'welcome',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it('should render form with template data', () => {
    render(<TemplateEditorForm template={mockTemplate} />);
    expect(screen.getByLabelText(/Display Name/)).toHaveValue(mockTemplate.name);
    expect(screen.getByLabelText(/Email Subject/)).toHaveValue(mockTemplate.subject);
    expect(screen.getByTestId('mock-editor')).toHaveValue(mockTemplate.content);
  });

  it('should call updateEmailTemplate on save', async () => {
    vi.mocked(emailActions.updateEmailTemplate).mockResolvedValue({ success: true } as any);

    render(<TemplateEditorForm template={mockTemplate} />);

    fireEvent.change(screen.getByLabelText(/Display Name/), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText(/Save Template Changes/));

    await waitFor(() => {
      expect(emailActions.updateEmailTemplate).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'New Name',
      }));
    });
    expect(window.alert).toHaveBeenCalledWith('Template updated successfully!');
    expect(mockPush).toHaveBeenCalledWith('/backoffice/communications/templates');
  });

  it('should handle save error', async () => {
    vi.mocked(emailActions.updateEmailTemplate).mockRejectedValue(new Error('Fail'));

    render(<TemplateEditorForm template={mockTemplate} />);
    fireEvent.click(screen.getByText(/Save Template Changes/));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update template');
    });
  });

  it('should go back on cancel', () => {
    render(<TemplateEditorForm template={mockTemplate} />);
    fireEvent.click(screen.getByText(/Cancel/));
    expect(mockBack).toHaveBeenCalled();
  });

  it('should toggle between edit and preview modes', () => {
    render(<TemplateEditorForm template={mockTemplate} />);
    
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.queryByTestId('mock-editor')).not.toBeInTheDocument();
    expect(screen.getByText(/Email Preview/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Editor'));
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });
});
