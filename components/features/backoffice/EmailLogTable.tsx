'use client';

import React from 'react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';

interface EmailLogTableProps {
  logs: any[];
}

export function EmailLogTable({ logs }: EmailLogTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const columns: Column<any>[] = [
    {
      header: 'Sent At',
      accessorKey: 'sentAt',
      cell: (log) => formatDate(log.sentAt),
      sortable: true,
    },
    {
      header: 'Recipient',
      accessorKey: 'recipient',
      sortable: true,
      cell: (log) => <span className="font-bold text-gray-900">{log.recipient}</span>,
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      sortable: true,
      cell: (log) => <span className="text-gray-600">{log.subject}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (log) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {log.status}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Errors',
      accessorKey: 'error',
      cell: (log) => <span className="text-xs text-red-600 font-mono">{log.error || '---'}</span>,
    },
  ];

  const filters: Filter[] = [
    {
      id: 'status',
      label: 'All Statuses',
      type: 'select',
      options: [
        { label: 'Success', value: 'SUCCESS' },
        { label: 'Failed', value: 'FAILED' },
      ],
    },
  ];

  return (
    <DataTable 
      data={logs} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search recipient or subject..."
    />
  );
}
