import React, { useState } from 'react';

export interface LineSeries {
  key: string;
  name: string;
  color: string;
}

export interface TrendLineChartProps {
  title?: string;
  subtitle?: string;
  data: Array<{
    label: string;
    [key: string]: any;
  }>;
  series: LineSeries[];
  height?: number;
  emptyMessage?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  title,
  subtitle,
  data,
  series,
  height = 240,
  emptyMessage = 'Chưa có dữ liệu thống kê xu hướng',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-xs text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  // Calculate max value for Y-axis scale
  let maxVal = 0;
  data.forEach((item) => {
    series.forEach((s) => {
      const val = Number(item[s.key]) || 0;
      if (val > maxVal) maxVal = val;
    });
  });
  // Ensure non-zero ceiling
  const yCeil = maxVal === 0 ? 10 : Math.ceil(maxVal * 1.2);

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = 500; // SVG internal coordinate width
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (idx / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return paddingTop + innerHeight - (val / yCeil) * innerHeight;
  };

  // Generate SVG path for a series
  const getPathD = (seriesKey: string) => {
    return data
      .map((item, idx) => {
        const x = getX(idx);
        const y = getY(Number(item[seriesKey]) || 0);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // 4 Y-axis ticks
  const yTicks = [0, Math.round(yCeil * 0.33), Math.round(yCeil * 0.66), yCeil];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
      {(title || subtitle || series.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            {title && <h4 className="text-sm font-bold text-slate-900">{title}</h4>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          {/* Series Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: height }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines & Y ticks */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={`ytick-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {data.map((item, idx) => {
            const x = getX(idx);
            const shouldRender = data.length <= 8 || idx % 2 === 0 || idx === data.length - 1;
            if (!shouldRender) return null;

            return (
              <text
                key={`xlabel-${idx}`}
                x={x}
                y={chartHeight - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontWeight="500"
              >
                {item.label}
              </text>
            );
          })}

          {/* Series Lines & Areas */}
          {series.map((s) => {
            const pathD = getPathD(s.key);
            return (
              <g key={`series-${s.key}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {data.map((item, idx) => {
                  const x = getX(idx);
                  const y = getY(Number(item[s.key]) || 0);
                  const isHovered = hoverIndex === idx;

                  return (
                    <circle
                      key={`dot-${s.key}-${idx}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ffffff"
                      stroke={s.color}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Interactive Hover Vertical Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={chartHeight - paddingBottom}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Transparent click/hover targets */}
          {data.map((_, idx) => {
            const x = getX(idx);
            const colWidth = innerWidth / Math.max(1, data.length);
            return (
              <rect
                key={`hover-rect-${idx}`}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Float */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/90 backdrop-blur-xs text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700/50 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
              top: `${Math.max(10, (getY(Number(data[hoverIndex][series[0]?.key]) || 0) / chartHeight) * 100 - 10)}%`,
            }}
          >
            <p className="font-bold text-[11px] text-slate-300 border-b border-white/10 pb-1 mb-1.5">
              Tuần: {data[hoverIndex].label}
            </p>
            <div className="space-y-1">
              {series.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}:
                  </span>
                  <span className="font-bold text-white">
                    {data[hoverIndex][s.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
