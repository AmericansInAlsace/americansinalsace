// components/ui/TransactionTable.tsx

'use client';

import React, { useState, useMemo } from 'react';

// Define the structure of a transaction object for the table
interface Transaction {
  id: number;
  userId: number;
  amount: number; // Use native number
  currency: string;
  type: string;
  status: string;
  transactionDate: Date | string; // Accept Date objects or ISO strings
  user?: { // Assuming User object might be included
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  description?: string | null;
  paypalTransactionId?: string | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  // Potentially add props for pagination, filtering, sorting handlers if managed externally
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | 'userName'; direction: 'ascending' | 'descending' } | null>(null);

  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Process transactions for display (e.g., format dates)
  const processedTransactions = useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      transactionDate: tx.transactionDate instanceof Date ? tx.transactionDate.toISOString() : tx.transactionDate,
      userName: tx.user ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || tx.user.email : 'N/A',
    }));
  }, [transactions]);

  // Filter and sort transactions
  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = processedTransactions.filter(tx => {
      const term = searchTerm.toLowerCase();
      return (
        tx.type.toLowerCase().includes(term) ||
        (tx.description && tx.description.toLowerCase().includes(term)) ||
        tx.status.toLowerCase().includes(term) ||
        tx.userName.toLowerCase().includes(term) ||
        tx.paypalTransactionId?.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term) || 
        tx.transactionDate.toString().includes(term)
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined || aValue === null || bValue === null) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [processedTransactions, searchTerm, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredTransactions.slice(startIndex, endIndex);
  }, [sortedAndFilteredTransactions, currentPage, itemsPerPage]);

  const requestSort = (key: keyof Transaction | 'userName') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return value.toLocaleString(undefined, { style: 'currency', currency });
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search transactions..."
          className="p-2 border border-gray-300 rounded w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div>
          <label htmlFor="itemsPerPage" className="mr-2">Items per page:</label>
          <select
            id="itemsPerPage"
            className="p-2 border border-gray-300 rounded"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when items per page changes
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('transactionDate')}>
                Date {sortConfig?.key === 'transactionDate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('userName')}>
                User {sortConfig?.key === 'userName' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('type')}>
                Type {sortConfig?.key === 'type' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('amount')}>
                Amount {sortConfig?.key === 'amount' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('description')}>
                Description {sortConfig?.key === 'description' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('paypalTransactionId')}>
                PayPal Tx ID {sortConfig?.key === 'paypalTransactionId' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.transactionDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.user ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || tx.user.email : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount, tx.currency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : (tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.paypalTransactionId || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No transactions found matching your search.' : 'No transactions to display.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${page === currentPage ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
