import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Lightbulb, 
  Briefcase, 
  Compass, 
  ArrowRight,
  BookOpen,
  Heart,
  Target,
  Zap,
  DollarSign,
  Send,
  RotateCcw
} from 'lucide-react';
import type { JobPosting, AICareerGuidanceResult, RecommendedCareer, RoadmapPhase } from '../../types';
import { aiApi } from '../../api';

interface CareerAdviceViewProps {
  onViewJob: (job: JobPosting) => void;
}

const POPULAR_INTERESTS = [
  'Công nghệ & Phần mềm',
  'Thiết kế & Sáng tạo nghệ thuật',
  'Kinh doanh & Bán hàng',
  'Giao tiếp & Chăm sóc khách hàng',
  'Phân tích số liệu & Tài chính',
  'Viết lách / Sáng tạo nội dung',
  'Ẩm thực & Nhà hàng / Khách sạn',
  'Làm việc tự do (Freelance)'
];

const POPULAR_GOALS = [
  'Thu nhập cao (>20 triệu/tháng)',
  'Làm việc từ xa (Remote / Linh hoạt)',
  'Cân bằng công việc & cuộc sống',
  'Thăng tiến nhanh lên quản lý',
  'Môi trường năng động, trẻ trung',
  'Ổn định lâu dài & đãi ngộ tốt'
];

const POPULAR_STRENGTHS = [
  'Tư duy logic & Giải quyết vấn đề',
  'Ăn nói lưu loát & Thuyết phục',
  'Tỉ mỉ & Cẩn thận với chi tiết',
  'Thẩm mỹ tốt & Trực quan hóa',
  'Tiếng Anh giao tiếp tốt',
  'Lập trình / Am hiểu máy tính',
  'Khả năng tự học & Thích nghi nhanh',
  'Lãnh đạo & Quản lý thời gian'
];

export const CareerAdviceView: React.FC<CareerAdviceViewProps> = ({ onViewJob }) => {
  // Input states
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [strengths, setStrengths] = useState('');

  // Result & status states
  const [adviceResult, setAdviceResult] = useState<AICareerGuidanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Load default advice on first visit
    fetchDefaultAdvice();
  }, []);

  const fetchDefaultAdvice = async () => {
    try {
      setInitialLoading(true);
      const res = await aiApi.getCareerGuidance();
      setAdviceResult(res);
    } catch (err) {
      console.error('Error fetching career guidance:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interests.trim() && !goals.trim() && !strengths.trim()) {
      alert('Vui lòng nhập ít nhất một thông tin về sở thích, định hướng hoặc điểm mạnh của bạn.');
      return;
    }

    try {
      setLoading(true);
      const res = await aiApi.getCareerGuidance({
        interests: interests.trim(),
        goals: goals.trim(),
        strengths: strengths.trim(),
      });
      setAdviceResult(res);
      // Scroll smoothly to results
      setTimeout(() => {
        document.getElementById('ai-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error submitting guidance:', err);
      alert('Có lỗi xảy ra khi phân tích định hướng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (text: string, current: string, setter: (val: string) => void) => {
    const items = current.split(',').map(s => s.trim()).filter(Boolean);
    if (!items.includes(text)) {
      items.push(text);
      setter(items.join(', '));
    }
  };

  const renderRoadmap = (roadmap: RoadmapPhase[] | string | undefined) => {
    if (!roadmap) return null;
    if (Array.isArray(roadmap)) {
      return (
        <div className="space-y-4">
          {roadmap.map((phase, idx) => (
            <div 
              key={idx} 
              className="relative pl-6 pb-4 border-l-2 border-indigo-200 last:border-l-0 last:pb-0"
            >
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-xs" />
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide block">
                  {phase.phase}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {phase.content}
                </p>
                {phase.milestone && (
                  <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Cột mốc: {phase.milestone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
        {roadmap}
      </p>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          Khai vấn Nghề nghiệp & Chọn nghề bằng AI (Ikigai Model)
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">Lộ trình & Gợi ý Chọn Nghề AI</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Nhập sở thích, định hướng và thế mạnh của bạn. Trí tuệ nhân tạo sẽ phân tích điểm giao thoa để chọn ra nghề nghiệp phù hợp nhất và xây dựng lộ trình học tập, phát triển từng bước.
        </p>
      </div>

      {/* Input Form Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thông tin Cá nhân & Định hướng của bạn</h2>
            <p className="text-xs text-slate-500">Cung cấp càng chi tiết, AI sẽ gợi ý nghề nghiệp càng chuẩn xác</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* 1. Sở thích */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Heart className="w-4 h-4 text-rose-500" />
              1. Sở thích / Đam mê của bạn
            </label>
            <textarea
              rows={2}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Bạn thích làm việc trong lĩnh vực nào? Điều gì khiến bạn hào hứng (vd: thích công nghệ mới, thích vẽ, thích gặp gỡ mọi người, thích tự do sáng tạo...)"
              className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý nhanh:</span>
              {POPULAR_INTERESTS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTag(tag, interests, setInterests)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Định hướng */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Target className="w-4 h-4 text-blue-600" />
              2. Định hướng & Mục tiêu sự nghiệp
            </label>
            <textarea
              rows={2}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Mục tiêu tương lai của bạn là gì? (vd: muốn thu nhập cao >15tr, muốn làm việc từ xa, muốn cân bằng thời gian cho gia đình, muốn thăng tiến làm quản lý...)"
              className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý nhanh:</span>
              {POPULAR_GOALS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTag(tag, goals, setGoals)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Cái mình giỏi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-500" />
              3. Cái mình giỏi / Điểm mạnh nổi bật
            </label>
            <textarea
              rows={2}
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Bạn cảm thấy mình làm tốt nhất điều gì? Mọi người hay khen bạn về điểm nào? (vd: giỏi tư duy logic, ăn nói khéo léo, cẩn thận tỉ mỉ, tiếng Anh lưu loát, học nhanh...)"
              className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý nhanh:</span>
              {POPULAR_STRENGTHS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTag(tag, strengths, setStrengths)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {(interests || goals || strengths) && (
              <button
                type="button"
                onClick={() => { setInterests(''); setGoals(''); setStrengths(''); }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm mới ô nhập
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {loading ? 'AI đang phân tích & chọn nghề...' : 'Nhờ AI Chọn Nghề & Lập Lộ Trình'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-base font-bold text-slate-800">Trí tuệ nhân tạo đang phân tích hồ sơ chuyên sâu...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Đang đối soát sở thích, định hướng và thế mạnh của bạn với dữ liệu hàng nghìn cơ hội việc làm để chọn ra nghề nghiệp tối ưu nhất.
          </p>
        </div>
      )}

      {/* Results Section */}
      {!loading && adviceResult && (
        <div id="ai-results-section" className="space-y-8 animate-in fade-in duration-300">
          {/* 1. Summary Analysis */}
          {adviceResult.summary_analysis && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-3xl border border-indigo-100 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Nhận Định Khai Vấn Cá Nhân Hóa (Personalized Career Insight)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {adviceResult.summary_analysis}
              </p>
            </div>
          )}

          {/* 2. Top Recommended Careers */}
          {adviceResult.recommended_careers && adviceResult.recommended_careers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    Top Nghề Nghiệp Phù Hợp Nhất Với Bạn
                  </h3>
                  <p className="text-xs text-slate-500">Được đề xuất dựa trên điểm giao thoa giữa sở thích, thế mạnh và mục tiêu</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {adviceResult.recommended_careers.map((career, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="space-y-3">
                      {/* Badge suitability */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/60">
                          Lựa chọn #{idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200">
                          {career.suitability_score}% Phù hợp
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-slate-900 line-clamp-1">{career.career_name}</h4>

                      {/* Expected salary */}
                      {career.expected_salary && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Thu nhập: {career.expected_salary}</span>
                        </div>
                      )}

                      {/* Why suitable */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block tracking-wider">
                          💡 Vì sao nghề này phù hợp với bạn:
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {career.why_suitable}
                        </p>
                      </div>

                      {/* Key responsibilities */}
                      {career.key_responsibilities && (
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                          {career.key_responsibilities}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Learning Roadmap */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Lộ trình Phát triển & Học tập Cá nhân hóa</h3>
                <p className="text-xs text-slate-500">Các bước hành động từng giai đoạn để đạt được công việc mong muốn</p>
              </div>
            </div>

            {renderRoadmap(adviceResult.learning_roadmap)}

            {/* Essential skills */}
            {adviceResult.recommended_skills && adviceResult.recommended_skills.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Top kỹ năng trọng tâm cần trau dồi:
                </span>
                <div className="flex flex-wrap gap-2">
                  {adviceResult.recommended_skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Priority focus */}
            {adviceResult.priority_focus && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Trọng tâm hành động ngay hôm nay:</strong>
                  <span>{adviceResult.priority_focus}</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Real Matching Jobs on JobBee */}
          {adviceResult.matching_jobs && adviceResult.matching_jobs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Việc làm thực tế đang tuyển phù hợp với định hướng
                  </h3>
                  <p className="text-xs text-slate-500">Các vị trí có sẵn trên sàn ứng với nghề nghiệp AI vừa tư vấn</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adviceResult.matching_jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-400">{job.company_name || 'Doanh nghiệp'}</span>
                        <h4 className="text-base font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">{job.salary} · {job.location}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => onViewJob(job)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        Xem chi tiết & Nộp đơn
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
