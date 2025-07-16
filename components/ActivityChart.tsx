'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = { date: string; casts: number };
export function ActivityChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-64 bg-white rounded-2xl p-4 shadow mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="casts" stroke="#6a38d5" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
