import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Calendar, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import type { User, JobType } from '../../types';
import { jobApi, companyApi } from '../../api';

interface PostJobViewProps {
  user: User;
  onNavigate: (view: string, params?: any) => void;
}

export const PostJobView: React.FC<PostJobViewProps> = ({
  user,
  onNavigate,
}) => {
  const [jobType, setJobType] = useState<JobType>('full_time');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('Hà Nội');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');

  // Small job fields
  const [workingHours, setWorkingHours] = useState('08:00 - 17:00');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [positionsNeeded, setPositionsNeeded] = useState(2);
  const [startTime, setStartTime] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    companyApi.getMyCompany().then(comp => {
      setIsVerified(comp.verification_status === 'verified');
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (jobType === 'full_time' && !isVerified) {
      setErrorMsg('Doanh nghiệp chưa được xác minh pháp lý. Theo quy định, chỉ doanh nghiệp đã xác minh mới được đăng tin tuyển dụng chính thức. Bạn có thể đăng tin Small Job hoặc nộp hồ sơ xác minh trước.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        title,
        salary,
        location,
        job_description: description,
        requirements,
        benefits,
        job_type: jobType,
      };

      if (jobType === 'small_job') {
        payload.working_hours = workingHours;
        payload.number_of_days = Number(numberOfDays);
        payload.positions_needed = Number(positionsNeeded);
        payload.start_time = startTime;
      }

      await jobApi.createJob(payload);
      setSuccess(true);
      setTimeout(() => onNavigate('employer-manage-jobs'), 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi đăng tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Đăng tin Tuyển dụng mới
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tạo tin tuyển dụng toàn thời gian hoặc tạo ca làm việc ngắn hạn (Small Job) cho ứng viên.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {jobType === 'small_job'
              ? 'Đăng tin việc làm ngắn hạn thành công! Ca làm việc đã được kích hoạt và hiển thị ngay cho các ứng viên.'
              : 'Đăng tin tuyển dụng thành công! Tin đang chờ Quản trị viên kiểm duyệt.'}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span>{errorMsg}</span>
            {!isVerified && jobType === 'full_time' && (
              <button
                type="button"
                onClick={() => onNavigate('employer-verification')}
                className="block text-blue-700 underline font-bold"
              >
                Đến trang nộp hồ sơ xác minh doanh nghiệp →
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Job Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chọn loại hình tin đăng
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setJobType('full_time')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                jobType === 'full_time'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Tuyển dụng chính thức (Full-time)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Yêu cầu doanh nghiệp đã hoàn tất xác minh pháp lý.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setJobType('small_job')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                jobType === 'small_job'
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Small Job (Việc ngắn hạn / Theo ca)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Linh hoạt theo giờ, tích lũy điểm uy tín 2 chiều.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Small job specific inputs */}
        {jobType === 'small_job' && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Thông số ca làm việc Small Job
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Khung giờ làm</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Vd: 08:00 - 12:00"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Số ngày làm</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Số lượng cần tuyển</label>
                <input
                  type="number"
                  min={1}
                  value={positionsNeeded}
                  onChange={(e) => setPositionsNeeded(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Common Job Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tiêu đề tin tuyển dụng
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vd: Lập trình viên ReactJS Frontend / Nhân viên hỗ trợ sự kiện"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mức lương / Thù lao
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Vd: 15 - 25 triệu hoặc 300.000đ/ca"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Địa điểm làm việc
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Remote">Làm từ xa (Remote)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mô tả chi tiết công việc
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trình bày chi tiết nhiệm vụ và trách nhiệm công việc..."
              rows={4}
              required
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Yêu cầu ứng viên (Kỹ năng, kinh nghiệm)
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Yêu cầu về kỹ năng kỹ thuật, bằng cấp, số năm kinh nghiệm..."
              rows={3}
              required
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quyền lợi & Phúc lợi
            </label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Chế độ bảo hiểm, thưởng hiệu quả, đào tạo, thiết bị làm việc..."
              rows={2}
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('employer-dashboard')}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang đăng tin...' : 'Xác nhận đăng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};
