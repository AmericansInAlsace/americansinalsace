import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryManager from '@/components/features/backoffice/CategoryManager';
import { vi, describe, it, expect } from 'vitest';
import * as actions from '@/app/actions/improvements';

vi.mock('@/app/actions/improvements', () => ({
  createImprovementCategory: vi.fn(),
  updateImprovementCategory: vi.fn(),
  deleteImprovementCategory: vi.fn(),
}));

describe('CategoryManager UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
  ];

  it('renders categories list', () => {
    render(<CategoryManager initialCategories={initialCategories} />);
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('handles create category', async () => {
    vi.mocked(actions.createImprovementCategory).mockResolvedValue({
      category: { id: 3, name: 'New Category', createdAt: new Date(), updatedAt: new Date() }
    });

    render(<CategoryManager initialCategories={initialCategories} />);
    const input = screen.getByPlaceholderText('New Category Name (e.g., Membership, Events)');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'New Category' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(actions.createImprovementCategory).toHaveBeenCalledWith('New Category');
    });
  });

  it('handles update category', async () => {
    vi.mocked(actions.updateImprovementCategory).mockResolvedValue({
      category: { id: 1, name: 'Updated Category 1', createdAt: new Date(), updatedAt: new Date() }
    });

    render(<CategoryManager initialCategories={initialCategories} />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const editInput = screen.getByDisplayValue('Category 1');
    fireEvent.change(editInput, { target: { value: 'Updated Category 1' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.updateImprovementCategory).toHaveBeenCalledWith(1, 'Updated Category 1');
    });
  });

  it('handles delete category with cancel', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<CategoryManager initialCategories={initialCategories} />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(actions.deleteImprovementCategory).not.toHaveBeenCalled();
  });

  it('shows error alerts when actions fail', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(actions.createImprovementCategory).mockRejectedValue(new Error('Fail'));
    vi.mocked(actions.updateImprovementCategory).mockRejectedValue(new Error('Fail'));
    vi.mocked(actions.deleteImprovementCategory).mockRejectedValue(new Error('Fail'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CategoryManager initialCategories={initialCategories} />);
    
    // Create Fail
    fireEvent.change(screen.getByPlaceholderText('New Category Name (e.g., Membership, Events)'), { target: { value: 'X' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Failed to create category'));

    // Update Fail
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Failed to update category'));

    // Delete Fail
    fireEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Failed to delete category'));

    alertSpy.mockRestore();
  });

  it('sorts categories alphabetically', async () => {
    vi.mocked(actions.createImprovementCategory).mockResolvedValue({
      category: { id: 3, name: 'Aardvark', createdAt: new Date(), updatedAt: new Date() }
    });
    render(<CategoryManager initialCategories={initialCategories} />);
    fireEvent.change(screen.getByPlaceholderText('New Category Name (e.g., Membership, Events)'), { target: { value: 'Aardvark' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveTextContent('Aardvark');
    });
  });

  it('allows cancelling an edit', () => {
    render(<CategoryManager initialCategories={initialCategories} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByDisplayValue('Category 1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByDisplayValue('Category 1')).not.toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
  });

  it('prevents empty submission', async () => {
    render(<CategoryManager initialCategories={initialCategories} />);
    
    // Create
    fireEvent.click(screen.getByText('Add'));
    expect(actions.createImprovementCategory).not.toHaveBeenCalled();

    // Update
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.change(screen.getByDisplayValue('Category 1'), { target: { value: ' ' } });
    fireEvent.click(screen.getByText('Save'));
    expect(actions.updateImprovementCategory).not.toHaveBeenCalled();
  });
});
