import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Star, 
  AlertCircle, 
  X, 
  Send, 
  Undo2,
  MapPin,
  DollarSign
} from 'lucide-react';
import type { SmallJobRegistration } from '../../types';
import { smallJobApi } from '../../api';

export const SmallJobMyRegistrationsView: React.FC = () => {
  const [registrations, setRegistrations] = useState<SmallJobRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<SmallJobRegistration | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReg, setCancelReg] = useState<SmallJobRegistration | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const list = await smallJobApi.getMyRegistrations();
      setRegistrations(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancel = (reg: SmallJobRegistration) => {
    setCancelReg(reg);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReg) return;
    if (cancelReg.status === 'confirmed' && !cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy ca làm / báo vắng gửi đến nhà tuyển dụng.');
      return;
    }

    try {
      setSubmittingCancel(true);
      await smallJobApi.cancelRegistration(
        cancelReg.job_id || cancelReg.job_posting_id || cancelReg.small_job_posting_id,
        cancelReason.trim()
      );
      alert('Đã gửi thông tin hủy ca và lý do báo vắng đến nhà tuyển dụng thành công.');
      setCancelModalOpen(false);
      loadRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy ca làm việc');
    } finally {
      setSubmittingCancel(false);
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
      alert('Đã gửi đánh giá thành công! Điểm uy tín của bên tuyển dụng đã được cập nhật.');
      setReviewModalOpen(false);
      loadRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          Việc làm ngắn hạn & Theo ca
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Ca làm Small Job của tôi
        </h1>
      </div>

      {/* List of Registrations */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách ca làm...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Clock className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Chưa có ca làm Small Job nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy khám phá các ca làm việc ngắn hạn linh hoạt để gia tăng thu nhập và tích lũy điểm uy tín!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 overflow-hidden mt-0.5 shadow-xs">
                    {reg.company_logo ? (
                      <img 
                        src={reg.company_logo} 
                        alt={reg.company_name || 'Logo'} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-amber-700/60" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">{reg.company_name || 'Bên tuyển dụng'}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        reg.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        reg.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        reg.status === 'absent' ? 'bg-red-100 text-red-800' :
                        reg.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {reg.status === 'registered' && 'Chờ duyệt'}
                        {reg.status === 'confirmed' && 'Đã đồng ý cho làm'}
                        {reg.status === 'completed' && 'Hoàn thành ca làm ✓'}
                        {reg.status === 'absent' && 'Vắng mặt'}
                        {reg.status === 'cancelled' && 'Đã hủy'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {reg.job_title || 'Ca làm Small Job'}
                    </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {reg.salary && (
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5" />
                        {reg.salary}
                      </span>
                    )}
                    {reg.working_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Ca: {reg.working_hours}
                      </span>
                    )}
                    {reg.start_time && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Bắt đầu: {new Date(reg.start_time).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    {reg.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reg.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(reg.status === 'registered' || reg.status === 'confirmed') && (
                    <button
                      onClick={() => handleOpenCancel(reg)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                        reg.status === 'confirmed'
                          ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      }`}
                    >
                      {reg.status === 'confirmed' ? 'Báo vắng / Hủy ca' : 'Hủy đăng ký'}
                    </button>
                  )}
                </div>
              </div>

              {/* Display Cancellation Reason if present */}
              {reg.status === 'cancelled' && reg.cancellation_reason && (
                <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-2xl text-xs text-red-900">
                  <span className="font-bold">Lý do đã báo hủy/vắng mặt:</span> "{reg.cancellation_reason}"
                </div>
              )}

              {/* Display Two-Way Reviews for Completed Shifts */}
              {reg.status === 'completed' && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Review given by Candidate to Employer */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700">Đánh giá của bạn gửi NTD:</span>
                        {reg.my_review && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {reg.my_review.score}/5
                          </span>
                        )}
                      </div>
                      {reg.my_review ? (
                        <p className="text-slate-600 italic">"{reg.my_review.comment || 'Không có nhận xét thêm'}"</p>
                      ) : (
                        <p className="text-slate-400">Bạn chưa gửi đánh giá cho nhà tuyển dụng này.</p>
                      )}
                    </div>
                    {!reg.my_review && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenReview(reg)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Gửi đánh giá NTD
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review given by Employer to Candidate */}
                  <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/70 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-blue-900">Đánh giá của NTD gửi cho bạn:</span>
                      {reg.employer_review && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {reg.employer_review.score}/5
                        </span>
                      )}
                    </div>
                    {reg.employer_review ? (
                      <p className="text-slate-700 italic">"{reg.employer_review.comment || 'Không có nhận xét thêm'}"</p>
                    ) : (
                      <p className="text-slate-400">Nhà tuyển dụng chưa gửi đánh giá cho bạn.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalOpen && cancelReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {cancelReg.status === 'confirmed' ? 'Báo vắng / Hủy ca làm việc' : 'Hủy đăng ký ca làm'}
                </h3>
              </div>
              <button onClick={() => setCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {cancelReg.status === 'confirmed' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                <p className="font-bold">⚠️ Lưu ý quan trọng:</p>
                <p>Bạn đã được NTD đồng ý vào ca làm chính thức. Việc hủy ca sẽ gửi thông báo trực tiếp đến NTD để họ kịp thời sắp xếp người thay thế.</p>
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {cancelReg.status === 'confirmed' ? 'Lý do hủy / vắng mặt (Bắt buộc)' : 'Lý do hủy (Tùy chọn)'}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Bị ốm đột xuất, bận việc gia đình gấp..."
                  required={cancelReg.status === 'confirmed'}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 disabled:opacity-50 transition-all"
                >
                  {submittingCancel ? 'Đang gửi thông tin...' : 'Xác nhận hủy ca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Đánh giá Nhà tuyển dụng sau ca làm</h3>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nhận xét chi tiết</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Môi trường làm việc, sự hỗ trợ của bên tuyển dụng, thanh toán thù lao..."
                  rows={3}
                  required
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
