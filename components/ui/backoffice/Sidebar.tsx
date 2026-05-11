'use client';

import React, { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';

interface NavSubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: string;
  subItems?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Insights',
    items: [
      { name: 'Dashboard', href: '/backoffice', icon: '📊' },
      { name: 'Financials', href: '/backoffice/financials', icon: '💰' },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        name: 'Events',
        icon: '📅',
        subItems: [
          { name: 'All Events', href: '/backoffice/events' },
          { name: 'Categories', href: '/backoffice/events/categories' },
        ],
      },
      {
        name: 'Memberships',
        icon: '💎',
        subItems: [
          { name: 'Active Members', href: '/backoffice/membership/list' },
          { name: 'Tiers', href: '/backoffice/membership/tiers' },
        ],
      },
      {
        name: 'Sponsors',
        icon: '🤝',
        subItems: [
          { name: 'Sponsorship List', href: '/backoffice/sponsors/list' },
          { name: 'Sponsor Tiers', href: '/backoffice/sponsors/tiers' },
        ],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Users', href: '/backoffice/users', icon: '👥' },
      { name: 'Roles', href: '/backoffice/roles', icon: '🔐' },
      {
        name: 'Emails',
        icon: '✉️',
        subItems: [
          { name: 'Logs', href: '/backoffice/communications/logs' },
          { name: 'Templates', href: '/backoffice/communications/templates' },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        name: 'Improvements',
        icon: '💡',
        subItems: [
          { name: 'Submit Feedback', href: '/backoffice/improvements' },
          { name: 'Categories', href: '/backoffice/improvements/categories' },
        ],
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    // Initialize with the menu that contains the current path
    let initial: string | null = null;
    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems?.some(sub => pathname === sub.href)) {
          initial = item.name;
        }
      });
    });
    return initial;
  });

  const toggleMenu = (name: string) => {
    setOpenMenu(prev => (prev === name ? null : name));
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.subItems?.some(sub => isActive(sub.href)) ?? false;
  };

  // Filter navigation sections and items based on role
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Logic for filtering items based on role if needed
      return true;
    }).map(item => ({
      ...item,
      subItems: item.subItems?.filter(sub => {
        if (sub.href === '/backoffice/improvements/categories') {
          return userRole === 'SUPERADMIN';
        }
        return true;
      })
    })).filter(item => !item.subItems || item.subItems.length > 0)
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#3C3B6E] text-white flex-shrink-0 flex flex-col min-h-screen shadow-xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-blue-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
            <span className="text-2xl">AIA</span>
            <span className="text-sm opacity-80 uppercase tracking-widest">Backoffice</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-white p-2" aria-label="Close Sidebar">
            ✕
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-6 mt-4 overflow-y-auto">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300 opacity-70">
                {section.title}
              </h3>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const hasSubItems = !!item.subItems;
                  const isOpenItem = openMenu === item.name;
                  const active = isParentActive(item);

                  return (
                    <div key={item.name} className="group">
                      {item.href ? (
                        <Link
                          href={item.href as any}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium ${
                            active 
                              ? 'bg-blue-800 text-white shadow-inner' 
                              : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                          }`}
                          onClick={() => {
                            setOpenMenu(null);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xl transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                        </Link>
                      ) : (
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium ${
                            active 
                              ? 'text-white' 
                              : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xl transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className={`text-[10px] transition-transform duration-200 ${isOpenItem ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                      )}

                      {hasSubItems && isOpenItem && (
                        <div className="ml-9 mt-1 space-y-1 border-l border-blue-800/50 pl-3">
                          {item.subItems!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href as any}
                              onClick={onClose}
                              className={`block text-xs py-2 px-3 rounded-md transition-all ${
                                isActive(sub.href)
                                  ? 'text-white font-semibold bg-blue-800/40'
                                  : 'text-blue-200/70 hover:text-white hover:bg-blue-800/20'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
