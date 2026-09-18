import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Users, 
  ArrowRight, 
  Building2, 
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import type { JobPosting, User, PlatformStats } from '../../types';
import { jobApi } from '../../api';
import { JobCard } from '../../components/JobCard';

interface HomeViewProps {
  user: User | null;
  onNavigate: (view: string, params?: any) => void;
  onViewJob: (job: JobPosting) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onViewJob,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [featuredJobs, setFeaturedJobs] = useState<JobPosting[]>([]);
  const [smallJobs, setSmallJobs] = useState<JobPosting[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [jobsRes, smallRes, statsRes] = await Promise.allSettled([
        jobApi.getJobs({ limit: 6 }),
        jobApi.getSmallJobs(),
        jobApi.getPlatformStats(),
      ]);

      if (jobsRes.status === 'fulfilled') {
        setFeaturedJobs(jobsRes.value.jobs || []);
      }
      if (smallRes.status === 'fulfilled') {
        setSmallJobs(smallRes.value.slice(0, 4) || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setPlatformStats(statsRes.value);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('jobs', { keyword: searchKeyword, location: searchLocation, type: searchType });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Nền tảng Tuyển dụng thông minh tích hợp Trợ lý AI & Small Job 2026
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Kết nối Sự nghiệp & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Việc làm Ngắn hạn Uy tín
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Hỗ trợ ứng viên tạo nhiều bản CV theo định hướng nghề nghiệp, so khớp độ phù hợp tự động bằng AI và tham gia các ca làm việc linh hoạt với hệ thống điểm uy tín minh bạch.
          </p>

          {/* User Welcome Widget on Main Screen */}
          {user && (
            <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-left shadow-lg">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.email} 
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/40 shadow-md shrink-0"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
              <div className="text-xs">
                <div className="font-bold text-white text-sm">
                  Xin chào, {user.name || user.company_name || user.email.split('@')[0]}!
                </div>
                <div className="text-blue-200 text-[11px] flex items-center gap-2 mt-0.5">
                  <span className="font-medium">{user.role === 'candidate' ? 'Ứng viên' : (user.role === 'employer' ? 'Nhà tuyển dụng' : 'Quản trị viên')}</span>
                  {user.trust_score && (
                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                      ★ {Number(user.trust_score).toFixed(1)} Điểm uy tín
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 text-slate-900"
          >
            <div className="sm:col-span-5 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Vị trí, công nghệ (React, Node.js, Designer...)"
                className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800"
              >
                <option value="">Tất cả địa điểm</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Remote">Làm từ xa (Remote)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Tìm kiếm ngay
              </button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Xu hướng tìm kiếm:</span>
            {['ReactJS', 'Node.js Backend', 'Việc làm theo ca', 'UI/UX Figma', 'Thực tập sinh IT'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setSearchKeyword(tag); onNavigate('jobs', { keyword: tag }); }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-slate-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Việc làm đang tuyển', 
              value: platformStats ? platformStats.active_jobs.toLocaleString('vi-VN') : '1,601', 
              icon: Briefcase, 
              color: 'text-blue-600 bg-blue-50' 
            },
            { 
              label: 'Ca làm Small Job', 
              value: platformStats ? platformStats.active_small_jobs.toLocaleString('vi-VN') : '856', 
              icon: Clock, 
              color: 'text-amber-600 bg-amber-50' 
            },
            { 
              label: 'Doanh nghiệp xác minh', 
              value: platformStats ? platformStats.verified_employers.toLocaleString('vi-VN') : '106', 
              icon: ShieldCheck, 
              color: 'text-emerald-600 bg-emerald-50' 
            },
            { 
              label: 'Thành viên / Số User', 
              value: platformStats ? platformStats.total_users.toLocaleString('vi-VN') : '458', 
              icon: Users, 
              color: 'text-indigo-600 bg-indigo-50' 
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED JOBS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              Cơ hội nghề nghiệp
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Việc làm mới nhất & Hấp dẫn
            </h2>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem tất cả việc làm
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">Hiện chưa có tin tuyển dụng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onViewJob}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. SMALL JOB HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-200 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/50 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Tính năng độc quyền
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Small Job — Việc làm theo ca & ngắn hạn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Đăng ký ca làm linh hoạt theo giờ rảnh, nhận việc nhanh chóng, tích lũy điểm uy tín và nhận thù lao minh bạch sau khi hoàn thành.
              </p>
            </div>
            <button
              onClick={() => onNavigate('small-jobs')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all"
            >
              Khám phá ca làm Small Job
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Small jobs list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {smallJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onViewJob}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE JOBBEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tính năng vượt trội</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Giải pháp tuyển dụng toàn diện</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trợ lý AI & So khớp ATS</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Phân tích độ phù hợp giữa CV và tin tuyển dụng theo thời gian thực, tư vấn lộ trình bổ sung kỹ năng và hỗ trợ NTD xếp hạng ứng viên tự động.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Việc ngắn hạn & Điểm uy tín</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mô hình Small Job đăng ký ca làm linh hoạt kết hợp cơ chế đánh giá 2 chiều (Review & Trust Score), giải quyết bài toán việc làm thời vụ an toàn.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác minh & Phòng chống lừa đảo</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Kiểm duyệt hồ sơ pháp lý doanh nghiệp 100% trước khi đăng tin chính thức, kết hợp hệ thống báo cáo và giải quyết khiếu nại minh bạch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
