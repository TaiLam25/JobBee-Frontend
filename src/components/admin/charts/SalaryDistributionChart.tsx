import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface SalaryDistributionChartProps {
  data?: {
    negotiable: number;
    under_10m: number;
    from_10m_to_20m: number;
    from_20m_to_30m: number;
    above_30m: number;
  };
  height?: number;
}

const SALARY_COLORS = ['#94a3b8', '#38bdf8', '#6366f1', '#a855f7', '#10b981'];

export const SalaryDistributionChart: React.FC<SalaryDistributionChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data) {
    return (
      <div className="h-[240px] flex items-center justify-center text-xs text-slate-500 italic">
        Chưa có dữ liệu phân khúc mức lương
      </div>
    );
  }

  const chartData = [
    { label: 'Thỏa thuận', count: data.negotiable || 0 },
    { label: '< 10 triệu', count: data.under_10m || 0 },
    { label: '10 - 20 triệu', count: data.from_10m_to_20m || 0 },
    { label: '20 - 30 triệu', count: data.from_20m_to_30m || 0 },
    { label: '> 30 triệu', count: data.above_30m || 0 },
  ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Phân khúc mức lương tuyển dụng
          </h3>
          <p className="text-[11px] text-slate-400">
            Cơ cấu mức lương có cấu trúc ({total.toLocaleString()} tin)
          </p>
        </div>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
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
              formatter={(val: any) => [`${val} tin đăng (${total > 0 ? Math.round((val / total) * 100) : 0}%)`, 'Số lượng']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={SALARY_COLORS[index % SALARY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
