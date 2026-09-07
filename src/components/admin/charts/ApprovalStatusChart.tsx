import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { ApprovalStatusWeekItem } from '../../../types';

interface ApprovalStatusChartProps {
  data: ApprovalStatusWeekItem[];
  height?: number;
}

export const ApprovalStatusChart: React.FC<ApprovalStatusChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-slate-500 italic">
        Chưa có dữ liệu kiểm duyệt theo tuần
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="week"
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
          <Bar dataKey="approved" name="Đã duyệt" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" name="Chờ duyệt" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="rejected" name="Từ chối" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="hidden" name="Đã ẩn" stackId="a" fill="#475569" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
