import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Eye, 
  Calendar, 
  Award, 
  XCircle, 
  Undo2 
} from 'lucide-react';
import type { JobApplicationStatus } from '../types';

interface ApplicationTimelineProps {
  status: JobApplicationStatus;
  applicationDate: string;
  updatedDate?: string;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  status,
  applicationDate,
  updatedDate,
}) => {
  const steps: { key: JobApplicationStatus; label: string; desc: string; icon: any }[] = [
    { key: 'submitted', label: 'Đã nộp đơn', desc: 'Hồ sơ đã gửi tới NTD', icon: Clock },
    { key: 'received', label: 'Đã tiếp nhận', desc: 'NTD đã mở xem hồ sơ', icon: Eye },
    { key: 'under_review', label: 'Đang xem xét', desc: 'Đánh giá chuyên môn', icon: CheckCircle2 },
    { key: 'interview_invited', label: 'Mời phỏng vấn', desc: 'Đã gửi lịch phỏng vấn', icon: Calendar },
    { key: 'interviewed', label: 'Đã phỏng vấn', desc: 'Hoàn thành phỏng vấn', icon: CheckCircle2 },
    { key: 'passed', label: 'Trúng tuyển', desc: 'Chúc mừng bạn đã đạt!', icon: Award },
  ];

  const getStepIndex = (st: JobApplicationStatus) => {
    switch (st) {
      case 'submitted': return 0;
      case 'received': return 1;
      case 'under_review': return 2;
      case 'interview_invited': return 3;
      case 'interviewed': return 4;
      case 'passed': return 5;
      case 'rejected': return 2; // Failed at review or interview
      case 'withdrawn': return 0;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tiến trình xử lý hồ sơ (7 giai đoạn)
        </h4>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
          status === 'rejected' ? 'bg-red-100 text-red-800' :
          status === 'withdrawn' ? 'bg-slate-200 text-slate-700' :
          status === 'interview_invited' ? 'bg-purple-100 text-purple-800 animate-pulse' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status === 'submitted' && 'Chờ tiếp nhận'}
          {status === 'received' && 'Đã tiếp nhận'}
          {status === 'under_review' && 'Đang đánh giá'}
          {status === 'interview_invited' && 'Mời phỏng vấn 🎉'}
          {status === 'interviewed' && 'Đã phỏng vấn'}
          {status === 'passed' && 'Đã trúng tuyển 🏆'}
          {status === 'rejected' && 'Chưa phù hợp'}
          {status === 'withdrawn' && 'Đã rút đơn'}
        </span>
      </div>

      {/* Special state alerts */}
      {isRejected && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Hồ sơ chưa phù hợp với tiêu chí tuyển dụng ở thời điểm hiện tại. Đừng nản lòng, hãy khám phá các cơ hội khác trên JobBee!</span>
        </div>
      )}

      {isWithdrawn && (
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
          <Undo2 className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Bạn đã chủ động rút hồ sơ ứng tuyển này.</span>
        </div>
      )}

      {/* Step visualizer */}
      <div className="relative py-2">
        <div className="hidden sm:grid sm:grid-cols-6 gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || (idx === currentIndex && status === 'passed');
            const isCurrent = idx === currentIndex && !isRejected && !isWithdrawn;
            const Icon = step.icon;

            return (
              <div key={step.key} className="text-center relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={`absolute top-4 -left-1/2 w-full h-0.5 z-0 ${
                      idx <= currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full mx-auto relative z-10 flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110 shadow-md'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <p className={`text-xs font-bold mt-2 ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical list */}
        <div className="sm:hidden space-y-3 pl-4 border-l-2 border-slate-200">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step.key} className="relative pl-3">
                <div
                  className={`absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                    isCompleted ? 'bg-blue-600 border-white ring-2 ring-blue-300' : 'bg-slate-300 border-white'
                  }`}
                />
                <p className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Nộp ngày: {new Date(applicationDate).toLocaleDateString('vi-VN')}</span>
        {updatedDate && <span>Cập nhật gần nhất: {new Date(updatedDate).toLocaleDateString('vi-VN')}</span>}
      </div>
    </div>
  );
};
