import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  DollarSign, 
  Tag, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Plus,
  X
} from 'lucide-react';
import type { User, JobType, Province, Industry } from '../../types';
import { jobApi, companyApi, provinceApi } from '../../api';

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
  const [provinceId, setProvinceId] = useState<number | ''>('');
  const [locationDetail, setLocationDetail] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');

  // 34 Provinces and Industries
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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

    Promise.all([provinceApi.getProvinces(), provinceApi.getIndustries()])
      .then(([pList, iList]) => {
        setProvinces(pList);
        setIndustries(iList);
        if (pList.length > 0) {
          // Default to first city or Ha Noi
          const hanoi = pList.find(p => p.name === 'Hà Nội') || pList[0];
          setProvinceId(hanoi.id);
        }
      })
      .catch(err => console.error('Error fetching metadata:', err));
  }, []);

  const toggleIndustry = (id: number) => {
    setSelectedIndustryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (jobType === 'full_time' && !isVerified) {
      setErrorMsg('Doanh nghiệp chưa được xác minh pháp lý. Theo quy định, chỉ doanh nghiệp đã xác minh mới được đăng tin tuyển dụng chính thức. Bạn có thể đăng tin Small Job hoặc nộp hồ sơ xác minh trước.');
      setLoading(false);
      return;
    }

    if (selectedIndustryIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 ngành nghề / lĩnh vực liên quan đến tin đăng.');
      setLoading(false);
      return;
    }

    try {
      const selectedProv = provinces.find(p => p.id === Number(provinceId));
      const locString = locationDetail 
        ? `${locationDetail}, ${selectedProv?.name || ''}` 
        : (selectedProv?.name || 'Hà Nội');

      const payload: any = {
        title,
        salary,
        province_id: provinceId ? Number(provinceId) : undefined,
        location: locString,
        industry_ids: selectedIndustryIds,
        tags,
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

  const cities = provinces.filter(p => p.type === 'thanh_pho');
  const provinceList = provinces.filter(p => p.type === 'tinh');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Đăng tin Tuyển dụng mới
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Tạo tin tuyển dụng toàn thời gian hoặc tạo ca làm việc ngắn hạn (Small Job) cho ứng viên theo đúng 34 tỉnh/thành phố và ngành nghề đa dạng.
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
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
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
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
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
              placeholder="Vd: Lập trình viên ReactJS Frontend / Nhân viên phục vụ nhà hàng"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Industry Selection (Multi-select) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Ngành nghề & Lĩnh vực (Chọn 1 hoặc nhiều) *</span>
              <span className="text-slate-400 font-normal lowercase">Đã chọn: {selectedIndustryIds.length}</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {industries.map(ind => {
                const isSelected = selectedIndustryIds.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => toggleIndustry(ind.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{ind.name}</span>
                    {isSelected && <X className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Thẻ kỹ năng / Tags bổ sung
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Nhập thẻ tag và nhấn Enter (Vd: React, SpringBoot, Photoshop...)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200/60"
                  >
                    #{t}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-blue-900"
                      onClick={() => handleRemoveTag(t)}
                    />
                  </span>
                ))}
              </div>
            )}
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

            {/* 34 Provinces Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tỉnh / Thành phố (Theo chuẩn 34 tỉnh mới) *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {cities.length > 0 && (
                    <optgroup label="🏢 6 Thành phố trực thuộc Trung ương">
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {provinceList.length > 0 && (
                    <optgroup label="🌲 28 Tỉnh">
                      {provinceList.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Địa chỉ làm việc chi tiết (Số nhà, đường, quận/huyện)
            </label>
            <input
              type="text"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="Vd: Tầng 5, Tòa nhà ABC, Phố Duy Tân, Cầu Giấy"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang đăng tin...' : 'Xác nhận đăng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};
