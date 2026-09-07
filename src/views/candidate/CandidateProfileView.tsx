import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Star, 
  Save, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { CandidateProfile, User, AccountReview } from '../../types';
import { profileApi, reviewApi } from '../../api';

interface CandidateProfileViewProps {
  user: User;
  onProfileUpdated?: (updated: User) => void;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  user,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [reviews, setReviews] = useState<AccountReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadProfile();
    loadReviews();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getMyProfile();
      setProfile(data);
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
      setAvatarPreview(data.avatar_url || null);
      setEducation(data.education || '');
      setSkills(data.skills || '');
      setExperience(data.experience || '');
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
      console.error('Error loading reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const updated = await profileApi.updateMyProfile(
        {
          full_name: fullName,
          education,
          skills,
          experience,
        },
        avatarFile || undefined
      );
      setProfile(updated);
      if (updated.avatar_url) {
        setAvatarUrl(updated.avatar_url);
        setAvatarPreview(updated.avatar_url);
      }
      setAvatarFile(null);
      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated({
          ...user,
          name: updated.full_name || fullName,
          avatar_url: updated.avatar_url || avatarPreview || user.avatar_url,
        });
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-semibold">Đang tải hồ sơ cá nhân...</p>
      </div>
    );
  }

  const currentDisplayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative group">
            {currentDisplayAvatar ? (
              <img 
                src={currentDisplayAvatar} 
                alt={fullName} 
                className="w-24 h-24 rounded-3xl object-cover shadow-md border-2 border-white ring-2 ring-blue-500/20"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-blue-500/20">
                {fullName ? fullName[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Tải ảnh đại diện mới từ thiết bị"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900">{fullName || 'Ứng viên'}</h1>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
            {user.phone_number && (
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {user.phone_number}
              </p>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Tải ảnh mới từ máy</span>
              {avatarFile && <span className="text-emerald-600 font-normal">({avatarFile.name})</span>}
            </button>
          </div>
        </div>

        {/* Trust score badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center sm:text-right shrink-0">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            Điểm uy tín tích lũy
          </span>
          <div className="flex items-center justify-center sm:justify-end gap-1 text-amber-600 mt-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-black text-slate-900">
              {profile?.trust_score ? Number(profile.trust_score).toFixed(1) : '5.0'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[10px] text-amber-700 block mt-1">Từ đánh giá hoàn thành ca làm Small Job</span>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hồ sơ cá nhân và ảnh đại diện đã được lưu thành công!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Thông tin hồ sơ ứng viên nền (Master Profile)
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và tên</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ảnh đại diện từ thiết bị</label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Chọn ảnh từ máy...
                </button>
                <span className="text-[11px] text-slate-500 truncate">
                  {avatarFile ? avatarFile.name : (avatarUrl ? 'Đang dùng ảnh đã lưu' : 'Chưa chọn tệp')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Trình độ học vấn</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Ví dụ: Cử nhân Công nghệ thông tin - Đại học Bách Khoa"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kỹ năng chuyên môn</label>
            <div className="relative">
              <Code className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Ví dụ: React, TypeScript, Node.js, Phục vụ, Thu ngân..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kinh nghiệm làm việc</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                placeholder="Tóm tắt ngắn gọn các vị trí, dự án hoặc công việc đã từng trải qua..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}
          </button>
        </div>
      </form>

      {/* Reviews Received Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Đánh giá từ Nhà tuyển dụng ({reviews.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Tích lũy từ các ca làm Small Job đã hoàn thành</span>
        </div>

        {loadingReviews ? (
          <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-600">Chưa có đánh giá nào</p>
            <p>Sau khi hoàn thành các ca làm Small Job, Nhà tuyển dụng sẽ gửi đánh giá và nhận xét về bạn tại đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    {rev.reviewer_company_avatar ? (
                      <img src={rev.reviewer_company_avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                        {(rev.reviewer_company_name || 'N')[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {rev.reviewer_company_name || 'Bên tuyển dụng'}
                      </h4>
                      {rev.job_title && (
                        <span className="text-[11px] text-slate-500">
                          Ca làm: {rev.job_title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.score} / 5 sao</span>
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
