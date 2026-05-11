'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';

interface LogTableProps {
  logs: any[];
}

export function LogTable({ logs }: LogTableProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  };

  const columns: Column<any>[] = [
    {
      header: 'Time',
      accessorKey: 'timestamp',
      cell: (log) => (
        <span className="text-xs text-gray-500 font-mono">
          {isMounted ? formatDate(log.timestamp) : '...'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Level',
      accessorKey: 'level',
      cell: (log) => {
        let colors = 'bg-gray-100 text-gray-800';
        if (log.level === 'ERROR') colors = 'bg-red-100 text-red-800';
        else if (log.level === 'WARN') colors = 'bg-amber-100 text-amber-800';
        else if (log.level === 'INFO') colors = 'bg-blue-100 text-blue-800';
        else if (log.level === 'DEBUG') colors = 'bg-purple-100 text-purple-800';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colors}`}>
            {log.level}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: 'Origin',
      accessorKey: 'origin',
      cell: (log) => (
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.origin}</span>
      ),
      sortable: true,
    },
    {
      header: 'Message',
      accessorKey: 'message',
      cell: (log) => (
        <div className="max-w-md">
          <div className="text-sm font-medium text-gray-900 line-clamp-2" title={log.message}>{log.message}</div>
          {log.details && (
            <details className="mt-1">
              <summary className="text-[10px] text-blue-500 cursor-pointer hover:underline">View Details</summary>
              <pre className="mt-2 p-2 bg-gray-900 text-green-400 text-[10px] overflow-auto rounded max-h-40 font-mono">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ),
      sortable: true,
    },
  ];

  const filters: Filter[] = [
    {
      id: 'level',
      label: 'All Levels',
      type: 'select',
      options: [
        { label: 'Error', value: 'ERROR' },
        { label: 'Warn', value: 'WARN' },
        { label: 'Info', value: 'INFO' },
        { label: 'Debug', value: 'DEBUG' },
      ],
    },
    {
      id: 'origin',
      label: 'All Origins',
      type: 'select',
      options: [
        { label: 'Web', value: 'WEB' },
        { label: 'Database', value: 'DATABASE' },
        { label: 'Mail', value: 'MAIL' },
        { label: 'Client', value: 'CLIENT' },
      ],
    },
  ];

  return (
    <DataTable 
      data={logs} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search logs..."
    />
  );
}
