import React from 'react';
import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import type { AvgApprovalTime } from '../../../types';

interface AvgApprovalTimeCardProps {
  data?: AvgApprovalTime;
}

export const AvgApprovalTimeCard: React.FC<AvgApprovalTimeCardProps> = ({ data }) => {
  const empHours = data?.employer?.hours ?? 2.4;
  const empDiff = data?.employer?.diff_percent ?? -15;

  const jobHours = data?.job?.hours ?? 0.8;
  const jobDiff = data?.job?.diff_percent ?? -25;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Employer SLA */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Thời gian duyệt Doanh nghiệp</span>
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {empHours} <span className="text-xs font-normal text-slate-400">giờ</span>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium tabular-nums ${
              empDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {empDiff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {Math.abs(empDiff)}% vs kỳ trước
          </span>
        </div>
      </div>

      {/* Job SLA */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Thời gian duyệt Tin tuyển dụng</span>
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {jobHours} <span className="text-xs font-normal text-slate-400">giờ</span>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium tabular-nums ${
              jobDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {jobDiff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {Math.abs(jobDiff)}% vs kỳ trước
          </span>
        </div>
      </div>
    </div>
  );
};
