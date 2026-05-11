// app/[locale]/backoffice/financials/page.tsx

import { Suspense } from 'react';
import { getDashboardStats, getAllTransactions } from '@/app/actions/backoffice';
import RevenueChart from '@/components/ui/RevenueChart';
import CategoryPieChart from '@/components/ui/CategoryPieChart';
import MemberGrowthChart from '@/components/ui/MemberGrowthChart';
import TransactionTable from '@/components/ui/TransactionTable';
import FinancialActions from './FinancialActions';
import { formatCurrency } from '@/lib/formatters';

// Placeholder for KPI card component
interface KpiCardProps {
  title: string;
  value?: number | string;
  currency?: string;
  isLoading?: boolean;
  error?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value = 0, currency, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded shadow animate-pulse">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-xl font-semibold text-gray-900">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded shadow">
        <h3 className="text-sm font-medium text-red-700 truncate">{title}</h3>
        <p className="mt-1 text-xl font-semibold text-red-900">Error: {error}</p>
      </div>
    );
  }

  // Format currency value if it's a number
  const formattedValue = typeof value === 'number'
    ? formatCurrency(value, currency)
    : value;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-xl font-semibold text-gray-900">{formattedValue}</p>
    </div>
  );
};

// Component to fetch and display dashboard statistics and charts
const DashboardContent = async () => {
  // Dummy data for charts - in a real app, these would be fetched via specialized trend actions
  const revenueChartData = [
    { month: 'Jan', revenue: 1200, previousRevenue: 1000 },
    { month: 'Feb', revenue: 1500, previousRevenue: 1200 },
    { month: 'Mar', revenue: 1300, previousRevenue: 1100 },
    { month: 'Apr', revenue: 1800, previousRevenue: 1400 },
    { month: 'May', revenue: 1600, previousRevenue: 1500 },
  ];

  const categoryPieChartData = [
    { name: 'Subscriptions', value: 800, color: '#0088FE' },
    { name: 'Event Tickets', value: 400, color: '#00C49F' },
    { name: 'Sponsorships', value: 200, color: '#FFBB28' },
    { name: 'Other', value: 100, color: '#FF8042' },
  ];

  const memberGrowthChartData = [
    { date: '2024-01-01', activeMembers: 150, newMembers: 20 },
    { date: '2024-02-01', activeMembers: 165, newMembers: 15 },
    { date: '2024-03-01', activeMembers: 180, newMembers: 25 },
    { date: '2024-04-01', activeMembers: 195, newMembers: 18 },
    { date: '2024-05-01', activeMembers: 210, newMembers: 22 },
  ];

  try {
    const [stats, transactions] = await Promise.all([
      getDashboardStats(),
      getAllTransactions(),
    ]);

    return (
      <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <KpiCard title="Total Revenue" value={stats.totalRevenue} />
          <KpiCard title="Total Expenses" value={stats.totalExpenses} />
          <KpiCard title="Net Profit" value={stats.netProfit} />
          <KpiCard title="Total Transactions" value={stats.numberOfTransactions} />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue Trend</h2>
            <RevenueChart data={revenueChartData} />
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Transaction Breakdown</h2>
            <CategoryPieChart data={categoryPieChartData} />
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Member Growth</h2>
          <MemberGrowthChart data={memberGrowthChartData} />
        </div>
        
        {/* Transaction Table Section */}
        <div className="mt-12">
          <header className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Recent Transactions</h2>
            <p className="text-gray-500 text-sm">Detailed history of all financial activities.</p>
          </header>
          <TransactionTable transactions={transactions} />
        </div>
      </>
    );
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 font-medium">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }
};


// Main page component
export default function FinancialDashboardPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <FinancialActions />
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Revenue" isLoading />
          <KpiCard title="Total Expenses" isLoading />
          <KpiCard title="Net Profit" isLoading />
          <KpiCard title="Total Transactions" isLoading />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
