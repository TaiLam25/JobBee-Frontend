import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft 
} from 'lucide-react';
import type { Employer, AccountReview } from '../../types';
import { companyApi, reviewApi } from '../../api';

interface CompanyVerificationViewProps {
  onBack: () => void;
  onProfileUpdated?: (updated: any) => void;
}

export const CompanyVerificationView: React.FC<CompanyVerificationViewProps> = ({ onBack, onProfileUpdated }) => {
  const [company, setCompany] = useState<Employer | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [companyImageUrl, setCompanyImageUrl] = useState('');
  const [companyImageFile, setCompanyImageFile] = useState<File | null>(null);
  const [companyImagePreview, setCompanyImagePreview] = useState<string | null>(null);
  const companyImageInputRef = React.useRef<HTMLInputElement>(null);

  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const docFileInputRef = React.useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<AccountReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCompany();
    loadReviews();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getMyCompany();
      setCompany(data);
      setCompanyName(data.company_name || '');
      setAvatarUrl(data.avatar_url || data.logo_url || '');
      setAvatarPreview(data.avatar_url || data.logo_url || null);
      setCompanyImageUrl(data.company_image_url || '');
      setCompanyImagePreview(data.company_image_url || null);
      setAddress(data.address || '');
      setWebsite(data.website || '');
      setDescription(data.description || '');
      setDocUrl(data.verification_document || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const list = await reviewApi.getMyReviews();
      setReviews(list || []);
    } catch (err) {
      console.error('Error loading company reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      await companyApi.updateMyCompany(
        {
          company_name: companyName,
          address,
          website,
          description,
        },
        {
          avatar: avatarFile || undefined,
          company_image: companyImageFile || undefined,
        }
      );
      setAvatarFile(null);
      setCompanyImageFile(null);
      setStatusMsg({ type: 'success', text: 'Cập nhật thông tin và tải ảnh doanh nghiệp thành công!' });
      if (onProfileUpdated) {
        onProfileUpdated({
          company_name: companyName,
          avatar_url: avatarPreview || avatarUrl,
        });
      }
      loadCompany();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi cập nhật thông tin' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile && !docUrl) {
      alert('Vui lòng chọn tệp tài liệu xác minh (PDF hoặc Word .docx) hoặc nhập thông tin xác minh!');
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    try {
      await companyApi.submitVerification(
        docUrl ? { verification_document: docUrl } : undefined,
        docFile || undefined
      );
      setDocFile(null);
      setStatusMsg({ type: 'success', text: 'Đã gửi hồ sơ xác minh thành công! Hệ thống sẽ xét duyệt hồ sơ.' });
      loadCompany();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi khi gửi hồ sơ xác minh' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Dashboard
      </button>

      {/* Header & Verification Status Badge */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Hồ sơ & Xác minh Doanh nghiệp</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Xác minh tư cách pháp nhân để nhận Huy hiệu Đã xác minh và mở khóa tính năng đăng tin Full-time không giới hạn.
          </p>
        </div>

        <div className="shrink-0">
          {company?.verification_status === 'verified' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Doanh nghiệp Đã xác minh ✓</span>
            </div>
          )}
          {company?.verification_status === 'pending' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Hồ sơ đang chờ Admin xét duyệt</span>
            </div>
          )}
          {(!company?.verification_status || company?.verification_status === 'unverified') && (
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
              <span>Chưa nộp hồ sơ xác minh</span>
            </div>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Verification Upload Card */}
      {company?.verification_status !== 'verified' && (
        <form onSubmit={handleSubmitVerification} className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-3xl border border-blue-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              Nộp tài liệu xác minh pháp lý (Giấy phép ĐKKD / Giấy tờ pháp nhân)
            </h3>
            <p className="text-xs text-blue-900 leading-relaxed">
              Tải lên trực tiếp tệp tài liệu xác minh (định dạng <strong>PDF</strong> hoặc <strong>Word .docx</strong>) từ máy tính của bạn hoặc nhập mã số ĐKKD.
            </p>
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tải lên tệp tài liệu từ thiết bị (PDF / Word .docx / Ảnh GPKD)
            </label>
            <div 
              onClick={() => docFileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/80 rounded-2xl p-5 text-center cursor-pointer transition-colors"
            >
              <input
                ref={docFileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
              />
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              {docFile ? (
                <div className="text-xs font-bold text-blue-700">
                  Đã chọn: <span className="underline">{docFile.name}</span> ({(docFile.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-blue-600">Bấm để chọn tệp</span> hoặc kéo thả tệp PDF, DOCX vào đây (tối đa 10MB)
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hoặc Mã số ĐKKD / Ghi chú xác minh (Tùy chọn)</label>
            <input
              type="text"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="Ví dụ: Mã số DN: 0102030405 - Cấp tại Sở KH&ĐT TP.HCM"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || (!docFile && !docUrl)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {submitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xét duyệt'}
          </button>
        </form>
      )}

      {/* Company Info Form */}
      <form onSubmit={handleUpdateInfo} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Thông tin giới thiệu Doanh nghiệp
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên công ty / Doanh nghiệp</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Logo doanh nghiệp từ thiết bị</label>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setAvatarFile(f);
                    setAvatarPreview(URL.createObjectURL(f));
                  }
                }}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Chọn Logo từ máy...
                </button>
                {(avatarPreview || avatarUrl) && (
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Logo preview"
                    className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs"
                    onError={(e) => { (e.target as any).style.display = 'none'; }}
                  />
                )}
                <span className="text-[11px] text-slate-500 truncate">
                  {avatarFile ? avatarFile.name : (avatarUrl ? 'Đang dùng Logo đã lưu' : 'Chưa có logo')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ảnh cơ sở / Banner công ty từ thiết bị</label>
            <input
              ref={companyImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setCompanyImageFile(f);
                  setCompanyImagePreview(URL.createObjectURL(f));
                }
              }}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => companyImageInputRef.current?.click()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Chọn Ảnh cơ sở từ máy...
              </button>
              {(companyImagePreview || companyImageUrl) && (
                <img
                  src={companyImagePreview || companyImageUrl}
                  alt="Company banner preview"
                  className="h-10 w-28 object-cover rounded-xl border border-slate-200 shadow-xs"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              )}
              <span className="text-[11px] text-slate-500 truncate">
                {companyImageFile ? companyImageFile.name : (companyImageUrl ? 'Đang dùng ảnh cơ sở đã lưu' : 'Chưa có ảnh cơ sở')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Hà Nội, Việt Nam"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Website doanh nghiệp</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giới thiệu về doanh nghiệp</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu quy mô, văn hóa công ty, lĩnh vực hoạt động..."
              rows={4}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Đang lưu...' : 'Lưu thông tin công ty'}
          </button>
        </div>
      </form>

      {/* Reviews Received from Candidates */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Đánh giá từ các Ứng viên ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Những đánh giá và nhận xét từ các ứng viên đã tham gia ca làm việc của doanh nghiệp bạn.
            </p>
          </div>
          {company && (
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                ⭐ {Number(company.trust_score || 5).toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>

        {loadingReviews ? (
          <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-600">Doanh nghiệp chưa có đánh giá nào</p>
            <p>Sau khi các ca làm Small Job kết thúc, các ứng viên sẽ gửi đánh giá về môi trường làm việc và thanh toán tại đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    {rev.reviewer_candidate_avatar ? (
                      <img src={rev.reviewer_candidate_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                        {(rev.reviewer_candidate_name || 'U')[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {rev.reviewer_candidate_name || 'Ứng viên'}
                      </h4>
                      {rev.job_title && (
                        <span className="text-[11px] text-slate-500">
                          Ca làm: {rev.job_title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <span>⭐ {rev.score} / 5 sao</span>
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{rev.comment}"
                  </p>
                )}
                <span className="text-[10px] text-slate-400 block">
                  Ngày đánh giá: {new Date(rev.review_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
