'use client';

import React from 'react';
import { DataTable, Column, Filter } from './DataTable';
import { formatCurrency } from '@/lib/formatters';

interface Transaction {
  id: number;
  userId: number;
  amount: number | any; // Handle Decimal from Prisma
  currency: string;
  type: string;
  status: string;
  transactionDate: Date | string;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  description?: string | null;
  paypalTransactionId?: string | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const columns: Column<Transaction>[] = [
    {
      header: 'Date',
      accessorKey: 'transactionDate',
      cell: (tx) => formatDate(tx.transactionDate),
      sortable: true,
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (tx) => (
        tx.user 
          ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || tx.user.email 
          : 'N/A'
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      sortable: true,
      cell: (tx) => (
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          {tx.type.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (tx) => (
        <span className="font-bold text-gray-900">
          {formatCurrency(tx.amount, tx.currency)}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (tx) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          tx.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : (tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
        }`}>
          {tx.status}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (tx) => <span className="text-gray-500 italic">{tx.description || '-'}</span>,
    },
    {
      header: 'PayPal ID',
      accessorKey: 'paypalTransactionId',
      cell: (tx) => <span className="text-xs font-mono text-gray-400">{tx.paypalTransactionId || '-'}</span>,
    }
  ];

  const filters: Filter[] = [
    {
      id: 'type',
      label: 'All Types',
      type: 'select',
      options: [
        { label: 'Membership', value: 'MEMBERSHIP' },
        { label: 'Sponsorship', value: 'SPONSORSHIP' },
        { label: 'Event', value: 'EVENT' },
        { label: 'Manual', value: 'MANUAL_PAYMENT' },
      ]
    },
    {
      id: 'status',
      label: 'All Statuses',
      type: 'select',
      options: [
        { label: 'Success', value: 'SUCCESS' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' },
      ]
    }
  ];

  return (
    <DataTable 
      data={transactions} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search user, description, or ID..."
    />
  );
};

export default TransactionTable;
