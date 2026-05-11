import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { handleRegister } from '@/app/actions/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/app/actions/auth', () => ({
  handleRegister: vi.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('should call handleRegister on submit', async () => {
    vi.mocked(handleRegister).mockResolvedValue({ success: true });
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    expect(await screen.findByText(/Registration Successful/i)).toBeInTheDocument();
  });

  it('should display error message on failure', async () => {
    vi.mocked(handleRegister).mockResolvedValue({ error: 'Email already exists' });
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Email already exists/i);
  });
});
