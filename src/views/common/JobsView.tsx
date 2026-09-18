import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles
} from 'lucide-react';
import type { JobPosting } from '../../types';
import { jobApi } from '../../api';
import { JobCard } from '../../components/JobCard';
import { JobFilterBar, FilterState } from '../../components/JobFilterBar';

interface JobsViewProps {
  initialFilter?: { keyword?: string; location?: string; type?: string; industry_id?: number; selectedIndustryIds?: number[] };
  onViewJob: (job: JobPosting) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  initialFilter,
  onViewJob,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    keyword: initialFilter?.keyword || '',
    provinceId: null,
    selectedIndustryIds: initialFilter?.selectedIndustryIds || (initialFilter?.industry_id ? [initialFilter.industry_id] : []),
    salaryMin: null,
    salaryMax: null,
    includeNegotiable: true,
    jobType: initialFilter?.type || 'all',
    sortBy: 'posted_date_desc',
    verifiedOnly: false,
  });

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (initialFilter) {
      setFilters((prev) => ({
        ...prev,
        keyword: initialFilter.keyword !== undefined ? initialFilter.keyword : prev.keyword,
        selectedIndustryIds: initialFilter.selectedIndustryIds !== undefined 
          ? initialFilter.selectedIndustryIds 
          : (initialFilter.industry_id ? [initialFilter.industry_id] : prev.selectedIndustryIds),
        jobType: initialFilter.type !== undefined ? initialFilter.type : prev.jobType,
      }));
      setPage(1);
    }
  }, [initialFilter]);

  useEffect(() => {
    fetchJobs();
  }, [filters, page]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobs({
        page,
        limit: 9,
        search: filters.keyword || undefined,
        province_id: filters.provinceId ? Number(filters.provinceId) : undefined,
        industry_ids: filters.selectedIndustryIds.length > 0 ? filters.selectedIndustryIds : undefined,
        job_type: filters.jobType !== 'all' ? filters.jobType : undefined,
        salary_min: filters.salaryMin !== null ? filters.salaryMin : undefined,
        salary_max: filters.salaryMax !== null ? filters.salaryMax : undefined,
        include_negotiable: filters.includeNegotiable,
        sort: filters.sortBy || undefined,
      });

      let list = res.jobs || [];
      list = list.filter(j => !j.is_closed && j.approval_status !== 'hidden');
      if (filters.verifiedOnly) {
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

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      provinceId: null,
      selectedIndustryIds: [],
      salaryMin: null,
      salaryMax: null,
      includeNegotiable: true,
      jobType: 'all',
      sortBy: 'posted_date_desc',
      verifiedOnly: false,
    });
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
        </div>
      </div>

      {/* Modern Filter Bar */}
      <JobFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        totalCount={totalCount}
      />

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
            Hãy thử nới lỏng khoảng lương, thay đổi tỉnh/thành phố hoặc bỏ chọn bớt ngành nghề để xem thêm kết quả.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
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
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
