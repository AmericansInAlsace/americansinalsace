import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ManualPaymentModal from '@/components/ui/ManualPaymentModal';

describe('ManualPaymentModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ManualPaymentModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when isOpen is true', () => {
    render(<ManualPaymentModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText('Record Manual Payment')).toBeInTheDocument();
  });

  it('calls onSubmit with correct data', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ManualPaymentModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/select user/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test description' } });
    
    const form = screen.getByText(/save payment/i).closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        amount: 50,
        description: 'Test description',
      }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error if no user is selected', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ManualPaymentModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    
    // Fill amount but not user
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    
    const form = screen.getByText(/save payment/i).closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please select a user.')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows error if amount is invalid', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ManualPaymentModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/select user/i), { target: { value: '1' } });
    // Keep amount empty
    
    const form = screen.getByText(/save payment/i).closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid positive amount.')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows API error on submission failure', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('API failed'));
    render(<ManualPaymentModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/select user/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    
    const form = screen.getByText(/save payment/i).closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('API failed')).toBeInTheDocument();
    });
  });
});
