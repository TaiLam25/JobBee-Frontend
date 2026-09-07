import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  AlertTriangle,
  Users,
  BarChart3,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';
import type { User } from '../../types';

export type AdminTab = 
  | 'dashboard' 
  | 'verifications' 
  | 'jobs' 
  | 'accounts' 
  | 'analytics';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  badgeCounts?: {
    pendingEmployers?: number;
    pendingJobs?: number;
  };
  currentUser?: User | null;
  onLogout?: () => void;
  isDemoMode?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  badgeCounts = {},
  currentUser,
  onLogout,
  isDemoMode = false,
}) => {
  const navItems = [
    {
      key: 'dashboard' as AdminTab,
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      key: 'verifications' as AdminTab,
      label: 'Duyệt doanh nghiệp',
      icon: <Building2 className="w-4 h-4" />,
      badge: badgeCounts.pendingEmployers || 0,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800/80',
    },
    {
      key: 'jobs' as AdminTab,
      label: 'Duyệt tin đăng',
      icon: <Briefcase className="w-4 h-4" />,
      badge: badgeCounts.pendingJobs || 0,
      badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-800/80',
    },
    {
      key: 'accounts' as AdminTab,
      label: 'Quản lý tài khoản',
      icon: <Users className="w-4 h-4" />,
      badge: null,
    },
    {
      key: 'analytics' as AdminTab,
      label: 'Thống kê chuyên sâu',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen text-slate-300 selection:bg-indigo-500 selection:text-white">
      {/* Brand & System Title */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
              JobBee <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">Admin</span>
            </div>
            <p className="text-[10px] text-slate-400">Bảng điều khiển quản trị</p>
          </div>
        </div>
      </div>

      {/* Demo Mode Badge if Active */}
      {isDemoMode && (
        <div className="mx-3 mt-3 px-2.5 py-1.5 rounded-md bg-cyan-950/70 border border-cyan-800/70 text-[11px] text-cyan-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-medium">Demo Mode Đang Bật</span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Phân hệ quản trị
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 text-white font-semibold shadow-xs border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && item.badge > 0 ? (
                <span
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer / Current Admin Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a12]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || currentUser?.email || 'Quản trị viên'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser?.email || 'admin@jobbee.vn'}
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống quản trị"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
