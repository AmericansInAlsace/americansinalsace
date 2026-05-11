// components/ui/MemberGrowthChart.tsx

'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MemberGrowthDataPoint {
  date: string; // e.g., '2023-01-01', '2023-02-01'
  activeMembers: number;
  newMembers?: number; // Optional: to show new sign-ups
}

interface MemberGrowthChartProps {
  data: MemberGrowthDataPoint[];
}

const MemberGrowthChart: React.FC<MemberGrowthChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
        <p className="text-gray-500">No member growth data available.</p>
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
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="activeMembers" name="Active Members" stroke="#8884d8" activeDot={{ r: 8 }} />
        {data.some(d => d.newMembers !== undefined) && (
          <Line type="monotone" dataKey="newMembers" name="New Members" stroke="#82ca9d" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MemberGrowthChart;
