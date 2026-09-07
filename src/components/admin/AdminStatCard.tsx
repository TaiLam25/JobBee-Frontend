import React from 'react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number; // percentage
    isPositive?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  accentColor?: 'slate' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon,
  badge,
  onClick,
  className = '',
  accentColor = 'slate',
}) => {
  const accentBorder: Record<string, string> = {
    slate: 'border-slate-800/90 hover:border-slate-700',
    indigo: 'border-indigo-900/50 hover:border-indigo-700/60',
    cyan: 'border-cyan-900/50 hover:border-cyan-700/60',
    emerald: 'border-emerald-900/50 hover:border-emerald-700/60',
    amber: 'border-amber-900/50 hover:border-amber-700/60',
    rose: 'border-rose-900/50 hover:border-rose-700/60',
  };

  const accentGlow: Record<string, string> = {
    slate: 'from-slate-900/40 to-slate-950/70',
    indigo: 'from-indigo-950/40 to-slate-950/70',
    cyan: 'from-cyan-950/40 to-slate-950/70',
    emerald: 'from-emerald-950/40 to-slate-950/70',
    amber: 'from-amber-950/40 to-slate-950/70',
    rose: 'from-rose-950/40 to-slate-950/70',
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-b ${accentGlow[accentColor]} backdrop-blur-xs rounded-lg border p-4 transition-all duration-200 ${accentBorder[accentColor]} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-1.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
          {value}
        </div>
        {badge}
      </div>

      {(subValue || trend) && (
        <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          {subValue && <span>{subValue}</span>}
          {trend && (
            <span
              className={`font-mono font-medium inline-flex items-center gap-0.5 tabular-nums ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {trend.isPositive ? '▲' : '▼'} {Math.abs(trend.value)}%
              {trend.label && <span className="text-slate-500 text-[10px] ml-1">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
