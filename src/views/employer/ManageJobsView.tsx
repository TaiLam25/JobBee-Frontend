import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  Users, 
  Eye, 
  Trash2, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import type { JobPosting } from '../../types';
import { jobApi, smallJobApi } from '../../api';

interface ManageJobsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ManageJobsView: React.FC<ManageJobsViewProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getMyJobs();
      setJobs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ tin tuyển dụng này?')) {
      try {
        await jobApi.deleteJob(id);
        loadJobs();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa tin');
      }
    }
  };

  const handleCompleteSmallJob = async (jobId: number) => {
    if (window.confirm('Xác nhận hoàn thành ca làm việc này? Tin tuyển dụng sẽ được chuyển vào mục Lịch sử và không hiển thị trên trang tìm việc nữa. Toàn bộ ứng viên đã duyệt sẽ hoàn thành ca để bạn đánh giá.')) {
      try {
        setCompletingId(jobId);
        await smallJobApi.completeShift(jobId);
        alert('Đã hoàn thành ca làm việc! Tin đã được chuyển vào phần Lịch sử.');
        await loadJobs();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể hoàn thành ca làm');
      } finally {
        setCompletingId(null);
      }
    }
  };

  const activeJobs = jobs.filter(j => !j.is_closed && j.approval_status !== 'hidden');
  const historyJobs = jobs.filter(j => Boolean(j.is_closed || j.approval_status === 'hidden'));
  const displayJobs = activeTab === 'active' ? activeJobs : historyJobs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Quản lý Tin Tuyển Dụng</h1>
        </div>
        <button
          onClick={() => onNavigate('employer-post-job')}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Đăng tin mới
        </button>
      </div>

      {/* Tabs: Đang hoạt động vs Lịch sử */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Đang hoạt động</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === 'active' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {activeJobs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Lịch sử / Đã hoàn thành</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === 'history' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {historyJobs.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách tin...</p>
        </div>
      ) : displayJobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'active' ? 'Không có tin tuyển dụng nào đang hoạt động' : 'Chưa có tin tuyển dụng nào trong lịch sử'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'Bắt đầu đăng tin tuyển dụng hoặc Small Job mới để tìm kiếm ứng viên.'
              : 'Các ca làm việc sau khi bấm "Hoàn thành ca" sẽ được lưu trữ tại đây.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayJobs.map((job) => {
            const isSmallJob = job.job_type === 'small_job';
            const isClosed = Boolean(job.is_closed || job.approval_status === 'hidden');
            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge: Small Job doesn't require admin approval */}
                    {isSmallJob ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isClosed ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isClosed ? 'Đã hoàn thành & đóng ca' : 'Đang hoạt động'}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        job.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        job.approval_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.approval_status === 'approved' ? 'Đã duyệt công khai' : job.approval_status === 'pending' ? 'Đang chờ admin duyệt' : 'Bị từ chối'}
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSmallJob ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {isSmallJob ? 'Small Job (Ngắn hạn)' : 'Toàn thời gian'}
                    </span>

                    {/* Clickable Applicant Badge */}
                    {isSmallJob ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('employer-small-job-roster', { jobId: job.id })}
                        className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-all cursor-pointer shadow-2xs"
                        title="Bấm để xem danh sách đăng ký ca làm này"
                      >
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>{job.registered_count || (job as any).registeredCount || 0} lượt đăng ký ca</span>
                        <ArrowRight className="w-2.5 h-2.5 text-amber-700" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('employer-job-applicants', { jobId: job.id })}
                        className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/90 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-all cursor-pointer shadow-2xs"
                        title="Bấm để xem danh sách hồ sơ ứng tuyển vị trí này"
                      >
                        <Users className="w-3 h-3 text-blue-700" />
                        <span>{job.applicants_count || (job as any).applicantCount || 0} ứng viên</span>
                        <ArrowRight className="w-2.5 h-2.5 text-blue-700" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Lương: <strong className="text-emerald-700 font-bold">{job.salary}</strong></span>
                    <span>Địa điểm: <strong>{job.location}</strong></span>
                    <span>Đăng ngày: {new Date(job.posted_date).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Small Job Specific Stats */}
                  {isSmallJob && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => onNavigate('employer-small-job-roster', { jobId: job.id })}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Đăng ký: <strong>{job.registered_count || (job as any).registeredCount || 0}</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('employer-small-job-roster', { jobId: job.id })}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Đã duyệt: <strong>{job.confirmed_count || 0}/{job.positions_needed || job.small_job?.positions_needed || 0} người</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('employer-small-job-roster', { jobId: job.id })}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Hoàn thành: <strong>{job.completed_count || 0}</strong>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions & Applicant count */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                  <div
                    onClick={() => {
                      if (isSmallJob) {
                        onNavigate('employer-small-job-roster', { jobId: job.id });
                      } else {
                        onNavigate('employer-job-applicants', { jobId: job.id });
                      }
                    }}
                    className="text-left md:text-right mr-2 cursor-pointer group"
                    title="Bấm để xem danh sách chi tiết"
                  >
                    <div className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-end gap-1">
                      <span>{isSmallJob ? (job.registered_count || (job as any).registeredCount || 0) : (job.applicants_count || (job as any).applicantCount || 0)}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">
                      {isSmallJob ? 'Lượt đăng ký ca' : 'Hồ sơ ứng tuyển'}
                    </span>
                  </div>

                  {isSmallJob ? (
                    <div className="flex items-center gap-2">
                      {!isClosed && (
                        <button
                          onClick={() => handleCompleteSmallJob(job.id)}
                          disabled={completingId === job.id}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                          title="Hoàn thành công việc ca này và chuyển vào phần Lịch sử"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {completingId === job.id ? 'Đang đóng...' : 'Hoàn thành ca'}
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('employer-small-job-roster', { jobId: job.id })}
                        className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <Users className="w-4 h-4" />
                        {isClosed ? 'Xem lại & Đánh giá' : 'Duyệt danh sách ca'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigate('employer-job-applicants', { jobId: job.id })}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Users className="w-4 h-4" />
                      Xem {job.applicants_count || 0} hồ sơ & CV
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Gỡ tin tuyển dụng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
