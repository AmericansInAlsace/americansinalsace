'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LogChartProps {
  data: { date: string; errors: number; warnings: number }[];
}

export function LogChart({ data }: LogChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatDate = (label: React.ReactNode) => {
    if (typeof label !== 'string') return '';
    const d = new Date(label);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  if (!isMounted) {
    return <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] animate-pulse" />;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px]">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">System Health (Last 14 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            labelFormatter={formatDate}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Bar dataKey="errors" name="Errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="warnings" name="Warnings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
