import React from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Star, 
  Bookmark, 
  Calendar, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { JobPosting } from '../types';

interface JobCardProps {
  job: JobPosting;
  isSaved?: boolean;
  onToggleSave?: (jobId: number) => void;
  onViewDetails: (job: JobPosting) => void;
  onAIMatch?: (job: JobPosting) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  onAIMatch,
}) => {
  const isSmallJob = job.job_type === 'small_job';

  return (
    <div className={`group bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden ${
      isSmallJob 
        ? 'border-amber-200/80 hover:border-amber-400/80 bg-gradient-to-b from-amber-50/20 to-white' 
        : 'border-slate-200/80 hover:border-blue-400/80'
    }`}>
      {/* Top badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shrink-0 ${
            isSmallJob 
              ? 'bg-amber-100/60 border-amber-200 text-amber-800' 
              : 'bg-blue-50 border-blue-100 text-blue-700'
          }`}>
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700">{job.company_name || 'Doanh nghiệp'}</span>
              {job.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60" title="Doanh nghiệp đã xác minh">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Đã xác minh
                </span>
              )}
              {job.employer_trust_score && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  {Number(job.employer_trust_score).toFixed(1)}
                </span>
              )}
            </div>
            <h3 
              onClick={() => onViewDetails(job)}
              className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 mt-0.5"
            >
              {job.title}
            </h3>
          </div>
        </div>

        {/* Bookmark button */}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-xl transition-colors ${
              isSaved 
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Bỏ lưu tin' : 'Lưu tin yêu thích'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Meta tags (Salary, Location, Province, Type) */}
      <div className="flex flex-wrap gap-2 text-xs mb-2.5">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/50">
          <DollarSign className="w-3.5 h-3.5" />
          {job.salary}
        </span>
        {job.province_name ? (
          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 font-medium px-2.5 py-1 rounded-lg border border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {job.province_name}
          </span>
        ) : job.location ? (
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
        ) : null}
        {isSmallJob ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300/50">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Small Job (Ngắn hạn)
            </span>
            {(job.is_closed || job.small_job?.is_closed) ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Đã đóng ca
              </span>
            ) : ((job.registered_count || job.small_job?.registered_count || 0) >= (job.small_job?.positions_needed || job.positions_needed || 0) && (job.small_job?.positions_needed || job.positions_needed || 0) > 0) ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                Đã đủ số lượng
              </span>
            ) : null}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50 font-medium">
            Toàn thời gian
          </span>
        )}
      </div>

      {/* Industry / Skills Tags */}
      {((job.industries && job.industries.length > 0) || (job.tags && job.tags.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.industries?.map((ind) => (
            <span
              key={ind.id}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-md border border-indigo-100"
            >
              #{ind.name}
            </span>
          ))}
          {job.tags?.map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Small job specific details if applicable */}
      {isSmallJob && (job.small_job || job.positions_needed) && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Ca: {job.small_job?.working_hours || job.working_hours}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{job.small_job?.number_of_days || job.number_of_days} ngày {job.small_job?.start_time || job.start_time ? `(${new Date(job.small_job?.start_time || job.start_time!).toLocaleDateString('vi-VN')})` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Cần tuyển: <strong>{job.small_job?.positions_needed || job.positions_needed} người</strong> · Đã đăng ký: <strong>{job.registered_count || job.small_job?.registered_count || 0}</strong></span>
          </div>
        </div>
      )}

      {/* Description Snippet */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {job.job_description}
      </p>

      {/* Bottom Footer Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-[11px] text-slate-400">
          Đăng ngày {new Date(job.posted_date).toLocaleDateString('vi-VN')}
        </span>

        <div className="flex items-center gap-2">
          {onAIMatch && !isSmallJob && (
            <button
              onClick={() => onAIMatch(job)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium text-xs focus:outline-hidden"
              title="Phân tích mức độ phù hợp với CV của bạn"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              So khớp AI
            </button>
          )}
          <button
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Chi tiết
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
