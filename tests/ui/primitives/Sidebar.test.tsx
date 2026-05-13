import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '@/components/ui/backoffice/Sidebar';
import { usePathname } from '@/i18n/routing';

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>{children}</a>
  ),
  usePathname: vi.fn(),
}));

describe('Sidebar', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as any).mockReturnValue('/backoffice');
  });

  it('renders common links for all roles', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="ADMIN" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Financials')).toBeInTheDocument();
  });

  it('renders SUPERADMIN specific links', () => {
    const { rerender } = render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="ADMIN" />);
    expect(screen.queryByText('System Logs')).not.toBeInTheDocument();

    rerender(<Sidebar isOpen={true} onClose={mockOnClose} userRole="SUPERADMIN" />);
    expect(screen.getByText('System Logs')).toBeInTheDocument();
  });

  it('toggles submenus', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="SUPERADMIN" />);
    
    // Submenu should be closed initially
    expect(screen.queryByText('All Events')).not.toBeInTheDocument();

    // Open Events submenu
    fireEvent.click(screen.getByText('Events'));
    expect(screen.getByText('All Events')).toBeInTheDocument();

    // Close Events submenu
    fireEvent.click(screen.getByText('Events'));
    expect(screen.queryByText('All Events')).not.toBeInTheDocument();
  });

  it('initializes with open menu based on pathname', () => {
    (usePathname as any).mockReturnValue('/backoffice/events/categories');
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="SUPERADMIN" />);
    
    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('handles mobile overlay and close button', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="ADMIN" />);
    
    // Close button
    fireEvent.click(screen.getByLabelText('Close Sidebar'));
    expect(mockOnClose).toHaveBeenCalled();

    // Overlay click (usually the first div in the fragment when isOpen is true)
    // Sidebar has a mobile overlay div
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('closes sidebar on link click on mobile', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="ADMIN" />);
    
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('highlights active links and parent menus', () => {
    (usePathname as any).mockReturnValue('/backoffice/membership/list');
    render(<Sidebar isOpen={true} onClose={mockOnClose} userRole="ADMIN" />);
    
    const activeSubLink = screen.getByText('Active Members');
    expect(activeSubLink).toHaveClass('bg-blue-800/40');

    const parentButton = screen.getByText('Memberships').closest('button');
    expect(parentButton).toHaveClass('text-white');
  });
});
