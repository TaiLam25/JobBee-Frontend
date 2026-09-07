import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Star, 
  XCircle, 
  ArrowLeft, 
  Send, 
  ShieldCheck,
  Award
} from 'lucide-react';
import type { SmallJobRegistration, JobPosting } from '../../types';
import { smallJobApi, jobApi } from '../../api';

interface SmallJobRosterViewProps {
  jobId: number;
  onBack: () => void;
}

export const SmallJobRosterView: React.FC<SmallJobRosterViewProps> = ({
  jobId,
  onBack,
}) => {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [roster, setRoster] = useState<SmallJobRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingShift, setCompletingShift] = useState(false);

  // Review candidate modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<SmallJobRegistration | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadRoster();
  }, [jobId]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const [jobData, regData] = await Promise.all([
        jobApi.getJobById(jobId),
        smallJobApi.getRegistrationsByJob(jobId),
      ]);
      setJob(jobData);
      setRoster(regData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (regId: number, status: string) => {
    try {
      await smallJobApi.updateRegistrationStatus(regId, status);
      loadRoster();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi cập nhật trạng thái ca làm');
    }
  };

  const handleCompleteShift = async () => {
    if (!window.confirm('Xác nhận hoàn thành toàn bộ công việc? Toàn bộ ứng viên đã được đồng ý sẽ chuyển sang trạng thái "Hoàn thành ca" và tin đăng sẽ đóng lại.')) {
      return;
    }

    try {
      setCompletingShift(true);
      await smallJobApi.completeShift(jobId);
      alert('Đã hoàn thành ca làm việc thành công! Bây giờ bạn có thể gửi đánh giá cho từng ứng viên.');
      loadRoster();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi cập nhật hoàn thành ca làm');
    } finally {
      setCompletingShift(false);
    }
  };

  const handleOpenReview = (reg: SmallJobRegistration) => {
    setSelectedReg(reg);
    setScore(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    setSubmittingReview(true);
    try {
      await smallJobApi.submitReview(selectedReg.id, { score, comment });
      alert('Đã gửi đánh giá cho ứng viên thành công! Điểm uy tín của ứng viên đã được cập nhật.');
      setReviewModalOpen(false);
      loadRoster();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Stats calculation
  const totalRegistrations = roster.filter(r => ['registered', 'confirmed', 'completed'].includes(r.status)).length;
  const confirmedCount = roster.filter(r => r.status === 'confirmed').length;
  const completedCount = roster.filter(r => r.status === 'completed').length;
  const positionsNeeded = job?.small_job?.positions_needed || job?.positions_needed || 0;
  const isClosed = job?.is_closed || job?.small_job?.is_closed || false;
  const canCompleteShift = confirmedCount > 0 && !isClosed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Quản lý tin
      </button>

      {/* Header */}
      <div className="bg-amber-500/10 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Quản lý danh sách ca làm việc Small Job
              </span>
              {isClosed && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Ca đã đóng
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{job?.title || 'Ca làm Small Job'}</h1>
            <p className="text-xs text-slate-600">
              Ca: <strong>{job?.small_job?.working_hours || job?.working_hours}</strong> · Ngày bắt đầu: <strong>{job?.small_job?.start_time ? new Date(job.small_job.start_time).toLocaleDateString('vi-VN') : ''}</strong> · Địa điểm: <strong>{job?.location}</strong>
            </p>
          </div>

          {/* Button Hoàn thành công việc ở cấp tin đăng */}
          {canCompleteShift && (
            <button
              onClick={handleCompleteShift}
              disabled={completingShift}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completingShift ? 'Đang cập nhật...' : 'Hoàn thành công việc'}
            </button>
          )}
        </div>

        {/* 4 Thống kê tổng quan ca làm */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200/60">
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/50">
            <span className="text-[11px] font-bold text-slate-500 block">Lượt đăng ký</span>
            <span className="text-xl font-black text-slate-900">{totalRegistrations}</span>
          </div>
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/50">
            <span className="text-[11px] font-bold text-blue-600 block">Đã đồng ý</span>
            <span className="text-xl font-black text-blue-700">{confirmedCount}</span>
          </div>
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/50">
            <span className="text-[11px] font-bold text-emerald-600 block">Đã hoàn thành</span>
            <span className="text-xl font-black text-emerald-700">{completedCount}</span>
          </div>
          <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200/50">
            <span className="text-[11px] font-bold text-amber-700 block">Target cần tuyển</span>
            <span className="text-sm font-black text-amber-900 mt-1 block">
              Đã duyệt {confirmedCount}/{positionsNeeded} người
            </span>
          </div>
        </div>
      </div>

      {/* Roster list */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách đăng ký...</p>
        </div>
      ) : roster.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Chưa có ứng viên nào đăng ký ca làm này</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {roster.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{reg.candidate_name || 'Ứng viên'}</h3>
                  {reg.candidate_trust_score && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {Number(reg.candidate_trust_score).toFixed(1)}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    reg.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    reg.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    reg.status === 'absent' ? 'bg-red-100 text-red-800' :
                    reg.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {reg.status === 'registered' && 'Chờ duyệt'}
                    {reg.status === 'confirmed' && 'Đã đồng ý cho làm'}
                    {reg.status === 'completed' && 'Hoàn thành ca ✓'}
                    {reg.status === 'absent' && 'Vắng mặt'}
                    {reg.status === 'cancelled' && 'Đã hủy ca'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {reg.candidate_email} · SĐT: {reg.candidate_phone || 'Chưa cập nhật'} · Đăng ký: {new Date(reg.registration_date).toLocaleDateString('vi-VN')}
                </p>

                {/* Display Cancellation Reason if present */}
                {reg.status === 'cancelled' && reg.cancellation_reason && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 mt-1">
                    <span className="font-bold">Lý do ứng viên báo vắng / hủy:</span> "{reg.cancellation_reason}"
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {reg.status === 'registered' && (
                  <button
                    onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Đồng ý cho ứng viên làm
                  </button>
                )}

                {reg.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(reg.id, 'completed')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Điểm danh: Hoàn thành ✓
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(reg.id, 'absent')}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors"
                    >
                      Báo vắng mặt
                    </button>
                  </>
                )}
              </div>

              {/* Two-Way Reviews for Completed Candidates */}
              {reg.status === 'completed' && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs w-full">
                  {/* Review from Employer to Candidate */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700">Đánh giá của bạn gửi ứng viên:</span>
                        {reg.employer_review && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {reg.employer_review.score}/5
                          </span>
                        )}
                      </div>
                      {reg.employer_review ? (
                        <p className="text-slate-600 italic">"{reg.employer_review.comment || 'Không có nhận xét thêm'}"</p>
                      ) : (
                        <p className="text-slate-400">Bạn chưa gửi đánh giá cho ứng viên này.</p>
                      )}
                    </div>
                    {!reg.employer_review && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenReview(reg)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Đánh giá ứng viên
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review from Candidate to Employer */}
                  <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/70 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-blue-900">Đánh giá ứng viên gửi bạn:</span>
                      {reg.candidate_review && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {reg.candidate_review.score}/5
                        </span>
                      )}
                    </div>
                    {reg.candidate_review ? (
                      <p className="text-slate-700 italic">"{reg.candidate_review.comment || 'Không có nhận xét thêm'}"</p>
                    ) : (
                      <p className="text-slate-400">Ứng viên chưa gửi đánh giá.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Đánh giá ứng viên: {selectedReg?.candidate_name}
              </h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Chấm điểm sao (1 - 5)</label>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScore(s)}
                      className="p-1 focus:outline-hidden transform hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${s <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nhận xét thái độ & kết quả ca làm</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Đúng giờ, thái độ làm việc nhiệt tình, hoàn thành tốt nhiệm vụ..."
                  rows={3}
                  required
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
