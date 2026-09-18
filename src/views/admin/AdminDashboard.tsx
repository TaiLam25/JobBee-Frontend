import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Building2,
  Briefcase,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  Star,
  ShieldCheck,
  Download,
  FileCode,
  Sparkles,
  Maximize2,
  FileSpreadsheet
} from 'lucide-react';
import type {
  User,
  Employer,
  JobPosting,
  AdminAnalyticsData,
  AdminAnalyticsRange,
  PaginationMeta,
  VerificationDocumentInfo,
} from '../../types';
import { adminApi } from '../../api';

// Dedicated Admin Components
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTab } from '../../components/admin/AdminSidebar';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminPagination } from '../../components/admin/AdminPagination';

// Dedicated Admin Charts
import { AccountsGrowthChart } from '../../components/admin/charts/AccountsGrowthChart';
import { JobPostingsGrowthChart } from '../../components/admin/charts/JobPostingsGrowthChart';
import { ApprovalStatusChart } from '../../components/admin/charts/ApprovalStatusChart';
import { RoleDistributionChart } from '../../components/admin/charts/RoleDistributionChart';
import { VerificationBreakdownChart } from '../../components/admin/charts/VerificationBreakdownChart';
import { AvgApprovalTimeCard } from '../../components/admin/charts/AvgApprovalTimeCard';
import { JobsByIndustryChart } from '../../components/admin/charts/JobsByIndustryChart';
import { SalaryDistributionChart } from '../../components/admin/charts/SalaryDistributionChart';
import { TopProvincesWidget } from '../../components/admin/charts/TopProvincesWidget';

interface AdminDashboardProps {
  initialTab?: AdminTab;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'dashboard',
  currentUser,
  onLogout,
}) => {
  const [loading, setLoading] = useState(true);
  const [analyticsRange, setAnalyticsRange] = useState<AdminAnalyticsRange>('30d');
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);

  // Pagination states
  const [companyPagination, setCompanyPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [accountPagination, setAccountPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [jobPagination, setJobPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 50, totalPages: 1 });
  // Entities state
  const [pendingCompanies, setPendingCompanies] = useState<Employer[]>([]);
  const [allCompanies, setAllCompanies] = useState<Employer[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobPosting[]>([]);
  const [accounts, setAccounts] = useState<User[]>([]);
  // Filters & Search
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>('all');
  const [companySearch, setCompanySearch] = useState<string>('');
  const [accountRoleFilter, setAccountRoleFilter] = useState<string>('all');
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [accountLockedFilter, setAccountLockedFilter] = useState<string>('all');
  // Modals state
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<(Employer & { jobs?: JobPosting[] }) | null>(null);
  const [loadingEmployerDetail, setLoadingEmployerDetail] = useState(false);

  // Verification Document Viewer Modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docInfo, setDocInfo] = useState<VerificationDocumentInfo | null>(null);
  const [gdocsViewerActive, setGdocsViewerActive] = useState(false);

  // Fetch functions with pagination
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await adminApi.getAnalytics(analyticsRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [analyticsRange]);

  const fetchCompanies = useCallback(async (page = 1, limit = 50, status = companyStatusFilter, search = companySearch) => {
    try {
      const res = await adminApi.getCompanies({ page, limit, status: status === 'all' ? undefined : status, search: search.trim() || undefined });
      setAllCompanies(res.data);
      setCompanyPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  }, [companyStatusFilter, companySearch]);

  const fetchAccounts = useCallback(async (page = 1, limit = 50, role = accountRoleFilter, search = accountSearch, isLocked = accountLockedFilter) => {
    try {
      const res = await adminApi.getAllAccounts({
        page,
        limit,
        role: role === 'all' ? undefined : role,
        search: search.trim() || undefined,
        is_locked: isLocked === 'all' ? undefined : isLocked,
      });
      setAccounts(res.data);
      setAccountPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  }, [accountRoleFilter, accountSearch, accountLockedFilter]);

  const fetchPendingJobs = useCallback(async (page = 1, limit = 50) => {
    try {
      const res = await adminApi.getPendingJobs({ page, limit });
      setPendingJobs(res.data);
      setJobPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching pending jobs:', err);
    }
  }, []);
  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAnalytics(),
        fetchCompanies(1, companyPagination.limit),
        fetchAccounts(1, accountPagination.limit),
        fetchPendingJobs(1, jobPagination.limit),
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [analyticsRange]);

  // View Employer Detail Profile
  const handleViewEmployerProfile = async (employerId: number) => {
    try {
      setLoadingEmployerDetail(true);
      const detail = await adminApi.getCompanyById(employerId);
      setSelectedEmployer(detail);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tải chi tiết hồ sơ doanh nghiệp');
    } finally {
      setLoadingEmployerDetail(false);
    }
  };

  // View Verification Document (Signed URL)
  const handleViewVerificationDoc = async (employerId: number) => {
    try {
      setLoadingDoc(true);
      setDocModalOpen(true);
      setGdocsViewerActive(false);
      const doc = await adminApi.getVerificationDocSignedUrl(employerId);
      setDocInfo(doc);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể lấy liên kết tài liệu xác minh');
    } finally {
      setLoadingDoc(false);
    }
  };

  // 1. Verify Employer Action
  const handleVerifyCompany = async (id: number, status: 'verified' | 'rejected') => {
    try {
      await adminApi.verifyCompany(id, status);
      await Promise.all([
        fetchCompanies(companyPagination.page, companyPagination.limit),
        fetchAnalytics(),
      ]);
      if (selectedEmployer && selectedEmployer.id === id) {
        setSelectedEmployer(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi xét duyệt doanh nghiệp');
    }
  };

  // 2. Moderate Job Action
  const handleModerateJob = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminApi.moderateJob(id, status);
      setSelectedJob(null);
      await Promise.all([
        fetchPendingJobs(jobPagination.page, jobPagination.limit),
        fetchAnalytics(),
      ]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi kiểm duyệt tin đăng');
    }
  };

  // 3. Toggle Lock Account Action
  const handleToggleLockAccount = async (id: number, currentLocked: boolean) => {
    const actionText = currentLocked ? 'mở khóa' : 'khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
      try {
        await adminApi.lockAccount(id, !currentLocked);
        await Promise.all([
          fetchAccounts(accountPagination.page, accountPagination.limit),
          fetchAnalytics(),
        ]);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể đổi trạng thái khóa');
      }
    }
  };

  const badgeCounts = {
    pendingEmployers: analytics?.actionQueue?.pendingEmployers || 0,
    pendingJobs: analytics?.actionQueue?.pendingJobs || 0,
  };

  const isDemoMode = Boolean(analytics?.isDemoMode);

  return (
    <AdminLayout
      currentUser={currentUser}
      onLogout={onLogout}
      badgeCounts={badgeCounts}
      isDemoMode={isDemoMode}
      onRefresh={loadAllData}
      loading={loading}
      initialTab={initialTab}
    >
      {(tab, setTab) => (
        <>
          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* 1. DASHBOARD OVERVIEW TAB                                                 */}
            {/* ========================================================================= */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                {/* ACTION QUEUE (Hàng đợi cần xử lý) */}
                <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80">
                        <ShieldAlert className="w-4 h-4" />
                      </span>
                      <div>
                        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                          Hàng đợi cần xử lý (Action Queue)
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Các tác vụ kiểm duyệt và đối soát cần quyết định của Quản trị viên
                        </p>
                      </div>
                    </div>
                    {isDemoMode && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/70 animate-pulse">
                        Auto-Approve Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setTab('verifications')}
                      className="group p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {analytics?.actionQueue?.pendingEmployers || 0}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                            Doanh nghiệp chờ duyệt
                          </div>
                          <div className="text-[10px] text-slate-500">Hồ sơ pháp lý ĐKKD</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    <div
                      onClick={() => setTab('jobs')}
                      className="group p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                          {analytics?.actionQueue?.pendingJobs || 0}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                            Tin tuyển dụng chờ duyệt
                          </div>
                          <div className="text-[10px] text-slate-500">Kiểm duyệt nội dung tin</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* METRICS SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <AdminStatCard
                    title="Tổng tài khoản"
                    value={analytics?.overview?.totalAccounts ?? 0}
                    subValue={`UV: ${analytics?.overview?.accountsByRole?.find(r => r.role === 'candidate')?.count || 0} • NTD: ${analytics?.overview?.accountsByRole?.find(r => r.role === 'employer')?.count || 0}`}
                    icon={<Users className="w-4 h-4" />}
                    trend={{ value: 5, isPositive: true, label: '+5%' }}
                  />
                  <AdminStatCard
                    title="Doanh nghiệp"
                    value={analytics?.overview?.accountsByRole?.find((r) => r.role === 'employer')?.count ?? 0}
                    subValue={`Đã xác minh: ${analytics?.employerVerificationBreakdown?.find(v => v.status === 'verified')?.count || 0}`}
                    icon={<Building2 className="w-4 h-4" />}
                    trend={{ value: 12, isPositive: true, label: '+12%' }}
                  />
                  <AdminStatCard
                    title="Tin Full-time"
                    value={Math.max(0, (analytics?.overview?.totalJobs || 0) - (analytics?.overview?.totalSmallJobs || 0))}
                    subValue="Việc làm dài hạn"
                    icon={<Briefcase className="w-4 h-4" />}
                    trend={{ value: 8, isPositive: true, label: '+8%' }}
                  />
                  <AdminStatCard
                    title="Việc ngắn hạn"
                    value={analytics?.overview?.totalSmallJobs ?? 0}
                    subValue={`${analytics?.overview?.activeSmallJobs ?? 0} đang mở • ${analytics?.overview?.smallJobRegistrations ?? 0} ca`}
                    icon={<Clock className="w-4 h-4" />}
                    trend={{ value: 20, isPositive: true, label: '+20%' }}
                  />
                  <AdminStatCard
                    title="JobBee AI"
                    value={(analytics?.overview?.aiCvAnalyses || 0) + (analytics?.overview?.aiChatbotSessions || 0)}
                    subValue={`${analytics?.overview?.aiCvAnalyses || 0} CV • ${analytics?.overview?.aiChatbotSessions || 0} chat`}
                    icon={<Sparkles className="w-4 h-4 text-yellow-400" />}
                    trend={{ value: 35, isPositive: true, label: '+35%' }}
                  />
                  <AdminStatCard
                    title="Lượt ứng tuyển"
                    value={(analytics?.overview?.totalApplications || 0) + (analytics?.overview?.smallJobRegistrations || 0)}
                    subValue={`${analytics?.overview?.totalApplications || 0} đơn • ${analytics?.overview?.smallJobRegistrations || 0} ca`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    trend={{ value: 15, isPositive: true, label: '+15%' }}
                  />
                </div>

                {/* CHARTS ROW 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AccountsGrowthChart data={analytics?.accountsGrowth || []} />
                  <JobPostingsGrowthChart data={analytics?.jobPostingsGrowth || []} />
                </div>

                {/* CHARTS ROW 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ApprovalStatusChart data={analytics?.approvalStatusByWeek || []} />
                  <RoleDistributionChart data={analytics?.accountsByRole || []} />
                  <VerificationBreakdownChart data={analytics?.employerVerificationBreakdown || []} />
                </div>

                {/* CHARTS ROW 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <JobsByIndustryChart data={analytics?.jobsByIndustry || []} />
                  </div>
                  <div className="space-y-4">
                    <AvgApprovalTimeCard data={analytics?.avgApprovalTime} />
                  </div>
                </div>

                {/* CHARTS ROW 4: SALARY & PROVINCE DISTRIBUTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SalaryDistributionChart data={analytics?.salaryBreakdown} />
                  <TopProvincesWidget data={analytics?.topProvinces || []} />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. EMPLOYER VERIFICATION TAB (Duyệt Doanh nghiệp)                         */}
            {/* ========================================================================= */}
            {tab === 'verifications' && (
              <div className="space-y-4">
                {/* Header & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1322] p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      Quản lý & Xét duyệt Doanh nghiệp
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tổng số: <strong className="text-indigo-400 font-bold">{companyPagination.total}</strong> doanh nghiệp trong hệ thống
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tìm tên cty, email, SĐT, địa chỉ..."
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          fetchCompanies(1, companyPagination.limit, companyStatusFilter, e.target.value);
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={companyStatusFilter}
                        onChange={(e) => {
                          setCompanyStatusFilter(e.target.value);
                          fetchCompanies(1, companyPagination.limit, e.target.value, companySearch);
                        }}
                        className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="all">Tất cả trạng thái ({companyPagination.total})</option>
                        <option value="pending">Chờ xét duyệt</option>
                        <option value="verified">Đã xác minh</option>
                        <option value="rejected">Bị từ chối</option>
                        <option value="unverified">Chưa xác minh</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0d1322]">
                  <AdminTable
                    data={allCompanies}
                    loading={loading}
                    keyExtractor={(c) => c.id}
                    emptyText="Không tìm thấy doanh nghiệp nào phù hợp"
                    columns={[
                      {
                        key: 'company',
                        header: 'Doanh nghiệp',
                        render: (c) => (
                          <div className="flex items-center gap-3">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                                {c.company_name ? c.company_name[0] : 'C'}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                                {c.company_name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>{c.email}</span>
                                {c.phone_number && <span>• {c.phone_number}</span>}
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'trust_score',
                        header: 'Điểm uy tín',
                        align: 'center',
                        width: '100px',
                        render: (c) => (
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {Number(c.trust_score || 5).toFixed(1)} ★
                          </span>
                        ),
                      },
                      {
                        key: 'jobs_count',
                        header: 'Tin đăng',
                        align: 'center',
                        width: '90px',
                        render: (c) => (
                          <span className="font-mono text-xs text-slate-300">
                            {(c as any).total_jobs || 0} tin
                          </span>
                        ),
                      },
                      {
                        key: 'document',
                        header: 'Tài liệu ĐKKD',
                        align: 'center',
                        width: '130px',
                        render: (c) => {
                          const hasDoc = Boolean(c.verification_document);
                          const isDocx = c.verification_document && (c.verification_document.includes('.docx') || c.verification_document.includes('.doc'));
                          return (
                            <button
                              type="button"
                              onClick={() => handleViewVerificationDoc(c.id)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                                hasDoc
                                  ? isDocx
                                    ? 'bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-300'
                                    : 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-300'
                                  : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-400'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              {hasDoc ? (isDocx ? 'DOCX' : 'PDF') : 'Chưa có'}
                            </button>
                          );
                        },
                      },
                      {
                        key: 'status',
                        header: 'Trạng thái',
                        align: 'center',
                        width: '120px',
                        render: (c) => (
                          <AdminBadge variant={c.verification_status as any} dot>
                            {c.verification_status === 'verified'
                              ? 'Đã xác minh'
                              : c.verification_status === 'pending'
                              ? 'Chờ duyệt'
                              : c.verification_status === 'rejected'
                              ? 'Bị từ chối'
                              : 'Chưa xác minh'}
                          </AdminBadge>
                        ),
                      },
                      {
                        key: 'actions',
                        header: 'Thao tác',
                        align: 'right',
                        width: '180px',
                        render: (c) => (
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => handleViewEmployerProfile(c.id)}
                              title="Xem chi tiết hồ sơ & tin đăng"
                            >
                              Xem hồ sơ
                            </AdminButton>
                            {c.verification_status !== 'verified' && (
                              <AdminButton
                                variant="success"
                                size="sm"
                                icon={<Check className="w-3 h-3" />}
                                onClick={() => handleVerifyCompany(c.id, 'verified')}
                                title="Phê duyệt xác minh"
                              />
                            )}
                            {c.verification_status !== 'rejected' && (
                              <AdminButton
                                variant="danger"
                                size="sm"
                                icon={<X className="w-3 h-3" />}
                                onClick={() => handleVerifyCompany(c.id, 'rejected')}
                                title="Từ chối xác minh"
                              />
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Pagination Footer */}
                  <AdminPagination
                    pagination={companyPagination}
                    onPageChange={(page) => fetchCompanies(page, companyPagination.limit, companyStatusFilter, companySearch)}
                    onLimitChange={(limit) => fetchCompanies(1, limit, companyStatusFilter, companySearch)}
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. JOB POSTINGS MODERATION TAB (Duyệt tin đăng)                           */}
            {/* ========================================================================= */}
            {tab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 bg-[#0d1322] p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      Kiểm duyệt Tin Tuyển Dụng
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tổng số: <strong className="text-indigo-400 font-bold">{jobPagination.total}</strong> tin đang chờ kiểm duyệt
                    </p>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0d1322]">
                  <AdminTable
                    data={pendingJobs}
                    loading={loading}
                    keyExtractor={(j) => j.id}
                    emptyText="Không có tin tuyển dụng nào đang chờ duyệt"
                    columns={[
                      {
                        key: 'title',
                        header: 'Tiêu đề tin tuyển dụng',
                        render: (j) => (
                          <div>
                            <div className="font-semibold text-slate-100">{j.title}</div>
                            <div className="text-[11px] text-slate-500">{j.company_name} • {j.location}</div>
                          </div>
                        ),
                      },
                      {
                        key: 'salary',
                        header: 'Mức lương',
                        align: 'center',
                        width: '140px',
                        render: (j) => (
                          <span className="font-mono text-emerald-400 text-xs font-semibold">
                            {j.salary}
                          </span>
                        ),
                      },
                      {
                        key: 'posted_date',
                        header: 'Ngày đăng',
                        align: 'center',
                        width: '130px',
                        render: (j) => (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {j.posted_date ? new Date(j.posted_date).toLocaleDateString('vi-VN') : '—'}
                          </span>
                        ),
                      },
                      {
                        key: 'actions',
                        header: 'Thao tác',
                        align: 'right',
                        width: '160px',
                        render: (j) => (
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => setSelectedJob(j)}
                            >
                              Xem
                            </AdminButton>
                            <AdminButton
                              variant="success"
                              size="sm"
                              icon={<Check className="w-3.5 h-3.5" />}
                              onClick={() => handleModerateJob(j.id, 'approved')}
                            >
                              Duyệt
                            </AdminButton>
                            <AdminButton
                              variant="danger"
                              size="sm"
                              icon={<X className="w-3.5 h-3.5" />}
                              onClick={() => handleModerateJob(j.id, 'rejected')}
                            >
                              Từ chối
                            </AdminButton>
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Pagination Footer */}
                  <AdminPagination
                    pagination={jobPagination}
                    onPageChange={(page) => fetchPendingJobs(page, jobPagination.limit)}
                    onLimitChange={(limit) => fetchPendingJobs(1, limit)}
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. ACCOUNTS MANAGEMENT TAB (Quản lý tài khoản)                            */}
            {/* ========================================================================= */}
            {tab === 'accounts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1322] p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Quản lý Tài khoản Toàn Hệ Thống
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tổng số: <strong className="text-indigo-400 font-bold">{accountPagination.total}</strong> tài khoản đăng ký
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tìm email, số điện thoại..."
                        value={accountSearch}
                        onChange={(e) => {
                          setAccountSearch(e.target.value);
                          fetchAccounts(1, accountPagination.limit, accountRoleFilter, e.target.value, accountLockedFilter);
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Role Filter */}
                    <select
                      value={accountRoleFilter}
                      onChange={(e) => {
                        setAccountRoleFilter(e.target.value);
                        fetchAccounts(1, accountPagination.limit, e.target.value, accountSearch, accountLockedFilter);
                      }}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="candidate">Ứng viên</option>
                      <option value="employer">Nhà tuyển dụng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={accountLockedFilter}
                      onChange={(e) => {
                        setAccountLockedFilter(e.target.value);
                        fetchAccounts(1, accountPagination.limit, accountRoleFilter, accountSearch, e.target.value);
                      }}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="false">Đang hoạt động</option>
                      <option value="true">Bị khóa</option>
                    </select>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0d1322]">
                  <AdminTable
                    data={accounts}
                    loading={loading}
                    keyExtractor={(acc) => acc.id}
                    emptyText="Không tìm thấy tài khoản nào"
                    columns={[
                      {
                        key: 'email',
                        header: 'Tài khoản / Email',
                        render: (acc) => (
                          <div>
                            <div className="font-semibold text-slate-100">{acc.email}</div>
                            {acc.phone_number && (
                              <div className="text-[11px] text-slate-500 font-mono">{acc.phone_number}</div>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'role',
                        header: 'Vai trò',
                        align: 'center',
                        width: '140px',
                        render: (acc) => (
                          <AdminBadge variant={acc.role as any}>
                            {acc.role === 'admin' ? 'Quản trị viên' : acc.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                          </AdminBadge>
                        ),
                      },
                      {
                        key: 'created_date',
                        header: 'Ngày tạo',
                        align: 'center',
                        width: '130px',
                        render: (acc) => (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {acc.created_date ? new Date(acc.created_date).toLocaleDateString('vi-VN') : '—'}
                          </span>
                        ),
                      },
                      {
                        key: 'is_locked',
                        header: 'Trạng thái',
                        align: 'center',
                        width: '130px',
                        render: (acc) => (
                          <AdminBadge variant={acc.is_locked ? 'rejected' : 'verified'} dot>
                            {acc.is_locked ? 'Đang bị khóa' : 'Hoạt động'}
                          </AdminBadge>
                        ),
                      },
                      {
                        key: 'actions',
                        header: 'Thao tác',
                        align: 'right',
                        width: '130px',
                        render: (acc) => (
                          <AdminButton
                            variant={acc.is_locked ? 'success' : 'danger'}
                            size="sm"
                            icon={acc.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            onClick={() => handleToggleLockAccount(acc.id, Boolean(acc.is_locked))}
                          >
                            {acc.is_locked ? 'Mở khóa' : 'Khóa'}
                          </AdminButton>
                        ),
                      },
                    ]}
                  />

                  {/* Pagination Footer */}
                  <AdminPagination
                    pagination={accountPagination}
                    onPageChange={(page) => fetchAccounts(page, accountPagination.limit, accountRoleFilter, accountSearch, accountLockedFilter)}
                    onLimitChange={(limit) => fetchAccounts(1, limit, accountRoleFilter, accountSearch, accountLockedFilter)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MODAL 1: JOB MODERATION DETAIL                                            */}
          {/* ========================================================================= */}
          {selectedJob && (
            <AdminModal
              isOpen={Boolean(selectedJob)}
              onClose={() => setSelectedJob(null)}
              title="Kiểm duyệt tin tuyển dụng"
              subtitle={selectedJob.title}
              maxWidth="2xl"
              footer={
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-400">Đăng bởi: <strong className="text-slate-200">{selectedJob.company_name}</strong></span>
                  <div className="flex items-center gap-2">
                    <AdminButton variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                      Đóng
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      icon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleModerateJob(selectedJob.id, 'rejected')}
                    >
                      Từ chối tin
                    </AdminButton>
                    <AdminButton
                      variant="success"
                      size="sm"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleModerateJob(selectedJob.id, 'approved')}
                    >
                      Phê duyệt đăng tin
                    </AdminButton>
                  </div>
                </div>
              }
            >
              <div className="space-y-4 text-xs text-slate-300">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div><span className="text-slate-500">Mức lương:</span> <span className="font-mono text-emerald-400 font-bold ml-1">{selectedJob.salary}</span></div>
                  <div><span className="text-slate-500">Địa điểm:</span> <span className="text-slate-200 ml-1">{selectedJob.location}</span></div>
                  <div><span className="text-slate-500">Kinh nghiệm:</span> <span className="text-slate-200 ml-1">{'Không yêu cầu'}</span></div>
                  <div><span className="text-slate-500">Loại hình:</span> <span className="text-slate-200 ml-1">{selectedJob.job_type === 'small_job' ? 'Small Job (Thời vụ)' : 'Full-time'}</span></div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1">Mô tả công việc</h4>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedJob.job_description}
                  </div>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1">Yêu cầu ứng viên</h4>
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 leading-relaxed whitespace-pre-line">
                      {selectedJob.requirements}
                    </div>
                  </div>
                )}
              </div>
            </AdminModal>
          )}

          {/* MODAL 3: EMPLOYER PROFILE DETAIL MODAL FOR ADMIN                          */}
          {/* ========================================================================= */}
          <AdminModal
            isOpen={Boolean(selectedEmployer)}
            onClose={() => setSelectedEmployer(null)}
            title={selectedEmployer ? `Hồ sơ Doanh nghiệp: ${selectedEmployer.company_name}` : 'Chi tiết Doanh nghiệp'}
            subtitle="Chi tiết thông tin doanh nghiệp, tài liệu pháp lý và danh sách tin tuyển dụng đã đăng"
            maxWidth="4xl"
            footer={
              selectedEmployer && (
                <div className="flex items-center justify-between w-full flex-wrap gap-2">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>Trạng thái hiện tại:</span>
                    <AdminBadge variant={selectedEmployer.verification_status as any} dot>
                      {selectedEmployer.verification_status === 'verified' ? 'Đã xác minh' : selectedEmployer.verification_status === 'pending' ? 'Chờ duyệt' : selectedEmployer.verification_status === 'rejected' ? 'Bị từ chối' : 'Chưa xác minh'}
                    </AdminBadge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminButton variant="ghost" size="sm" onClick={() => setSelectedEmployer(null)}>
                      Đóng
                    </AdminButton>
                    {selectedEmployer.verification_status !== 'verified' && (
                      <AdminButton
                        variant="success"
                        size="sm"
                        icon={<Check className="w-3.5 h-3.5" />}
                        onClick={async () => {
                          if (selectedEmployer) {
                            await handleVerifyCompany(selectedEmployer.id, 'verified');
                          }
                        }}
                      >
                        Phê duyệt xác minh
                      </AdminButton>
                    )}
                    {selectedEmployer.verification_status !== 'rejected' && (
                      <AdminButton
                        variant="danger"
                        size="sm"
                        icon={<X className="w-3.5 h-3.5" />}
                        onClick={async () => {
                          if (selectedEmployer) {
                            await handleVerifyCompany(selectedEmployer.id, 'rejected');
                          }
                        }}
                      >
                        Từ chối xác minh
                      </AdminButton>
                    )}
                  </div>
                </div>
              )
            }
          >
            {selectedEmployer && (
              <div className="space-y-6 text-xs text-slate-300">
                {/* Top Company Banner */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {selectedEmployer.avatar_url ? (
                      <img src={selectedEmployer.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-black text-xl flex items-center justify-center shrink-0">
                        {selectedEmployer.company_name ? selectedEmployer.company_name[0] : 'C'}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100">{selectedEmployer.company_name}</h3>
                        <AdminBadge variant={selectedEmployer.verification_status as any} dot>
                          {selectedEmployer.verification_status === 'verified' ? 'Đã xác minh' : selectedEmployer.verification_status === 'pending' ? 'Chờ duyệt' : 'Chưa xác minh'}
                        </AdminBadge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                        <span>Email: <strong className="text-slate-200">{selectedEmployer.email}</strong></span>
                        <span>SĐT: <strong className="text-slate-200">{selectedEmployer.phone_number || 'Chưa cập nhật'}</strong></span>
                        <span>Điểm uy tín: <strong className="text-amber-400">{Number(selectedEmployer.trust_score || 5).toFixed(1)} ★</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid: Details & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      Thông tin Doanh nghiệp
                    </h4>
                    <div className="space-y-1.5">
                      <div><span className="text-slate-500">Địa chỉ:</span> <span className="text-slate-200 font-medium ml-1">{selectedEmployer.address || 'Chưa cập nhật'}</span></div>
                      <div><span className="text-slate-500">Website:</span> <span className="text-cyan-400 font-medium ml-1">{selectedEmployer.website || 'Chưa cập nhật'}</span></div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Giới thiệu công ty:</span>
                        <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          {selectedEmployer.description || 'Chưa có thông tin giới thiệu.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Tài liệu Pháp lý & ĐKKD
                    </h4>
                    {selectedEmployer.verification_document ? (
                      <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            Giấy phép ĐKKD / Tài liệu xác thực
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewVerificationDoc(selectedEmployer.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Xem tài liệu
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono break-all line-clamp-1">{selectedEmployer.verification_document}</div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs italic">
                        Doanh nghiệp chưa nộp tài liệu xác minh pháp lý.
                      </div>
                    )}
                    {selectedEmployer.decided_at && (
                      <div className="text-[11px] text-slate-400">
                        Thời điểm duyệt gần nhất: <span className="font-mono text-slate-300">{new Date(selectedEmployer.decided_at).toLocaleString('vi-VN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Posted Jobs Section */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Tin tuyển dụng đã đăng ({selectedEmployer.jobs?.length || 0})
                  </h4>
                  {(!selectedEmployer.jobs || selectedEmployer.jobs.length === 0) ? (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-slate-500 italic">
                      Doanh nghiệp này chưa đăng tin tuyển dụng nào.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Tiêu đề tin</th>
                            <th className="p-2.5">Loại</th>
                            <th className="p-2.5">Mức lương</th>
                            <th className="p-2.5">Trạng thái</th>
                            <th className="p-2.5 text-right">Ứng viên</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-[#0a0f1d]">
                          {selectedEmployer.jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-800/30">
                              <td className="p-2.5 font-medium text-slate-200">{job.title}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${job.job_type === 'small_job' ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-blue-950 text-blue-300 border border-blue-700'}`}>
                                  {job.job_type === 'small_job' ? 'Small Job' : 'Full-time'}
                                </span>
                              </td>
                              <td className="p-2.5 text-emerald-400 font-mono text-[11px]">{job.salary}</td>
                              <td className="p-2.5">
                                <AdminBadge variant={job.approval_status as any} dot>
                                  {job.approval_status === 'approved' ? 'Đã duyệt' : job.approval_status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                </AdminBadge>
                              </td>
                              <td className="p-2.5 text-right font-bold text-slate-300">
                                {job.job_type === 'small_job' ? (job.registered_count || 0) : (job.applicants_count || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AdminModal>

          {/* ========================================================================= */}
          {/* MODAL 4: VERIFICATION DOCUMENT VIEWER (PDF & DOCX & IMAGES)               */}
          {/* ========================================================================= */}
          <AdminModal
            isOpen={docModalOpen}
            onClose={() => {
              setDocModalOpen(false);
              setDocInfo(null);
            }}
            title={docInfo?.companyName ? `Tài liệu xác minh: ${docInfo.companyName}` : 'Tài liệu xác minh pháp lý'}
            subtitle={
              docInfo?.hasDocument
                ? `Tệp: ${docInfo.fileName || 'Tài liệu'} • Định dạng: ${(docInfo.fileType || 'PDF').toUpperCase()} • Liên kết bảo mật hiệu lực 15 phút`
                : 'Thông tin tài liệu xác minh'
            }
            maxWidth="4xl"
            footer={
              <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {docInfo?.fileType === 'docx' && (
                    <button
                      type="button"
                      onClick={() => setGdocsViewerActive(!gdocsViewerActive)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {gdocsViewerActive ? 'Xem thông tin tệp Word' : 'Xem qua Google Docs Viewer'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {docInfo?.signedUrl && (
                    <a
                      href={docInfo.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={docInfo.fileName || undefined}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shadow-indigo-500/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải tệp xuống ({docInfo.fileType?.toUpperCase() || 'FILE'})
                    </a>
                  )}
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocModalOpen(false);
                      setDocInfo(null);
                    }}
                  >
                    Đóng
                  </AdminButton>
                </div>
              </div>
            }
          >
            {loadingDoc ? (
              <div className="py-20 text-center text-slate-400">
                <div className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Đang tải và tạo liên kết truy cập tài liệu bảo mật...</span>
                </div>
              </div>
            ) : !docInfo || !docInfo.hasDocument ? (
              <div className="p-8 text-center space-y-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center mx-auto text-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Chưa nộp tài liệu xác minh</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Doanh nghiệp này chưa tải lên tệp Giấy phép đăng ký kinh doanh hoặc tài liệu xác minh pháp lý.
                </p>
              </div>
            ) : docInfo.fileType === 'pdf' ? (
              /* PDF VIEWER */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-2 font-mono">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <strong className="text-slate-200">{docInfo.fileName}</strong>
                  </span>
                  <a
                    href={docInfo.signedUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Mở toàn màn hình tab mới <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                  <iframe
                    src={docInfo.signedUrl || ''}
                    title="Tài liệu xác minh PDF"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            ) : docInfo.fileType === 'docx' ? (
              /* DOCX VIEWER */
              <div className="space-y-4">
                {gdocsViewerActive && docInfo.signedUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <span>Xem trực tuyến qua <strong>Google Docs Viewer</strong></span>
                      </span>
                      <a
                        href={`https://docs.google.com/gview?url=${encodeURIComponent(docInfo.signedUrl)}&embedded=true`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        Mở tab mới <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-700 bg-white shadow-inner">
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(docInfo.signedUrl)}&embedded=true`}
                        title="Tài liệu xác minh DOCX"
                        className="w-full h-full border-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-700 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-950/50">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-100">{docInfo.fileName}</h4>
                      <p className="text-xs text-slate-400">
                        Định dạng tệp: <strong className="text-blue-400 uppercase">Microsoft Word (.docx)</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tệp Word không hỗ trợ xem nhúng trực tiếp chuẩn browser. Bạn có thể tải file về máy để đọc bằng Microsoft Word hoặc xem nhanh qua trình đọc Google Docs.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={docInfo.signedUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        download={docInfo.fileName || undefined}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/30"
                      >
                        <Download className="w-4 h-4" />
                        Tải tệp DOCX về máy
                      </a>
                      <button
                        type="button"
                        onClick={() => setGdocsViewerActive(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Xem qua Google Docs Viewer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : docInfo.fileType === 'image' ? (
              /* IMAGE VIEWER */
              <div className="space-y-3 text-center">
                <div className="max-h-[65vh] overflow-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <img
                    src={docInfo.signedUrl || ''}
                    alt="Tài liệu xác minh"
                    className="max-h-[60vh] object-contain mx-auto rounded-lg"
                  />
                </div>
              </div>
            ) : (
              /* OTHER FORMATS */
              <div className="p-6 text-center space-y-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">{docInfo.fileName}</h4>
                <p className="text-xs text-slate-400">
                  Định dạng tệp không hỗ trợ xem trước. Vui lòng tải xuống để xem nội dung.
                </p>
                {docInfo.signedUrl && (
                  <a
                    href={docInfo.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={docInfo.fileName || undefined}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải tệp xuống
                  </a>
                )}
              </div>
            )}
          </AdminModal>
        </>
      )}
    </AdminLayout>
  );
};
