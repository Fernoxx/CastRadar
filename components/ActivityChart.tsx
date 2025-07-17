'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface ChartDataPoint {
  date: string;
  casts: number;
}

export interface ActivityChartProps {
  data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
        <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
        <p className="text-purple-600">{`Total Casts: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

export function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-md mb-4 flex items-center justify-center">
        <p className="text-gray-500">No activity data available</p>
      </div>
    );
  }

  // Sort data by date to ensure proper line progression
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 7-Day Activity Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart 
          data={sortedData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="casts" 
            stroke="#7c3aed" 
            strokeWidth={3} 
            dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
