import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  Clock, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type { JobPosting } from '../../types';
import { jobApi } from '../../api';
import { JobCard } from '../../components/JobCard';

interface JobsViewProps {
  initialFilter?: { keyword?: string; location?: string; type?: string };
  onViewJob: (job: JobPosting) => void;
  onAIMatch: (job: JobPosting) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  initialFilter,
  onViewJob,
  onAIMatch,
}) => {
  const [keyword, setKeyword] = useState(initialFilter?.keyword || '');
  const [location, setLocation] = useState(initialFilter?.location || '');
  const [jobType, setJobType] = useState(initialFilter?.type || 'all');
  const [salaryRange, setSalaryRange] = useState('');
  const [sortBy, setSortBy] = useState('posted_date_desc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const QUICK_TAGS = [
    'Công nghệ thông tin',
    'Bán hàng / Thu ngân',
    'Nhà hàng / Phục vụ',
    'Marketing',
    'Thiết kế',
    'Giao hàng / Kho',
    'Kế toán',
  ];

  useEffect(() => {
    fetchJobs();
  }, [keyword, location, jobType, salaryRange, sortBy, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobs({
        page,
        limit: 9,
        search: keyword || undefined,
        location: location || undefined,
        job_type: jobType !== 'all' ? jobType : undefined,
        salary_range: salaryRange || undefined,
        sort: sortBy || undefined,
      });

      let list = res.jobs || [];
      list = list.filter(j => !j.is_closed && j.approval_status !== 'hidden');
      if (verifiedOnly) {
        list = list.filter(j => j.verification_status === 'verified');
      }

      setJobs(list);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || list.length);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setJobType('all');
    setSalaryRange('');
    setSortBy('posted_date_desc');
    setVerifiedOnly(false);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Khám phá cơ hội nghề nghiệp phù hợp với bạn
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">
            Tìm kiếm Việc làm & Ca làm linh hoạt
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Hơn hàng trăm tin tuyển dụng chất lượng cao đã qua kiểm duyệt phòng chống lừa đảo, cùng hàng chục ca làm Small Job theo giờ mỗi ngày.
          </p>
        </div>
      </div>

      {/* Comprehensive Rich Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        {/* Row 1: Search, Location, Salary, Sort, Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-4 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="Tên công việc, công ty, kỹ năng..."
              className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Location */}
          <div className="lg:col-span-3 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 font-medium cursor-pointer"
            >
              <option value="">📍 Tất cả địa điểm</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Bình Dương">Bình Dương</option>
              <option value="Đồng Nai">Đồng Nai</option>
              <option value="Toàn quốc">Toàn quốc</option>
              <option value="Remote">Làm từ xa (Remote)</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="lg:col-span-2 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={salaryRange}
              onChange={(e) => { setSalaryRange(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 font-medium cursor-pointer"
            >
              <option value="">💵 Mọi mức lương</option>
              <option value="under_10">Dưới 10 triệu / ca</option>
              <option value="10_20">10 - 20 triệu</option>
              <option value="20_30">20 - 30 triệu</option>
              <option value="above_30">Trên 30 triệu</option>
              <option value="negotiable">Thỏa thuận</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2 flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-800 font-medium cursor-pointer"
            >
              <option value="posted_date_desc">Mới nhất</option>
              <option value="trust_score_desc">Uy tín cao nhất</option>
              <option value="posted_date_asc">Cũ nhất</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-1">
            <button
              onClick={handleReset}
              title="Đặt lại tất cả bộ lọc"
              className="w-full h-full min-h-[42px] px-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="lg:hidden">Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Row 2: Quick Industry Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="font-bold text-slate-400 shrink-0 text-[11px] uppercase tracking-wider">Ngành nghề nhanh:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setKeyword(keyword === tag ? '' : tag);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all text-xs ${
                keyword === tag
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Row 3: Job Type Tabs & Verified Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 mr-1">Hình thức:</span>
            {[
              { key: 'all', label: 'Tất cả công việc' },
              { key: 'full_time', label: 'Chính thức (Full-time)' },
              { key: 'small_job', label: 'Small Job (Theo ca / Ngắn hạn)' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setJobType(tab.key); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs ${
                  jobType === tab.key
                    ? tab.key === 'small_job'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700 hover:text-emerald-700 transition-colors">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Chỉ hiển thị Doanh nghiệp đã xác minh
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <p>
          Tìm thấy <strong className="text-slate-900 font-bold">{totalCount}</strong> việc làm phù hợp
        </p>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy công việc phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bớt các tiêu chí lọc để xem thêm kết quả.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Xem toàn bộ việc làm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={onViewJob}
              onAIMatch={onAIMatch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
