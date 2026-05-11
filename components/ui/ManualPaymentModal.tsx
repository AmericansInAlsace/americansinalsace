// components/ui/ManualPaymentModal.tsx

'use client';

import React, { useState, useEffect } from 'react';

// Mock data for user selection, in a real app this would come from an API/action
const MOCK_USERS = [
  { id: 1, email: 'user1@example.com', firstName: 'Alice', lastName: 'Smith' },
  { id: 2, email: 'user2@example.com', firstName: 'Bob', lastName: 'Johnson' },
  { id: 3, email: 'admin@example.com', firstName: 'Admin', lastName: 'User' },
];

// Mock data for transaction types
const TRANSACTION_TYPES = [
  { label: 'Subscription Payment', value: 'SUBSCRIPTION_PAYMENT' },
  { label: 'Manual Payment', value: 'MANUAL_PAYMENT' },
  { label: 'Refund', value: 'REFUND' },
  { label: 'Other', value: 'OTHER' },
];

// Mock data for transaction statuses
const TRANSACTION_STATUSES = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Failed', value: 'FAILED' },
];

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(process.env.NEXT_PUBLIC_CURRENCY || 'EUR');
  const [type, setType] = useState(TRANSACTION_TYPES[0].value);
  const [status, setStatus] = useState(TRANSACTION_STATUSES[1].value); // Default to Success
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(null);
      setAmount('');
      setCurrency(process.env.NEXT_PUBLIC_CURRENCY || 'EUR');
      setType(TRANSACTION_TYPES[0].value);
      setStatus(TRANSACTION_STATUSES[1].value);
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Basic validation
    if (!selectedUserId) {
      setError('Please select a user.');
      setIsSubmitting(false);
      return;
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      setIsSubmitting(false);
      return;
    }

    const newTransactionData = {
      userId: selectedUserId,
      amount: numAmount,
      currency: currency,
      type: type,
      status: status,
      description: description || null,
      transactionDate: transactionDate,
    };

    try {
      await onSubmit(newTransactionData);
      onClose();
    } catch (err: any) {
      console.error('Error submitting manual payment:', err);
      setError(err.message || 'Failed to record manual payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Record Manual Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            &times;
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* User Selection */}
          <div className="mb-4">
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              id="user"
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value, 10) || null)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>-- Select User --</option>
              {MOCK_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.firstName} {user.lastName})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Currency (optional, can be hardcoded or a selection) */}
          <div className="mb-4">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TRANSACTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TRANSACTION_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Transaction Date */}
          <div className="mb-4">
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="transactionDate"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;
