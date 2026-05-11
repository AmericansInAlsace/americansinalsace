'use client';

import React, { useState } from 'react';
import { updateUserRole } from '@/app/actions/backoffice';

interface Role {
  id: number;
  name: string;
}

/**
 * A dropdown selector for changing a user's role in the backoffice.
 * It calls a server action to update the role when a new option is selected.
 *
 * @param {object} props - The component props.
 * @param {number} props.userId - The ID of the user whose role is being changed.
 * @param {number | null} props.currentRoleId - The ID of the user's current role.
 * @param {Role[]} props.roles - An array of all available roles.
 */
export function UserRoleSelector({ 
  userId, 
  currentRoleId, 
  roles 
}: { 
  userId: number; 
  currentRoleId: number | null; 
  roles: Role[] 
}) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleId = parseInt(e.target.value);
    setLoading(true);
    try {
      await updateUserRole(userId, newRoleId);
    } catch (error) {
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      value={currentRoleId || ''} 
      onChange={handleChange}
      disabled={loading}
      className="text-xs border rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="" disabled>Select Role</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}
