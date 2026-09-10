import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  ArrowLeft, 
  Users, 
  FileText,
  AlertCircle
} from 'lucide-react';
import type { JobPosting, User, CVVersion } from '../../types';
import { profileApi, applicationApi, smallJobApi } from '../../api';

interface JobDetailViewProps {
  job: JobPosting;
  user: User | null;
  onBack: () => void;
  onAIMatch: (job: JobPosting) => void;
  onNavigate: (view: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  user,
  onBack,
  onAIMatch,
  onNavigate,
}) => {
  const [cvs, setCvs] = useState<CVVersion[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [applyNote, setApplyNote] = useState('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Small job registration state
  const [smallJobRegistered, setSmallJobRegistered] = useState(false);

  const isSmallJob = job.job_type === 'small_job';

  useEffect(() => {
    if (user?.role === 'candidate') {
      loadCandidateData();
    }
  }, [user, job.id]);

  const loadCandidateData = async () => {
    try {
      const [cvList, myApps, mySmallJobs] = await Promise.all([
        profileApi.getMyCVs().catch(() => []),
        applicationApi.getMyApplications().catch(() => []),
        smallJobApi.getMyRegistrations().catch(() => []),
      ]);

      setCvs(cvList || []);
      const def = (cvList || []).find(c => c.is_default) || (cvList || [])[0];
      if (def) setSelectedCvId(def.id);

      // Check if candidate already applied to this full-time job
      const alreadyApplied = (myApps || []).some(
        (a: any) => a.job_posting_id === job.id && a.status !== 'withdrawn'
      );
      if (alreadyApplied) {
        setAppliedSuccess(true);
      }

      // Check if candidate already registered to this small job
      const alreadyReg = (mySmallJobs || []).some(
        (r: any) => (r.job_posting_id === job.id || r.job_id === job.id) && r.status !== 'cancelled'
      );
      if (alreadyReg) {
        setSmallJobRegistered(true);
      }
    } catch (err) {}
  };

  const handleApply = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (user.role !== 'candidate') {
      setErrorMessage('Chỉ tài khoản Ứng viên mới có thể nộp hồ sơ ứng tuyển.');
      return;
    }
    if (!selectedCvId) {
      setErrorMessage('Vui lòng tạo hoặc chọn ít nhất 1 bản CV để ứng tuyển.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await applicationApi.applyJob({
        job_posting_id: job.id,
        cv_version_id: selectedCvId,
        note: applyNote || undefined,
      });
      setAppliedSuccess(true);
      setApplyModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Có thể bạn đã ứng tuyển vị trí này.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSmallJobRegister = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      setSubmitting(true);
      await smallJobApi.registerShift(job.id);
      setSmallJobRegistered(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đăng ký không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách việc làm
      </button>

      {/* Success Banner */}
      {appliedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Nộp hồ sơ ứng tuyển thành công!</p>
              <p className="text-xs text-emerald-700">Bạn có thể theo dõi tiến trình 7 giai đoạn trong trang Đơn ứng tuyển.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('candidate-applications')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Xem đơn ứng tuyển
          </button>
        </div>
      )}

      {smallJobRegistered && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Đã đăng ký ca làm Small Job thành công!</p>
              <p className="text-xs text-amber-700">Vui lòng chờ nhà tuyển dụng xác nhận danh sách chính thức.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('candidate-small-jobs')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Xem ca làm của tôi
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border shrink-0 ${
              isSmallJob ? 'bg-amber-100/70 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-700">{job.company_name || 'Doanh nghiệp'}</span>
                {job.verification_status === 'verified' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã xác minh pháp lý
                  </span>
                )}
                {job.employer_trust_score && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Điểm uy tín: {Number(job.employer_trust_score).toFixed(1)}/5.0
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {job.province_name ? `${job.province_name} (${job.location})` : job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Đăng ngày: {new Date(job.posted_date).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {((job.industries && job.industries.length > 0) || (job.tags && job.tags.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.industries?.map((ind) => (
                    <span
                      key={ind.id}
                      className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                    >
                      #{ind.name}
                    </span>
                  ))}
                  {job.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
            {!isSmallJob && (
              <button
                onClick={() => onAIMatch(job)}
                className="px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-200/60 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                So khớp độ phù hợp AI
              </button>
            )}

            {isSmallJob ? (
              <button
                onClick={handleSmallJobRegister}
                disabled={smallJobRegistered || submitting || ((job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0) || Boolean(job.is_closed || job.small_job?.is_closed)}
                className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  job.is_closed || job.small_job?.is_closed
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : ((job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0) && !smallJobRegistered
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white shadow-md shadow-amber-600/30'
                }`}
              >
                <Clock className="w-4 h-4" />
                {smallJobRegistered 
                  ? 'Đã đăng ký ca làm' 
                  : (job.is_closed || job.small_job?.is_closed)
                  ? 'Ca làm đã đóng'
                  : ((job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0)
                  ? 'Đã đủ số lượng tuyển' 
                  : 'Đăng ký ca làm ngay'}
              </button>
            ) : (
              <button
                onClick={() => setApplyModalOpen(true)}
                disabled={appliedSuccess}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                {appliedSuccess ? 'Đã nộp hồ sơ' : 'Ứng tuyển ngay'}
              </button>
            )}
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Mức lương / Thù lao</span>
            <span className="text-emerald-700 font-bold text-sm sm:text-base flex items-center gap-1 mt-0.5">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Loại hình công việc</span>
            <span className="font-bold text-slate-800 text-sm sm:text-base mt-0.5 block">
              {isSmallJob ? 'Small Job (Ngắn hạn)' : 'Toàn thời gian'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Địa điểm làm việc</span>
            <span className="font-bold text-slate-800 text-sm sm:text-base mt-0.5 block truncate">
              {job.location}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Trạng thái</span>
            <span className={`font-bold text-sm sm:text-base mt-0.5 block ${
              (job.is_closed || job.small_job?.is_closed) ? 'text-slate-500' :
              (isSmallJob && (job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0) ? 'text-amber-700' : 'text-blue-700'
            }`}>
              {(job.is_closed || job.small_job?.is_closed) ? 'Đã đóng ca' :
               (isSmallJob && (job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0) ? 'Đã đủ số lượng' : 'Đang nhận đăng ký'}
            </span>
          </div>
        </div>

        {/* Small job special callout */}
        {isSmallJob && (job.small_job || job.positions_needed) && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-3">
            <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              Thông tin ca làm việc ngắn hạn (Small Job)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-slate-500 font-medium block">Khung giờ làm việc:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{job.small_job?.working_hours || job.working_hours}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-slate-500 font-medium block">Số ngày làm:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{job.small_job?.number_of_days || job.number_of_days} ngày</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-slate-500 font-medium block">Số lượng cần tuyển:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{job.small_job?.positions_needed || job.positions_needed} người</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-slate-500 font-medium block">Lượt đăng ký hiện tại:</span>
                <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                  {job.registered_count || job.small_job?.registered_count || 0} người
                </span>
              </div>
            </div>
            <p className="text-[11px] text-amber-800">
              * Lưu ý: Sau khi hoàn thành công việc, hai bên sẽ thực hiện đánh giá để tích lũy điểm uy tín trên hệ thống.
            </p>
          </div>
        )}
      </div>

      {/* Body description & requirements */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8">
        {/* Job description */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Mô tả công việc
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.job_description}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Yêu cầu ứng viên
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.requirements}
          </div>
        </div>

        {/* Benefits if present */}
        {job.benefits && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Star className="w-4 h-4 text-amber-500" />
              Quyền lợi & Phúc lợi
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.benefits}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Ứng tuyển vị trí: {job.title}
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Choose CV */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chọn bản CV phù hợp nhất
              </label>
              {cvs.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">Bạn chưa tạo bản CV nào!</p>
                  <p className="mt-1">Vui lòng vào mục Quản lý CV để tạo bản CV theo định hướng trước khi nộp.</p>
                  <button
                    onClick={() => onNavigate('candidate-cvs')}
                    className="mt-2 text-blue-600 font-bold hover:underline"
                  >
                    Đến trang Quản lý CV →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cvs.map((cv) => (
                    <label
                      key={cv.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        selectedCvId === cv.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="cv_select"
                          checked={selectedCvId === cv.id}
                          onChange={() => setSelectedCvId(cv.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{cv.cv_name} ({cv.career_orientation})</span>
                      </div>
                      {cv.is_default && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          Mặc định
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Note / Cover Letter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thư giới thiệu ngắn (Tùy chọn)
              </label>
              <textarea
                value={applyNote}
                onChange={(e) => setApplyNote(e.target.value)}
                placeholder="Trình bày ngắn gọn lý do bạn phù hợp với vị trí này..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleApply}
                disabled={submitting || cvs.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Đang gửi hồ sơ...' : 'Xác nhận nộp đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
