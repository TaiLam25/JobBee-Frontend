import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { JobPostingsGrowthItem } from '../../../types';

interface JobPostingsGrowthChartProps {
  data: JobPostingsGrowthItem[];
  height?: number;
}

export const JobPostingsGrowthChart: React.FC<JobPostingsGrowthChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-slate-500 italic">
        Chưa có dữ liệu tin tuyển dụng
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(val) => val.slice(5)}
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="full_time"
            name="Việc làm Full-time"
            stroke="#818cf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#818cf8' }}
          />
          <Line
            type="monotone"
            dataKey="small_job"
            name="Small Job"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#34d399' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
