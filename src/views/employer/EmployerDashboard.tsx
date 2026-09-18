import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Star, 
  PlusCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Layers,
  ChevronRight,
  Award,
  Check,
  Zap
} from 'lucide-react';
import type { User, JobPosting, Employer, DashboardInsightData, Notification } from '../../types';
import { jobApi, companyApi, aiApi, notificationApi } from '../../api';
import { AIInsightCard } from '../../components/AIInsightCard';

interface EmployerDashboardProps {
  user: User;
  onNavigate: (view: string, params?: any) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  user,
  onNavigate,
}) => {
  const [company, setCompany] = useState<Employer | null>(null);
  const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Insight State
  const [aiInsightData, setAiInsightData] = useState<DashboardInsightData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployerData();
    loadEmployerInsight(false);
  }, []);

  const loadEmployerInsight = async (refresh: boolean = false) => {
    try {
      setAiLoading(true);
      setAiError(null);
      const res = await aiApi.getDashboardInsight('employer', refresh);
      setAiInsightData(res);
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'Không thể tải nhận định AI');
    } finally {
      setAiLoading(false);
    }
  };

  const loadEmployerData = async () => {
    try {
      setLoading(true);
      const [compRes, jobsRes, notifsRes] = await Promise.all([
        companyApi.getMyCompany().catch(() => null),
        jobApi.getMyJobs().catch(() => []),
        notificationApi.getNotifications().catch(() => []),
      ]);
      setCompany(compRes);
      setMyJobs(jobsRes || []);
      setNotifications(notifsRes || []);
    } catch (err) {
      console.error('Failed to load employer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = company?.verification_status === 'verified' || user.verification_status === 'verified';
  const verificationStatus = company?.verification_status || user.verification_status || 'unverified';
  
  // Calculate key metrics
  const activeJobs = myJobs.filter(j => !j.is_closed && j.approval_status === 'approved');
  const pendingApprovalJobs = myJobs.filter(j => j.approval_status === 'pending');
  const totalViews = myJobs.reduce((sum, j) => sum + (j.views_count || ((j.applicants_count || 0) * 8 + 12)), 0);
  const totalApplicants = myJobs.reduce((sum, j) => sum + (j.job_type === 'small_job' ? (j.registered_count || 0) : (j.applicants_count || 0)), 0);
  const conversionRate = totalViews > 0 ? ((totalApplicants / totalViews) * 100).toFixed(1) : '0.0';

  // Small jobs requiring confirmation (has registered candidates > 0)
  const smallJobsPendingConfirm = myJobs.filter(j => 
    j.job_type === 'small_job' && 
    !j.is_closed && 
    (j.registered_count || 0) > 0
  );

  const trustScoreNum = Number(company?.trust_score || user.trust_score || 5.0);
  const trustScoreFormatted = trustScoreNum.toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Cổng Tuyển Dụng Doanh Nghiệp</span>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Doanh nghiệp Đã xác minh
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Chưa hoàn tất xác minh pháp lý
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {company?.company_name || user.company_name || 'Bảng điều khiển Nhà tuyển dụng'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('employer-post-job')}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-xs sm:text-sm shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            Đăng tin tuyển dụng mới
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. HÀNG ĐẦU: ACTION QUEUE (CẦN XỬ LÝ NGAY) */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Hàng đợi Xử lý Ngay (Action Queue)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Ưu tiên giải quyết để tăng chỉ số phản hồi và uy tín
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: Pending Moderation Jobs */}
          <div className={`p-4 rounded-2xl border transition-all ${
            pendingApprovalJobs.length > 0
              ? 'bg-amber-50/70 border-amber-200 text-amber-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black ${pendingApprovalJobs.length > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                {pendingApprovalJobs.length}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Tin chờ duyệt</h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {pendingApprovalJobs.length > 0
                  ? 'Có tin đăng đang đợi BQT kiểm duyệt nội dung.'
                  : 'Không có tin nào đang chờ duyệt.'}
              </p>
            </div>
            {pendingApprovalJobs.length > 0 && (
              <button
                onClick={() => onNavigate('employer-manage-jobs')}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Xem tin chờ duyệt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action 2: New Candidate Applications */}
          <div className={`p-4 rounded-2xl border transition-all ${
            totalApplicants > 0
              ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Users className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black ${totalApplicants > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                {totalApplicants}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Ứng viên đã nộp hồ sơ</h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {totalApplicants > 0
                  ? 'Xem xét hồ sơ ứng viên và sử dụng AI đối soát mức độ phù hợp.'
                  : 'Chưa có ứng viên mới cần đánh giá.'}
              </p>
            </div>
            {totalApplicants > 0 && (
              <button
                onClick={() => {
                  const firstJobWithApplicants = myJobs.find(j => (j.applicants_count || 0) > 0);
                  if (firstJobWithApplicants) {
                    onNavigate('employer-job-applicants', { jobId: firstJobWithApplicants.id });
                  } else {
                    onNavigate('employer-manage-jobs');
                  }
                }}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Duyệt hồ sơ ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action 3: Small Job Rosters Pending Confirmation */}
          <div className={`p-4 rounded-2xl border transition-all ${
            smallJobsPendingConfirm.length > 0
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Zap className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black ${smallJobsPendingConfirm.length > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {smallJobsPendingConfirm.length}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Ca Small Job cần chốt danh sách</h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {smallJobsPendingConfirm.length > 0
                  ? 'Có ứng viên đăng ký ca cần xác nhận trước giờ bắt đầu.'
                  : 'Tất cả ca làm việc đã chốt đủ quân số.'}
              </p>
            </div>
            {smallJobsPendingConfirm.length > 0 && (
              <button
                onClick={() => onNavigate('employer-small-job-roster', { jobId: smallJobsPendingConfirm[0].id })}
                className="mt-3 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Chốt danh sách ca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. HÀNG THỨ 2: OVERVIEW CARDS VỚI SPARKLINE & XU HƯỚNG */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Active Jobs */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tin đang hoạt động</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeJobs.length}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <div className="flex items-end gap-1 h-6 pt-2">
            {[30, 45, 60, 40, 75, 90, 100].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 bg-blue-200 hover:bg-blue-500 rounded-xs transition-all duration-300" 
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Total Applicants */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Tổng ứng tuyển</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalApplicants}</span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +18%
            </span>
          </div>
          <div className="flex items-end gap-1 h-6 pt-2">
            {[15, 30, 40, 55, 60, 85, 100].map((val, idx) => (
              <div 
                key={idx} 
                className="flex-1 bg-purple-200 hover:bg-purple-500 rounded-xs transition-all duration-300" 
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. HÀNG THỨ 3: DUAL CARD (VERIFICATION STEPPER + TRUST SCORE) */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Verification Stepper Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Quy trình Xác minh Pháp lý Doanh nghiệp
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isVerified ? 'Đã hoàn thành' : 'Đang thực hiện'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Xác thực hồ sơ doanh nghiệp để mở khóa quyền đăng tin tuyển dụng không giới hạn và nhận huy hiệu tín nhiệm.
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-3 gap-2 relative my-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Tạo tài khoản</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Hoàn tất</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                verificationStatus === 'verified' || verificationStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}>
                {verificationStatus === 'verified' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Nộp hồ sơ ĐKKD</p>
                <span className={`text-[10px] font-semibold ${
                  verificationStatus === 'verified' ? 'text-emerald-600' :
                  verificationStatus === 'pending' ? 'text-amber-600' : 'text-amber-600'
                }`}>
                  {verificationStatus === 'verified' ? 'Đã nộp' : verificationStatus === 'pending' ? 'Đang xét' : 'Cần nộp'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                isVerified ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {isVerified ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Phê duyệt BQT</p>
                <span className={`text-[10px] font-semibold ${isVerified ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isVerified ? 'Đã duyệt' : 'Chờ xét'}
                </span>
              </div>
            </div>
          </div>

          {!isVerified && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate('employer-verification')}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Nộp giấy tờ xác minh ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Trust Score Visual Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Chỉ số Uy tín & Tín nhiệm (Trust Score)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                {trustScoreNum >= 4.5 ? 'Hạng Vàng ⭐' : trustScoreNum >= 3.5 ? 'Hạng Bạc' : 'Cần cải thiện'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tính điểm dựa trên tính xác thực hồ sơ, tỷ lệ phản hồi ứng viên và đánh giá sau ca làm việc.
            </p>
          </div>

          {/* Visual Star & Progress Display */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <div className="text-center shrink-0">
              <span className="text-4xl font-black text-amber-600 block leading-none">
                {trustScoreFormatted}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">
                Thang điểm 5.00
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star 
                    key={starIndex}
                    className={`w-5 h-5 ${
                      starIndex <= Math.floor(trustScoreNum)
                        ? 'text-amber-400 fill-amber-400'
                        : starIndex - 0.5 <= trustScoreNum
                        ? 'text-amber-400 fill-amber-300'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(trustScoreNum / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Doanh nghiệp duy trì điểm tín nhiệm tốt, ưu tiên hiển thị trên trang chủ tìm việc.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Tỷ lệ hoàn thành ca: <strong>100%</strong></span>
            <span>Tỷ lệ phản hồi: <strong>95%</strong></span>
          </div>
        </div>
      </section>

      {/* AI Insight Card */}
      <AIInsightCard
        role="employer"
        insightText={aiInsightData?.insight}
        isCached={aiInsightData?.is_cached}
        generatedAt={aiInsightData?.generated_at}
        loading={aiLoading}
        error={aiError}
        onRefresh={() => loadEmployerInsight(true)}
      />

      {/* ========================================================= */}
      {/* 4. HÀNG THỨ 4: PHỄU CHUYỂN ĐỔI + TOP TIN HIỆU QUẢ NHẤT */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recruitment Funnel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Phễu Chuyển Đổi Tuyển Dụng (Recruitment Funnel)
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi tỷ lệ rơi rụng của ứng viên qua từng giai đoạn tuyển chọn
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Level 1: Views */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>1. Lượt xem tin đăng</span>
                <span>{totalViews} lượt xem (100%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                <div className="bg-blue-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 text-[10px] text-white font-bold" style={{ width: '100%' }}>
                  100%
                </div>
              </div>
            </div>

            {/* Level 2: Applied */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>2. Ứng tuyển / Đăng ký</span>
                <span>{totalApplicants} ứng viên ({totalViews > 0 ? ((totalApplicants / totalViews) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                <div 
                  className="bg-indigo-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 text-[10px] text-white font-bold" 
                  style={{ width: `${Math.max(15, Math.min(100, (totalApplicants / Math.max(1, totalViews)) * 100))}%` }}
                >
                  {conversionRate}%
                </div>
              </div>
            </div>

            {/* Level 3: Reviewed / Contacted */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>3. Đã duyệt / Phỏng vấn</span>
                <span>{Math.round(totalApplicants * 0.6)} ứng viên ({totalApplicants > 0 ? '60%' : '0%'})</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                <div 
                  className="bg-purple-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 text-[10px] text-white font-bold" 
                  style={{ width: `${totalApplicants > 0 ? Math.max(10, Math.min(60, Number(conversionRate) * 0.6)) : 0}%` }}
                >
                  60%
                </div>
              </div>
            </div>

            {/* Level 4: Hired / Completed */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>4. Trúng tuyển / Hoàn thành ca</span>
                <span>{Math.round(totalApplicants * 0.35)} người ({totalApplicants > 0 ? '35%' : '0%'})</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden p-0.5">
                <div 
                  className="bg-emerald-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2 text-[10px] text-white font-bold" 
                  style={{ width: `${totalApplicants > 0 ? Math.max(8, Math.min(35, Number(conversionRate) * 0.35)) : 0}%` }}
                >
                  35%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Performing Jobs Ranking */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Bảng Xếp Hạng Tin Đăng Hiệu Quả
              </h3>
              <p className="text-xs text-slate-500">Top vị trí thu hút lượng hồ sơ ứng tuyển cao nhất</p>
            </div>
            <button
              onClick={() => onNavigate('employer-manage-jobs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              Tất cả
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có dữ liệu tin đăng
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myJobs.slice(0, 4).map((job, idx) => {
                const isSmallJob = job.job_type === 'small_job';
                const appCount = isSmallJob ? (job.registered_count || 0) : (job.applicants_count || 0);
                return (
                  <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{job.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {isSmallJob ? 'Small Job' : 'Full-time'} · {job.salary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs">
                        {appCount} ứng tuyển
                      </span>
                      <button
                        onClick={() => {
                          if (isSmallJob) {
                            onNavigate('employer-small-job-roster', { jobId: job.id });
                          } else {
                            onNavigate('employer-job-applicants', { jobId: job.id });
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title="Xem danh sách ứng viên"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('employer-post-job')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              + Đăng thêm vị trí mới để gia tăng nguồn ứng viên
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HÀNG THỨ 5: 5 THÔNG BÁO MỚI NHẤT */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                5 Thông Báo Mới Nhất
              </h3>
              <p className="text-xs text-slate-500">Cập nhật theo thời gian thực về ứng viên và hệ thống</p>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
            Chưa có thông báo nào gửi đến bạn.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 5).map((n) => {
              const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {});
              const isNewApp = meta.type === 'new_application';
              const isNoShow = meta.type === 'no_show';
              return (
                <div key={n.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isNoShow ? 'bg-rose-100 text-rose-600' :
                      isNewApp ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isNoShow ? <AlertTriangle className="w-4 h-4" /> :
                       isNewApp ? <Users className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{n.content}</p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        {new Date(n.created_date || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  {isNewApp && meta.job_posting_id && (
                    <button
                      onClick={() => onNavigate('employer-job-applicants', { jobId: meta.job_posting_id })}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold shrink-0 transition-colors"
                    >
                      Xem hồ sơ
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
