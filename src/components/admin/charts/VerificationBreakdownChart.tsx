import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { VerificationBreakdownItem } from '../../../types';

interface VerificationBreakdownChartProps {
  data: VerificationBreakdownItem[];
  height?: number;
}

const STATUS_COLORS: Record<string, string> = {
  verified: '#10b981',
  pending: '#f59e0b',
  rejected: '#f43f5e',
  unverified: '#475569',
};

export const VerificationBreakdownChart: React.FC<VerificationBreakdownChartProps> = ({
  data = [],
  height = 220,
}) => {
  const safeData = data || [];
  const total = safeData.reduce((sum, item) => sum + (item.count || 0), 0);

  if (safeData.length === 0 || total === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-slate-500 italic">
        Chưa có dữ liệu xác minh doanh nghiệp
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
            formatter={(value: any, name: any) => [`${value} DN (${Math.round((Number(value) / total) * 100)}%)`, name]}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            stroke="#0b0f19"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={STATUS_COLORS[entry.status] || '#64748b'}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
