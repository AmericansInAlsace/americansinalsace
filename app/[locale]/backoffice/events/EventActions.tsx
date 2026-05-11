'use client';

import React, { useState } from 'react';
import EventFormModal from '@/components/features/backoffice/EventFormModal';

interface EventActionsProps {
  categories: { id: number; name: string }[];
  event?: any; // If provided, we are editing/acting on a specific event
  mode: 'create' | 'row';
}

export default function EventActions({ categories, event, mode }: EventActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (mode === 'create') {
    return (
      <>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 transition-all active:scale-95"
        >
          + Create New Event
        </button>

        <EventFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          categories={categories} 
        />
      </>
    );
  }

  return (
    <div className="flex justify-end gap-3 items-center">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="text-indigo-600 hover:text-indigo-900 font-medium"
      >
        Edit
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        Attendees
      </button>

      <EventFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={event}
        categories={categories} 
      />
    </div>
  );
}
