'use client';

import React, { useState } from 'react';
import UserDetailsModal from '@/components/features/backoffice/UserDetailsModal';

interface UserActionsProps {
  user: any;
}

export default function UserActions({ user }: UserActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="text-gray-400 hover:text-[var(--color-primary-blue)] transition-colors font-medium text-sm"
      >
        View Details
      </button>

      <UserDetailsModal 
        user={user} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
