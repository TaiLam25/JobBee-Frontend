import React from 'react';
import { RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { AdminButton } from './AdminButton';
import type { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onRefresh: () => void;
  loading?: boolean;
  isDemoMode?: boolean;
  actionQueueCount?: number;
  onNavigateToQueue?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onRefresh,
  loading = false,
  isDemoMode = false,
  actionQueueCount = 0,
  onNavigateToQueue,
}) => {
  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tổng quan Hệ thống',
      subtitle: 'Theo dõi hàng đợi kiểm duyệt, chỉ số vận hành và xu hướng tăng trưởng nền tảng',
    },
    verifications: {
      title: 'Xét duyệt Xác minh Doanh nghiệp',
      subtitle: 'Đối soát giấy tờ pháp lý, giấy phép kinh doanh của các nhà tuyển dụng mới',
    },
    jobs: {
      title: 'Kiểm duyệt Tin tuyển dụng',
      subtitle: 'Kiểm duyệt nội dung tin đăng, phòng chống tin rác, đa cấp và lừa đảo',
    },
    accounts: {
      title: 'Quản lý Tài khoản Người dùng',
      subtitle: 'Tra cứu thông tin, phân quyền và khóa / mở khóa tài khoản vi phạm chính sách',
    },
    analytics: {
      title: 'Thống kê & Báo cáo Chuyên sâu',
      subtitle: 'Phân tích đa chiều dữ liệu việc làm, tỷ lệ chuyển đổi và hiệu suất kiểm duyệt',
    },
  };

  const current = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-100 tracking-tight">{current.title}</h1>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono font-semibold text-cyan-300">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              Demo Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {actionQueueCount > 0 && onNavigateToQueue && (
          <button
            onClick={onNavigateToQueue}
            className="px-2.5 py-1.5 rounded-md bg-amber-950/70 border border-amber-800/80 text-amber-300 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-900/80 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Hàng đợi ({actionQueueCount})</span>
          </button>
        )}

        <AdminButton
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          loading={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Làm mới
        </AdminButton>
      </div>
    </header>
  );
};
