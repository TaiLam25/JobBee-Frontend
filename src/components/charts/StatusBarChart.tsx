import React from 'react';

export interface BarDataItem {
  label: string;
  value: number;
  color?: string;
  subLabel?: string;
}

export interface StatusBarChartProps {
  title?: string;
  subtitle?: string;
  data: BarDataItem[];
  layout?: 'vertical' | 'horizontal';
  height?: number;
  emptyMessage?: string;
}

const DEFAULT_COLORS = [
  '#2563eb', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
];

export const StatusBarChart: React.FC<StatusBarChartProps> = ({
  title,
  subtitle,
  data,
  layout = 'horizontal',
  emptyMessage = 'Chưa có dữ liệu thống kê phân bổ',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center flex flex-col items-center justify-center min-h-[180px]">
        <p className="text-xs text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const maxVal = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
      {(title || subtitle) && (
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            {title && <h4 className="text-sm font-bold text-slate-900">{title}</h4>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Tổng: {total}
          </span>
        </div>
      )}

      {layout === 'horizontal' ? (
        <div className="space-y-3.5 pt-1">
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            const barPct = Math.round((val / maxVal) * 100);
            const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

            return (
              <div key={`bar-${idx}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{item.label}</span>
                    {item.subLabel && <span className="text-[10px] text-slate-400">({item.subLabel})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{val}</span>
                    <span className="text-[11px] text-slate-400 font-medium w-9 text-right">{pct}%</span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vertical column layout */
        <div className="pt-4 pb-2 flex items-end justify-around gap-2 h-44">
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
            const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

            return (
              <div key={`vbar-${idx}`} className="flex flex-col items-center flex-1 h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-700 mb-1 opacity-90 group-hover:opacity-100">
                  {val}
                </span>
                <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-95"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[10px] font-semibold text-slate-600 truncate max-w-[65px]">{item.label}</p>
                  <p className="text-[9px] text-slate-400">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
