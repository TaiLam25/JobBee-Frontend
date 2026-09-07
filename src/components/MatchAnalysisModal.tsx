import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw, 
  Send, 
  FileText,
  TrendingUp,
  Upload,
  Layers,
  FileCheck
} from 'lucide-react';
import type { JobPosting, CVVersion, AIMatchAnalysisResult } from '../types';
import { profileApi, aiApi } from '../api';

interface MatchAnalysisModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyWithCV?: (jobId: number, cvId: number) => void;
}

export const MatchAnalysisModal: React.FC<MatchAnalysisModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplyWithCV,
}) => {
  const [activeMode, setActiveMode] = useState<'existing' | 'upload'>('upload');
  const [cvs, setCvs] = useState<CVVersion[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIMatchAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && job) {
      setErrorMsg('');
      setResult(null);
      setUploadedFile(null);
      loadCVs();
    } else {
      setResult(null);
      setErrorMsg('');
    }
  }, [isOpen, job]);

  const loadCVs = async () => {
    try {
      const cvList = await profileApi.getMyCVs().catch(() => []);
      setCvs(cvList || []);
      if (cvList && cvList.length > 0) {
        const defaultCV = cvList.find(c => c.is_default) || cvList[0];
        setSelectedCvId(defaultCV.id);
        setActiveMode('existing');
        analyzeSavedCV(defaultCV.id);
      } else {
        setActiveMode('upload');
      }
    } catch (err) {
      setActiveMode('upload');
    }
  };

  const analyzeSavedCV = async (cvId: number) => {
    if (!job) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await aiApi.analyzeMatch(job.id, cvId);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi khi phân tích CV');
    } finally {
      setLoading(false);
    }
  };

  const handleSavedCVChange = (cvId: number) => {
    setSelectedCvId(cvId);
    analyzeSavedCV(cvId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !job) return;

    // Validate format
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      setErrorMsg('Vui lòng chỉ tải lên tệp định dạng PDF, DOCX, DOC hoặc TXT.');
      return;
    }

    setUploadedFile(file);
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await aiApi.matchCVFile(file, {
        job_id: job.id,
        title: job.title,
        job_description: job.job_description,
        requirements: job.requirements,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể đọc và phân tích tệp CV.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job || job.job_type === 'small_job') return null;

  const scoreColor = !result ? 'text-blue-600' :
    result.match_score >= 80 ? 'text-emerald-600' :
    result.match_score >= 60 ? 'text-blue-600' : 'text-amber-600';

  const scoreBg = !result ? 'bg-blue-50 border-blue-200' :
    result.match_score >= 80 ? 'bg-emerald-50 border-emerald-200' :
    result.match_score >= 60 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Phân tích mức độ phù hợp bằng AI</h3>
              <p className="text-xs text-blue-100 mt-0.5 truncate max-w-md">
                So khớp với vị trí: {job.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveMode('upload')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeMode === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Tải tệp CV trực tiếp (PDF, DOCX)
            </button>
            <button
              onClick={() => {
                setActiveMode('existing');
                if (selectedCvId) analyzeSavedCV(selectedCvId);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeMode === 'existing'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Bản CV đã lưu trên hệ thống ({cvs.length})
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. UPLOAD FILE MODE */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {uploadedFile ? uploadedFile.name : 'Bấm để tải lên hoặc kéo thả tệp CV'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hỗ trợ định dạng PDF, Microsoft Word (DOCX, DOC), TXT (Tối đa 10MB)
                  </p>
                </div>
                {uploadedFile && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã tải lên và đọc nội dung tệp thành công
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. EXISTING CV MODE */}
          {activeMode === 'existing' && (
            <div>
              {cvs.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">Bạn chưa tạo bản CV nào trên hệ thống.</p>
                  <button
                    onClick={() => setActiveMode('upload')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Chuyển sang tải lên tệp CV trực tiếp →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cvs.map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => handleSavedCVChange(cv.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        selectedCvId === cv.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{cv.cv_name}</span>
                      </div>
                      {cv.is_default && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          Mặc định
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Trí tuệ nhân tạo Gemini đang quét nội dung CV và chấm điểm...</p>
              <p className="text-xs text-slate-400">Đang đối chiếu các kỹ năng và kinh nghiệm với JD</p>
            </div>
          )}

          {/* Result content */}
          {!loading && result && (
            <div className="space-y-5 animate-in fade-in-50">
              {/* Score Box */}
              <div className={`p-5 rounded-2xl border ${scoreBg} flex items-center justify-between`}>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Chỉ số tương thích AI (ATS Match Score)
                  </span>
                  <p className="text-xs text-slate-600 max-w-sm">
                    {result.parsed_cv_summary || (
                      result.match_score >= 80 ? 'Hồ sơ của bạn rất tiềm năng cho vị trí này!' :
                      result.match_score >= 60 ? 'Hồ sơ đáp ứng mức cơ bản, hãy bổ sung thêm kỹ năng đề xuất.' :
                      'Cần trau dồi thêm kỹ năng chuyên môn trước khi ứng tuyển.'
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-4xl font-black ${scoreColor}`}>
                    {result.match_score}%
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Độ phù hợp</span>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Điểm mạnh nổi bật phát hiện trong CV
                </h4>
                <div className="space-y-1.5">
                  {result.strengths.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing skills */}
              {result.missing_skills && result.missing_skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Kỹ năng còn thiếu hoặc cần bổ sung
                  </h4>
                  <div className="space-y-1.5">
                    {result.missing_skills.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    Lời khuyên tối ưu CV từ AI
                  </h4>
                  <div className="space-y-1.5">
                    {result.recommendations.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          {onApplyWithCV && selectedCvId && activeMode === 'existing' && (
            <button
              onClick={() => {
                onApplyWithCV(job.id, selectedCvId);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              Ứng tuyển ngay với bản CV này
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
