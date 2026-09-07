import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  Award,
  X,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Wrench,
  ExternalLink,
  Download,
  Search,
  Check,
  MessageSquare
} from 'lucide-react';
import type { JobApplication, JobPosting, JobApplicationStatus } from '../../types';
import { applicationApi, aiApi, jobApi } from '../../api';

interface JobApplicantsViewProps {
  jobId: number;
  onBack: () => void;
}

export const JobApplicantsView: React.FC<JobApplicantsViewProps> = ({
  jobId,
  onBack,
}) => {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobApplicationStatus>('under_review');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobData, appData] = await Promise.all([
        jobApi.getJobById(jobId),
        applicationApi.getJobApplicationsForEmployer(jobId),
      ]);
      setJob(jobData);
      setApplicants(appData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAIRanking = async () => {
    try {
      setRankingLoading(true);
      const ranked = await aiApi.rankApplicants(jobId);
      setApplicants(ranked || []);
      showToast('Đã chấm điểm và xếp hạng AI thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể chạy AI Ranking');
    } finally {
      setRankingLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCVModal = (app: JobApplication) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote(app.note || '');
    setCvModalOpen(true);
  };

  const handleOpenStatusModal = (app: JobApplication) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (appId: number, targetStatus: JobApplicationStatus, noteText?: string) => {
    try {
      setUpdating(true);
      await applicationApi.updateApplicationStatus(appId, targetStatus, noteText);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: targetStatus } : a));
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status: targetStatus } : null);
      }
      setStatusModalOpen(false);
      showToast('Cập nhật trạng thái hồ sơ thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    handleUpdateStatus(selectedApp.id, newStatus, statusNote);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = !searchTerm || 
      (app.candidate_name && app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.candidate_email && app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.skills && app.skills.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.career_orientation && app.career_orientation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && ['submitted', 'received', 'under_review'].includes(app.status)) ||
      (statusFilter === 'interview' && ['interview_invited', 'interviewed'].includes(app.status)) ||
      (statusFilter === 'passed' && app.status === 'passed') ||
      (statusFilter === 'rejected' && app.status === 'rejected') ||
      app.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const counts = {
    total: applicants.length,
    pending: applicants.filter(a => ['submitted', 'received', 'under_review'].includes(a.status)).length,
    interview: applicants.filter(a => ['interview_invited', 'interviewed'].includes(a.status)).length,
    passed: applicants.filter(a => a.status === 'passed').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const getStatusBadge = (status: JobApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Mới nộp</span>;
      case 'received':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">Đã tiếp nhận</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Đang đánh giá</span>;
      case 'interview_invited':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Mời phỏng vấn</span>;
      case 'interviewed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Đã phỏng vấn</span>;
      case 'passed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Trúng tuyển ✓</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Từ chối</span>;
      case 'withdrawn':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Đã rút đơn</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Quản lý tin tuyển dụng
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Hồ sơ ứng viên nộp vào tin</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {job?.job_type === 'small_job' ? 'Small Job' : 'Toàn thời gian'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{job?.title || 'Đang tải tin tuyển dụng...'}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
            <span>Mức lương: <strong className="text-emerald-700">{job?.salary || 'Thỏa thuận'}</strong></span>
            <span>Địa điểm: <strong>{job?.location}</strong></span>
            <span>Đăng ngày: {job?.posted_date ? new Date(job.posted_date).toLocaleDateString('vi-VN') : '---'}</span>
          </div>
        </div>

        <button
          onClick={handleRunAIRanking}
          disabled={rankingLoading || applicants.length === 0}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
        >
          {rankingLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              AI đang chấm điểm & xếp hạng...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              Chạy AI Chấm điểm & Xếp hạng CV
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Tất cả hồ sơ</div>
          <div className="text-2xl font-black mt-1">{counts.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Chờ đánh giá</div>
          <div className="text-2xl font-black mt-1">{counts.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter('interview')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'interview'
              ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Mời phỏng vấn</div>
          <div className="text-2xl font-black mt-1">{counts.interview}</div>
        </button>

        <button
          onClick={() => setStatusFilter('passed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'passed'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Trúng tuyển</div>
          <div className="text-2xl font-black mt-1">{counts.passed}</div>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'rejected'
              ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase opacity-80">Từ chối</div>
          <div className="text-2xl font-black mt-1">{counts.rejected}</div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, kỹ năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500">
          <span>Hiển thị <strong>{filteredApplicants.length}</strong> / {applicants.length} ứng viên</span>
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách ứng viên và CV...</p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy ứng viên phù hợp với bộ lọc' : 'Chưa có ứng viên nào nộp hồ sơ'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Thử xóa từ khóa tìm kiếm hoặc chọn lại trạng thái khác.'
              : 'Tin tuyển dụng đang hoạt động. Ứng viên mới sẽ hiển thị tại đây ngay khi nộp hồ sơ.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((app) => (
            <div
              key={app.id}
              className={`bg-white rounded-3xl border p-6 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                app.ai_rank === 1 ? 'border-amber-300 bg-amber-50/15 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {app.ai_rank && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                      app.ai_rank === 1 ? 'bg-amber-500 text-white shadow-xs' :
                      app.ai_rank <= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Top #{app.ai_rank} AI ({app.ai_match_score}% Match)
                    </span>
                  )}
                  {getStatusBadge(app.status)}
                  <span className="text-[11px] text-slate-400 font-medium ml-auto lg:ml-0">
                    Nộp ngày: {new Date(app.application_date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-start gap-3.5">
                  {app.candidate_avatar ? (
                    <img
                      src={app.candidate_avatar}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => { (e.target as any).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {(app.candidate_name || 'U')[0]}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {app.candidate_name || 'Ứng viên'}
                      </h3>
                      {app.trust_score && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {Number(app.trust_score).toFixed(1)} uy tín
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {app.candidate_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {app.candidate_email}
                        </span>
                      )}
                      {app.candidate_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {app.candidate_phone}
                        </span>
                      )}
                      <span className="text-blue-700 font-semibold">
                        Bản CV: {app.cv_name || 'CV chuẩn'} ({app.career_orientation || 'Chuyên môn'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.skills && app.skills.split(',').map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md">
                      {skill.trim()}
                    </span>
                  ))}
                  {app.education && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-md flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-500" />
                      {app.education}
                    </span>
                  )}
                </div>

                {app.ai_justification && (
                  <p className="text-xs text-blue-900 bg-blue-50/80 p-3 rounded-2xl border border-blue-200/60 leading-relaxed">
                    ✨ <strong>Đánh giá AI:</strong> {app.ai_justification}
                  </p>
                )}

                {app.note && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "Thư ứng tuyển: {app.note}"
                  </p>
                )}
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  onClick={() => handleOpenCVModal(app)}
                  className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem chi tiết CV</span>
                </button>

                {app.attachment_file && (
                  <a
                    href={app.attachment_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    title="Mở tệp đính kèm trong tab mới"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tệp đính kèm</span>
                  </a>
                )}

                <button
                  onClick={() => handleOpenStatusModal(app)}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cvModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-start gap-3.5">
                {selectedApp.candidate_avatar ? (
                  <img
                    src={selectedApp.candidate_avatar}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0 border border-blue-400">
                    {(selectedApp.candidate_name || 'U')[0]}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold">{selectedApp.candidate_name || 'Ứng viên'}</h2>
                    {selectedApp.trust_score && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(selectedApp.trust_score).toFixed(1)} Điểm uy tín
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Ứng tuyển vị trí: <strong className="text-white">{job?.title}</strong> · Bản CV: <span className="text-blue-300 font-semibold">{selectedApp.cv_name || 'CV chuẩn'} ({selectedApp.career_orientation || 'IT'})</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCvModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Email liên hệ</span>
                  <span className="font-semibold text-slate-800">{selectedApp.candidate_email || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Số điện thoại</span>
                  <span className="font-semibold text-slate-800">{selectedApp.candidate_phone || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Trạng thái hồ sơ</span>
                  <div className="mt-0.5">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {selectedApp.attachment_file ? (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-950">Tệp hồ sơ CV gốc của ứng viên</p>
                      <p className="text-[11px] text-blue-700">Định dạng file đính kèm (PDF / Word DOCX)</p>
                    </div>
                  </div>
                  <a
                    href={selectedApp.attachment_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở / Tải tệp CV gốc</span>
                  </a>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Kỹ năng chuyên môn
                </div>
                {selectedApp.skills ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa cập nhật danh sách kỹ năng cụ thể</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Học vấn & Trình độ đào tạo
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {selectedApp.education || 'Chưa cập nhật thông tin học vấn.'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Kinh nghiệm làm việc & Dự án thực tế
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {selectedApp.experience || 'Chưa có thông tin kinh nghiệm chi tiết.'}
                </div>
              </div>

              {selectedApp.cv_content && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Nội dung CV bổ sung
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700">
                    {typeof selectedApp.cv_content === 'string'
                      ? selectedApp.cv_content
                      : JSON.stringify(selectedApp.cv_content, null, 2)}
                  </div>
                </div>
              )}

              {selectedApp.note && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Thư ứng tuyển / Lời nhắn từ ứng viên
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs leading-relaxed text-amber-900 italic">
                    "{selectedApp.note}"
                  </div>
                </div>
              )}

              {selectedApp.ai_justification && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Nhận định & Khuyến nghị từ AI
                  </div>
                  <p className="leading-relaxed">{selectedApp.ai_justification}</p>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Quyết định trạng thái hồ sơ ứng viên
                  </h4>
                  <span className="text-[11px] text-slate-500">Ứng viên sẽ nhận được thông báo ngay lập tức</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('under_review')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      newStatus === 'under_review'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🔍 Đang đánh giá
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('interview_invited')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      newStatus === 'interview_invited'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📅 Mời phỏng vấn
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('interviewed')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      newStatus === 'interviewed'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🗣️ Đã phỏng vấn
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('passed')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                      newStatus === 'passed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Trúng tuyển (Đạt)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewStatus('rejected')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center col-span-2 sm:col-span-1 ${
                      newStatus === 'rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Chưa phù hợp (Từ chối)
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">
                    Ghi chú / Lời nhắn gửi đến ứng viên (Tùy chọn)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Vd: Lịch phỏng vấn kỹ thuật lúc 09:30 ngày 15/09 qua Google Meet, link: https://meet.google.com/..."
                    rows={2}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCvModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedApp.id, newStatus, statusNote)}
                    disabled={updating}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Lưu quyết định trạng thái
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Cập nhật trạng thái: {selectedApp.candidate_name}
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleQuickStatusSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trạng thái quy trình tuyển dụng
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                >
                  <option value="received">Đã tiếp nhận hồ sơ</option>
                  <option value="under_review">Đang đánh giá chuyên môn</option>
                  <option value="interview_invited">Mời phỏng vấn</option>
                  <option value="interviewed">Đã phỏng vấn xong</option>
                  <option value="passed">Trúng tuyển (Đạt)</option>
                  <option value="rejected">Từ chối (Chưa phù hợp)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ghi chú gửi ứng viên (Tùy chọn)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Vd: Lịch phỏng vấn lúc 09:00 ngày 15/09 qua Google Meet..."
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {updating ? 'Đang cập nhật...' : 'Lưu trạng thái'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};