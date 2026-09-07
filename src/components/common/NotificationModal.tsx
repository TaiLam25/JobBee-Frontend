import React from 'react';
import { 
  Bell, 
  X, 
  UserCheck, 
  AlertTriangle, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import type { Notification } from '../../types';

interface NotificationModalProps {
  notification: Notification | null;
  queueLength: number;
  onDismiss: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  queueLength,
  onDismiss,
  onNavigate,
}) => {
  if (!notification) return null;

  const metadata = notification.metadata || {};
  const notifType = metadata.type || '';

  const handleAction = () => {
    onDismiss();
    if (notifType === 'new_application' && metadata.job_posting_id) {
      onNavigate('employer-job-applicants', { jobId: metadata.job_posting_id });
    } else if (metadata.job_type === 'small_job' && metadata.job_posting_id) {
      onNavigate('employer-small-job-roster', { jobId: metadata.job_posting_id });
    } else if (notification.link) {
      if (notification.link.startsWith('/')) {
        const route = notification.link.slice(1);
        onNavigate(route);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Top Header / Accent Bar */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          notifType === 'no_show' 
            ? 'bg-rose-50 border-b border-rose-100 text-rose-900' 
            : notifType === 'new_application'
            ? 'bg-blue-50 border-b border-blue-100 text-blue-900'
            : 'bg-indigo-50 border-b border-indigo-100 text-indigo-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              notifType === 'no_show'
                ? 'bg-rose-100 text-rose-600'
                : notifType === 'new_application'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-indigo-600 text-white shadow-sm'
            }`}>
              {notifType === 'no_show' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : notifType === 'new_application' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {notifType === 'new_application' ? 'Ứng tuyển mới' : notifType === 'no_show' ? 'Cảnh báo vi phạm' : 'Thông báo hệ thống'}
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-none mt-0.5">
                {notification.title || 'Thông báo mới'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queueLength > 1 && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-200 text-slate-700">
                1 / {queueLength}
              </span>
            )}
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Specific View: New Application */}
          {notifType === 'new_application' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Vị trí: {metadata.job_title || 'Tin tuyển dụng'}</span>
                </div>
                {metadata.candidate_name && (
                  <div className="text-xs text-slate-700">
                    Ứng viên <strong className="text-slate-900 font-semibold">{metadata.candidate_name}</strong> vừa gửi hồ sơ ứng tuyển vào vị trí này.
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {notification.content}
              </p>
            </div>
          ) : notifType === 'no_show' ? (
            /* Specific View: No-Show Incident */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Ghi nhận sự cố vắng mặt không phép</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {notification.content}
                </p>
              </div>
            </div>
          ) : (
            /* Default View */
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {notification.content}
              </p>
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(notification.created_date || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {notifType === 'new_application' ? (
            <>
              <button
                onClick={onDismiss}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Để sau
              </button>
              <button
                onClick={handleAction}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors"
              >
                <span>Xem hồ sơ ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : notifType === 'no_show' ? (
            <button
              onClick={onDismiss}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-colors"
            >
              Xác nhận & Đóng
            </button>
          ) : (
            <button
              onClick={handleAction}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>{notification.link ? 'Xem chi tiết' : 'Đã hiểu'}</span>
              {notification.link && <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
