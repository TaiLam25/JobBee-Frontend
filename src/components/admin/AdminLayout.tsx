import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import type { User } from '../../types';

interface AdminLayoutProps {
  children: (activeTab: AdminTab, setActiveTab: (tab: AdminTab) => void) => React.ReactNode;
  currentUser?: User | null;
  onLogout?: () => void;
  badgeCounts?: {
    pendingEmployers?: number;
    pendingJobs?: number;
  };
  isDemoMode?: boolean;
  onRefresh: () => void;
  loading?: boolean;
  initialTab?: AdminTab;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentUser,
  onLogout,
  badgeCounts = {},
  isDemoMode = false,
  onRefresh,
  loading = false,
  initialTab = 'dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const totalActionQueue = 
    (badgeCounts.pendingEmployers || 0) + 
    (badgeCounts.pendingJobs || 0);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Fixed Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeCounts={badgeCounts}
        currentUser={currentUser}
        onLogout={onLogout}
        isDemoMode={isDemoMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onRefresh={onRefresh}
          loading={loading}
          isDemoMode={isDemoMode}
          actionQueueCount={totalActionQueue}
          onNavigateToQueue={() => {
            if ((badgeCounts.pendingEmployers || 0) > 0) setActiveTab('verifications');
            else if ((badgeCounts.pendingJobs || 0) > 0) setActiveTab('jobs');
          }}
        />

        {/* Demo Mode Notice Banner if Active */}
        {isDemoMode && (
          <div className="bg-cyan-950/40 border-b border-cyan-800/40 px-6 py-2 text-[11px] text-cyan-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                <strong>Chế độ Auto-Approve Demo đang bật:</strong> Hệ thống tự động phê duyệt Employer và Tin tuyển dụng mới sau độ trễ 5–20 giây và ghi đầy đủ audit trail.
              </span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono hidden md:inline">
              AUTO_APPROVE_DEMO=true
            </span>
          </div>
        )}

        {/* Dynamic Page View Body */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {children(activeTab, setActiveTab)}
        </main>
      </div>
    </div>
  );
};
