'use client';

import React from 'react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';
import { UserRoleSelector } from './UserRoleSelector';
import UserActions from '@/app/[locale]/backoffice/users/UserActions';

interface Role {
  id: number;
  name: string;
}

interface MembershipTier {
  id: number;
  name: string;
}

interface UserTableProps {
  users: any[];
  roles: Role[];
  tiers: MembershipTier[];
}

export function UserTable({ users, roles, tiers }: UserTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '---';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const columns: Column<any>[] = [
    {
      header: 'User',
      accessorKey: 'email', // Primary search key
      cell: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'emailVerified',
      cell: (user) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
          user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user.emailVerified ? 'Verified' : 'Pending'}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Role',
      accessorKey: 'roleId',
      cell: (user) => (
        <UserRoleSelector 
          userId={user.id} 
          currentRoleId={user.roleId} 
          roles={roles} 
        />
      ),
      sortable: true,
    },
    {
      header: 'Membership',
      accessorKey: 'subscription',
      cell: (user) => (
        user.subscription ? (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-700">{user.subscription.tier.name}</span>
            <span className="text-[10px] text-gray-400 capitalize">{user.subscription.status}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">No Active Plan</span>
        )
      ),
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: (user) => formatDate(user.createdAt),
      sortable: true,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (user) => <UserActions user={user} />,
    },
  ];

  const filters: Filter[] = [
    {
      id: 'roleId',
      label: 'All Roles',
      type: 'select',
      options: roles.map(r => ({ label: r.name, value: String(r.id) })),
    },
    {
      id: 'subscription',
      label: 'All Tiers',
      type: 'select',
      options: [
          { label: 'No Active Plan', value: 'null' },
          ...tiers.map(t => ({ label: t.name, value: t.name })) // We'll handle this in the DataTable filter logic if needed or simplify
      ],
    }
  ];

  // Note: The simple DataTable filter logic in DataTable.tsx might need adjustment for nested objects like 'subscription'.
  // For now, it will work for simple equality or includes.

  return (
    <DataTable 
      data={users} 
      columns={columns} 
      filters={filters}
      searchPlaceholder="Search name or email..."
    />
  );
}
