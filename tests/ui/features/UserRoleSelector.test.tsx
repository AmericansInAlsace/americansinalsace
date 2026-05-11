import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserRoleSelector } from '@/components/features/backoffice/UserRoleSelector';
import { updateUserRole } from '@/app/actions/backoffice';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/actions/backoffice', () => ({
  updateUserRole: vi.fn(),
}));

describe('UserRoleSelector', () => {
  const mockRoles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with current role', () => {
    render(<UserRoleSelector userId={123} currentRoleId={2} roles={mockRoles} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('2');
  });

  it('calls updateUserRole when selection changes', async () => {
    render(<UserRoleSelector userId={123} currentRoleId={2} roles={mockRoles} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(updateUserRole).toHaveBeenCalledWith(123, 1);
  });

  it('disables select while loading', async () => {
    vi.mocked(updateUserRole).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<UserRoleSelector userId={123} currentRoleId={2} roles={mockRoles} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    expect(select).toBeDisabled();
  });

  it('alerts on error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(updateUserRole).mockRejectedValue(new Error('Failed'));

    render(<UserRoleSelector userId={123} currentRoleId={2} roles={mockRoles} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to update role');
    });

    expect(select).not.toBeDisabled();
    alertSpy.mockRestore();
  });
});
