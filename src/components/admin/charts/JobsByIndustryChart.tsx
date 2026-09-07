import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { JobIndustryItem } from '../../../types';

interface JobsByIndustryChartProps {
  data: JobIndustryItem[];
  height?: number;
}

const BAR_COLORS = [
  '#6366f1',
  '#818cf8',
  '#38bdf8',
  '#22d3ee',
  '#2dd4bf',
  '#34d399',
  '#a855f7',
  '#c084fc',
];

export const JobsByIndustryChart: React.FC<JobsByIndustryChartProps> = ({
  data,
  height = 260,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-xs text-slate-500 italic">
        Chưa có dữ liệu phân loại ngành nghề
      </div>
    );
  }

  // Ensure sorted descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="industry_name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
            formatter={(val: any) => [`${val} tin đăng`, 'Số lượng']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {sortedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
