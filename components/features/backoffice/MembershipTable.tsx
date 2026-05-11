'use client';

import React from 'react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';
import MembershipActions from '@/app/[locale]/backoffice/membership/list/MembershipActions';

interface MembershipTableProps {
  subscriptions: any[];
  availableTiers: { id: number; name: string }[];
}

export function MembershipTable({ subscriptions, availableTiers }: MembershipTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '---';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const columns: Column<any>[] = [
    {
      header: 'Member',
      accessorKey: 'user.email',
      cell: (sub) => (
        <div>
          <div className="text-sm font-bold text-gray-900">{sub.user.firstName} {sub.user.lastName}</div>
          <div className="text-xs text-gray-500">{sub.user.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Tier',
      accessorKey: 'tier.name',
      cell: (sub) => (
        <span className="text-sm font-medium text-blue-700">{sub.tier.name}</span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (sub) => {
        let statusClasses = 'bg-yellow-100 text-yellow-800'; // Default for PENDING and others
        if (sub.status === 'ACTIVE') {
          statusClasses = 'bg-green-100 text-green-800';
        } else if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') {
          statusClasses = 'bg-red-100 text-red-800';
        }

        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${statusClasses}`}>
            {sub.status}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: (sub) => formatDate(sub.startDate),
      sortable: true,
    },
    {
      header: 'Renewal Date',
      accessorKey: 'endDate',
      cell: (sub) => formatDate(sub.endDate),
      sortable: true,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (sub) => (
        <MembershipActions 
          subscriptionId={sub.id} 
          currentStatus={sub.status} 
          currentTierId={sub.tierId}
          availableTiers={availableTiers}
        />
      ),
    },
  ];

  const filters: Filter[] = [
    {
      id: 'status',
      label: 'All Statuses',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Expired', value: 'EXPIRED' },
      ],
    },
    {
      id: 'tierId',
      label: 'All Tiers',
      type: 'select',
      options: availableTiers.map(t => ({ label: t.name, value: String(t.id) })),
    },
  ];

  return (
    <DataTable 
      data={subscriptions} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search member name or email..."
    />
  );
}
