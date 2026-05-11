// components/ui/RevenueChart.tsx

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueDataPoint {
  month: string; // e.g., 'Jan', 'Feb'
  revenue: number; // Use native number for charting
  previousRevenue?: number; // For comparison, e.g., year-over-year
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
        <p className="text-gray-500">No revenue data available.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis 
          tickFormatter={(value) => `$${value.toLocaleString()}`} 
        />
        <Tooltip formatter={(value: any, name: any) => [`$${(Number(value) || 0).toLocaleString()}`, name]} />
        <Legend />
        <Line type="monotone" dataKey="revenue" name="Current Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
        {data.some(d => d.previousRevenue !== undefined) && (
          <Line type="monotone" dataKey="previousRevenue" name="Previous Revenue" stroke="#82ca9d" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
