// app/[locale]/backoffice/financials/FinancialActions.tsx

'use client';

import { useState } from 'react';
import ManualPaymentModal from '@/components/ui/ManualPaymentModal';
import { recordManualPaymentAction } from '@/app/actions/backoffice';

export default function FinancialActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    // Convert transactionDate string back to Date for the server action if needed,
    // although recordManualPaymentAction expects a specific shape.
    const result = await recordManualPaymentAction({
      ...data,
      transactionDate: new Date(data.transactionDate),
    });
    
    if (result.success) {
      console.log('Manual payment added successfully:', result.transaction);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        + Add Manual Payment
      </button>

      <ManualPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
