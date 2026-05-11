import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    date: Date;
    location: string;
    capacity: number | null;
    memberPrice: number;
    nonMemberPrice: number;
    category: {
      name: string;
    };
    _count: {
      rsvps: number;
    };
  };
}

/**
 * Reusable Event Card component for displaying event summaries.
 * Used on the Events listing page and the Homepage.
 */
export function EventCard({ event }: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-1 bg-blue-50 text-[var(--color-primary-blue)] text-[10px] font-bold uppercase tracking-widest rounded">
            {event.category.name}
          </span>
          <div className="text-right">
            <div className="text-lg font-bold text-[var(--color-primary-red)]">{formatDate(event.date)}</div>
            <div className="text-xs text-gray-500">{formatTime(event.date)}</div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 font-serif text-[var(--color-text-main)]">{event.title}</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-3">
          {event.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>📍</span> {event.location}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>👥</span> {event._count.rsvps} / {event.capacity || 'Unlimited'} attending
        </div>
      </div>
      <div className="p-6 border-t border-[var(--color-border)] bg-gray-50 flex justify-between items-center">
        <div>
          <span className="text-sm font-bold text-[var(--color-primary-blue)]">{event.memberPrice === 0 ? 'FREE' : formatCurrency(event.memberPrice)}</span>
          <span className="text-[10px] text-gray-400 ml-1">for members</span>
        </div>
        <Link 
          href={`/events/${event.id}`}
          className="text-sm font-bold text-[var(--color-primary-red)] hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
