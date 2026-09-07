import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Lightbulb, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export interface AIInsightCardProps {
  title?: string;
  role: 'admin' | 'employer' | 'candidate';
  insightText?: string | null;
  isCached?: boolean;
  generatedAt?: string | Date | null;
  loading?: boolean;
  onRefresh?: () => void;
  error?: string | null;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  role,
  insightText,
  isCached = false,
  generatedAt,
  loading = false,
  onRefresh,
  error,
}) => {
  const roleTitles = {
    admin: 'Trợ lý AI Phân tích Vận hành Sàn JobBee',
    employer: 'Trợ lý AI Phân tích Hiệu quả Tuyển dụng',
    candidate: 'Trợ lý AI Định hướng Năng lực & Ứng tuyển',
  };

  const displayTitle = title || roleTitles[role];

  // Helper to parse markdown bullet points into sections
  const parseInsight = (text: string) => {
    const highlights: string[] = [];
    const recommendations: string[] = [];
    let currentSection: 'highlights' | 'recommendations' | null = null;

    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes('Điểm đáng chú ý') || trimmed.includes('Điểm nổi bật') || trimmed.includes('Xu hướng')) {
        currentSection = 'highlights';
        continue;
      }
      if (trimmed.includes('Khuyến nghị') || trimmed.includes('Hành động') || trimmed.includes('Đề xuất')) {
        currentSection = 'recommendations';
        continue;
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
        const cleanContent = trimmed.replace(/^[-*•\d.]+\s*/, '').trim();
        // Remove markdown bold tags for clean rendering or keep
        if (currentSection === 'recommendations') {
          recommendations.push(cleanContent);
        } else {
          highlights.push(cleanContent);
        }
      } else if (trimmed && !trimmed.startsWith('#')) {
        if (currentSection === 'recommendations') {
          recommendations.push(trimmed);
        } else {
          highlights.push(trimmed);
        }
      }
    }

    return { highlights, recommendations };
  };

  const parsed = insightText ? parseInsight(insightText) : { highlights: [], recommendations: [] };

  const formatTime = (time?: string | Date | null) => {
    if (!time) return '';
    try {
      const d = new Date(time);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20 space-y-5">
      {/* Decorative background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">{displayTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                AI Insight
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              {generatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatTime(generatedAt)}
                </span>
              )}
              {isCached && (
                <span className="px-1.5 py-0.2 rounded bg-white/5 text-[10px] text-slate-400 border border-white/5">
                  Bộ nhớ đệm (24h)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50 shrink-0"
            title="Làm mới phân tích AI dựa trên số liệu mới nhất"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{loading ? 'Đang phân tích...' : 'Làm mới AI'}</span>
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="relative z-10">
        {loading ? (
          /* Skeleton Loader */
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Trợ lý AI đang tổng hợp số liệu và phân tích chuyên sâu...</span>
            </div>
            <div className="space-y-2.5">
              <div className="h-4 bg-white/10 rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-white/10 rounded-lg w-5/6 animate-pulse" />
              <div className="h-4 bg-white/10 rounded-lg w-4/6 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-red-300">Không thể tải nhận định từ Trợ lý AI</p>
              <p className="text-red-400">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-2 text-xs font-bold underline hover:text-white text-red-300"
                >
                  Thử lại ngay
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Parsed Highlights & Recommendations */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Highlights */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Điểm đáng chú ý từ số liệu</span>
              </div>
              {parsed.highlights.length > 0 ? (
                <ul className="space-y-2.5">
                  {parsed.highlights.map((item, idx) => (
                    <li key={`hl-${idx}`} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>'),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Đang tổng hợp các biến động dữ liệu...</p>
              )}
            </div>

            {/* Section 2: Recommendations */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span>Khuyến nghị hành động cụ thể</span>
              </div>
              {parsed.recommendations.length > 0 ? (
                <ul className="space-y-2.5">
                  {parsed.recommendations.map((item, idx) => (
                    <li key={`rec-${idx}`} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>'),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Tiếp tục theo dõi các chỉ số hoạt động hàng ngày.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
