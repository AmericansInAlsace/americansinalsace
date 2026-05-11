'use client';

import React from 'react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';
import EventActions from '@/app/[locale]/backoffice/events/EventActions';
import { formatCurrency } from '@/lib/formatters';

interface EventTableProps {
  events: any[];
  categories: { id: number; name: string }[];
}

export function EventTable({ events, categories }: EventTableProps) {
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
      header: 'Event',
      accessorKey: 'title',
      cell: (event) => (
        <div className="flex flex-col">
          <div className="text-sm font-bold text-gray-900">{event.title}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-tight">{formatDate(event.date)}</div>
          <div className="text-[10px] text-gray-500 italic truncate max-w-[300px]">{event.location}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Category',
      accessorKey: 'categoryId',
      cell: (event) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
          {event.category.name}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Capacity',
      accessorKey: 'capacity',
      cell: (event) => (
        <div className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{event._count?.rsvps || 0}</span>
          <span className="text-gray-400"> / {event.capacity || '∞'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Prices',
      cell: (event) => (
        <div className="text-[10px] leading-tight">
           <div><span className="text-gray-400">Member:</span> <span className="font-bold text-green-700">{formatCurrency(event.memberPrice)}</span></div>
           <div><span className="text-gray-400">Guest:</span> <span className="font-bold text-blue-700">{formatCurrency(event.nonMemberPrice)}</span></div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'published',
      cell: (event) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          event.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {event.published ? 'Visible' : 'Hidden'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (event) => (
        <EventActions 
          mode="row" 
          event={event} 
          categories={categories} 
        />
      ),
    },
  ];

  const filters: Filter[] = [
    {
      id: 'categoryId',
      label: 'All Categories',
      type: 'select',
      options: categories.map(c => ({ label: c.name, value: String(c.id) })),
    },
    {
      id: 'published',
      label: 'All Statuses',
      type: 'select',
      options: [
        { label: 'Visible', value: 'true' },
        { label: 'Hidden', value: 'false' },
      ],
    },
  ];

  return (
    <DataTable 
      data={events} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search event title or location..."
    />
  );
}
