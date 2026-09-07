import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Clock, 
  Undo2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronRight
} from 'lucide-react';
import type { JobApplication, DashboardInsightData } from '../../types';
import { applicationApi, aiApi } from '../../api';
import { ApplicationTimeline } from '../../components/ApplicationTimeline';
import { AIInsightCard } from '../../components/AIInsightCard';
import { StatusBarChart } from '../../components/charts/StatusBarChart';

export const ApplicationsTrackerView: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  // AI Insight State
  const [aiInsightData, setAiInsightData] = useState<DashboardInsightData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
    loadCandidateInsight(false);
  }, []);

  const loadCandidateInsight = async (refresh: boolean = false) => {
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await aiApi.getDashboardInsight('candidate', refresh);
      setAiInsightData(res);
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'Không thể kết nối đến Trợ lý AI');
    } finally {
      setAiLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const list = await applicationApi.getMyApplications();
      setApplications(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này? Hành động này sẽ thông báo tới nhà tuyển dụng.')) {
      try {
        await applicationApi.withdrawApplication(appId);
        loadApplications();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể rút hồ sơ');
      }
    }
  };

  const stats = {
    total: applications.length,
    inReview: applications.filter(a => ['submitted', 'received', 'under_review'].includes(a.status)).length,
    interviewing: applications.filter(a => ['interview_invited', 'interviewed'].includes(a.status)).length,
    passed: applications.filter(a => a.status === 'passed').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Theo dõi Đơn ứng tuyển
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quản lý toàn bộ hồ sơ đã nộp và theo dõi dòng thời gian xử lý 7 giai đoạn từ nhà tuyển dụng.
        </p>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng hồ sơ đã nộp</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Đang xem xét</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.inReview}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase">Phỏng vấn</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.interviewing}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Đã trúng tuyển 🏆</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.passed}</p>
        </div>
      </div>

      {/* AI Insight Card for Candidate */}
      <AIInsightCard
        role="candidate"
        insightText={aiInsightData?.insight}
        isCached={aiInsightData?.is_cached}
        generatedAt={aiInsightData?.generated_at}
        loading={aiLoading}
        error={aiError}
        onRefresh={() => loadCandidateInsight(true)}
      />

      {/* Candidate Performance Overview */}
      <StatusBarChart
        title="Phân bổ Tiến độ Ứng tuyển"
        subtitle="Tỉ lệ hồ sơ phân theo từng giai đoạn xử lý từ nhà tuyển dụng"
        layout="horizontal"
        data={(() => {
          const statusItems = aiInsightData?.stats?.application_statuses || [];
          const statusColors: Record<string, string> = {
            submitted: '#3b82f6',
            received: '#06b6d4',
            under_review: '#8b5cf6',
            interview_invited: '#f59e0b',
            interviewed: '#eab308',
            passed: '#10b981',
            rejected: '#ef4444',
            withdrawn: '#94a3b8',
          };
          const statusNames: Record<string, string> = {
            submitted: 'Đã nộp đơn',
            received: 'Đã tiếp nhận',
            under_review: 'Đang đánh giá',
            interview_invited: 'Mời phỏng vấn',
            interviewed: 'Đã phỏng vấn',
            passed: 'Trúng tuyển',
            rejected: 'Từ chối',
            withdrawn: 'Đã rút đơn',
          };

          if (statusItems.length > 0) {
            return statusItems.map((s: any) => ({
              label: statusNames[s.status] || s.status,
              value: Number(s.count) || 0,
              color: statusColors[s.status] || '#64748b',
            }));
          }

          // Fallback calculated from current applications state
          return [
            { label: 'Đang xem xét', value: stats.inReview, color: '#3b82f6' },
            { label: 'Phỏng vấn', value: stats.interviewing, color: '#f59e0b' },
            { label: 'Trúng tuyển', value: stats.passed, color: '#10b981' },
            { label: 'Khác (Từ chối/Rút)', value: Math.max(0, stats.total - stats.inReview - stats.interviewing - stats.passed), color: '#94a3b8' },
          ].filter(i => i.value > 0);
        })()}
        emptyMessage="Chưa có dữ liệu trạng thái đơn nộp"
      />

      {/* Applications List */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách hồ sơ ứng tuyển...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Bạn chưa nộp hồ sơ ứng tuyển nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khám phá các việc làm phù hợp và nộp bản CV của bạn ngay hôm nay!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5"
            >
              {/* Application Top Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">{app.company_name || 'Doanh nghiệp'}</span>
                    <h3 className="text-lg font-bold text-slate-900">{app.job_title || 'Tin tuyển dụng'}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>Bản CV sử dụng: <strong>{app.cv_name || 'CV Mặc định'}</strong></span>
                      {app.career_orientation && <span>({app.career_orientation})</span>}
                    </div>
                  </div>
                </div>

                {/* Withdraw action if in active stage */}
                {['submitted', 'received', 'under_review'].includes(app.status) && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Rút hồ sơ
                  </button>
                )}
              </div>

              {/* Embedded 7-Stage Timeline Visualizer */}
              <ApplicationTimeline
                status={app.status}
                applicationDate={app.application_date}
                updatedDate={app.status_updated_date}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
