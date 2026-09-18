import React from 'react';
import { MapPin } from 'lucide-react';

interface TopProvincesWidgetProps {
  data?: { name: string; count: number }[];
}

export const TopProvincesWidget: React.FC<TopProvincesWidgetProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-4 flex items-center justify-center text-xs text-slate-500 italic h-[240px]">
        Chưa có dữ liệu phân bổ tỉnh thành
      </div>
    );
  }

  const maxCount = Math.max(...data.map((p) => p.count), 1);
  const totalJobs = data.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Khu vực tuyển dụng hàng đầu
            </h3>
            <p className="text-[11px] text-slate-400">
              Top 6 Tỉnh/Thành phố có số lượng tin đăng lớn nhất ({totalJobs.toLocaleString()} tin)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {data.map((prov, idx) => {
          const percent = Math.round((prov.count / maxCount) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {prov.name}
                </span>
                <span className="font-mono text-slate-400 font-bold text-[11px]">
                  {prov.count.toLocaleString()} tin
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
