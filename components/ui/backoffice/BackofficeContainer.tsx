'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface BackofficeContainerProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    role?: string | null;
  };
}

export default function BackofficeContainer({ children, user }: BackofficeContainerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} userRole={user.role || ''} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 active:scale-95 transition-transform"
              aria-label="Toggle Sidebar"
            >
              <span className="text-2xl">☰</span>
            </button>
            <span className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider hidden sm:inline">
              Administrator Panel
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                {user.role}
              </span>
              <span className="text-xs md:text-sm text-gray-600 font-medium truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
