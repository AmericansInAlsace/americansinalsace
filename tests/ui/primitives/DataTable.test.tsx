import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Column, Filter } from '@/components/ui/DataTable';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

interface MockData {
  id: number;
  name: string;
  role: string;
  status: { id: string; name: string };
}

const mockData: MockData[] = [
  { id: 1, name: 'Alice', role: 'Admin', status: { id: 'active', name: 'Active' } },
  { id: 2, name: 'Bob', role: 'User', status: { id: 'inactive', name: 'Inactive' } },
  { id: 3, name: 'Charlie', role: 'User', status: { id: 'active', name: 'Active' } },
];

const columns: Column<MockData>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Role', accessorKey: 'role', sortable: true },
  { header: 'Status', accessorKey: 'status', cell: (item) => item.status.name },
];

const filters: Filter[] = [
  { id: 'role', label: 'Filter Role', type: 'select', options: [{ label: 'Admin', value: 'Admin' }, { label: 'User', value: 'User' }] },
  { id: 'name', label: 'Filter Name', type: 'text' },
];

describe('DataTable', () => {
  it('should render data correctly', () => {
    render(<DataTable data={mockData} columns={columns} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should handle search', () => {
    render(<DataTable data={mockData} columns={columns} searchPlaceholder="Search users..." />);
    const searchInput = screen.getByPlaceholderText('Search users...');
    
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('should handle select filters', () => {
    render(<DataTable data={mockData} columns={columns} filters={filters} />);
    const select = screen.getByLabelText('Filter Role');
    
    fireEvent.change(select, { target: { value: 'Admin' } });
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('should handle text filters', () => {
    render(<DataTable data={mockData} columns={columns} filters={filters} />);
    const nameFilter = screen.getByLabelText('Filter Name');
    
    fireEvent.change(nameFilter, { target: { value: 'Bob' } });
    
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('should handle sorting', () => {
    render(<DataTable data={mockData} columns={columns} />);
    const nameHeader = screen.getByText('Name');
    
    // Sort Ascending
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row').slice(1); // skip header
    expect(rows[0]).toHaveTextContent('Alice');
    expect(rows[2]).toHaveTextContent('Charlie');

    // Sort Descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Charlie');
    expect(rows[2]).toHaveTextContent('Alice');
  });

  it('should handle pagination', () => {
    const manyData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      role: 'User',
      status: { id: 'active', name: 'Active' },
    }));

    render(<DataTable data={manyData} columns={columns} defaultItemsPerPage={10} />);
    
    expect(screen.getByText('User 0')).toBeInTheDocument();
    expect(screen.queryByText('User 10')).not.toBeInTheDocument();

    // Target the button specifically, not the sr-only span
    const nextButton = screen.getAllByRole('button', { name: /next/i })[0];
    fireEvent.click(nextButton);
    
    expect(screen.queryByText('User 0')).not.toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
  });

  it('should change items per page', () => {
    render(<DataTable data={mockData} columns={columns} defaultItemsPerPage={1} />);
    // Use a regex to match the "Showing X to Y of Z results" text which might be split
    expect(screen.getByText(/showing/i)).toHaveTextContent(/1 to 1 of 3/i);

    const showSelect = screen.getByLabelText(/items per page/i);
    fireEvent.change(showSelect, { target: { value: '20' } });
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('should show no results matching filters', () => {
    render(<DataTable data={mockData} columns={columns} />);
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.getByText('No results found matching your filters.')).toBeInTheDocument();
  });

  it('should handle nested object filtering', () => {
    const mockDataWithMatch: MockData[] = [
      { id: 1, name: 'Alice', role: 'Admin', status: { id: 'Active', name: 'Active' } },
      { id: 2, name: 'Bob', role: 'User', status: { id: 'Inactive', name: 'Inactive' } },
    ];
    const filtersWithNested: Filter[] = [
      { id: 'status', label: 'Filter Status', type: 'select', options: [{ label: 'Active', value: 'Active' }] },
    ];
    render(<DataTable data={mockDataWithMatch} columns={columns} filters={filtersWithNested} />);
    const select = screen.getByLabelText('Filter Status');
    
    fireEvent.change(select, { target: { value: 'Active' } });
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('should handle sorting with null and undefined values', () => {
    const dataWithNulls = [
      { id: 1, name: 'Alice', role: null, status: { name: 'Active' } },
      { id: 2, name: 'Bob', role: 'User', status: { name: 'Active' } },
      { id: 3, name: 'Charlie', role: undefined, status: { name: 'Active' } },
    ];
    render(<DataTable data={dataWithNulls as any} columns={columns} />);
    const roleHeader = screen.getByText('Role');
    
    // Sort Ascending: null/undefined should go to the end
    fireEvent.click(roleHeader);
    let rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Bob');
    
    // Sort Descending
    fireEvent.click(roleHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Bob');

    // Click third time to clear sort
    fireEvent.click(roleHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Alice');
  });

  it('should render pagination dots for many pages', () => {
    const manyData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      role: 'User',
      status: { id: 'active', name: 'Active' },
    }));

    render(<DataTable data={manyData} columns={columns} defaultItemsPerPage={10} />);
    
    // Go to page 5 to see dots on both sides if possible
    // 1 2 ... 10 or similar
    expect(screen.getByText('...')).toBeInTheDocument();
    
    const lastPageBtn = screen.getByRole('button', { name: '10' });
    fireEvent.click(lastPageBtn);
    expect(screen.getByText('User 99')).toBeInTheDocument();
  });

  it('should handle mobile pagination buttons', () => {
    const manyData = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      role: 'User',
      status: { id: 'active', name: 'Active' },
    }));

    render(<DataTable data={manyData} columns={columns} defaultItemsPerPage={10} />);
    
    const prevButtons = screen.getAllByText('Previous');
    const nextButtons = screen.getAllByText('Next');
    
    // Mobile buttons are usually first in the DOM based on my read
    fireEvent.click(nextButtons[0]);
    expect(screen.getByText('User 10')).toBeInTheDocument();
    
    fireEvent.click(prevButtons[0]);
    expect(screen.getByText('User 0')).toBeInTheDocument();
  });
});
