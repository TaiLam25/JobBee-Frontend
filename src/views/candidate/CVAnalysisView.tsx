import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  History,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  BarChart3,
  Award,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Layers,
  CheckCircle2
} from 'lucide-react';
import type { AICVAnalysisResult, MatchingJobPosting, JobPosting, CVVersion } from '../../types';
import { aiApi, profileApi } from '../../api';

interface CVAnalysisViewProps {
  onNavigate?: (view: string, params?: any) => void;
  onViewJob?: (job: JobPosting) => void;
  onBack?: () => void;
}

export const CVAnalysisView: React.FC<CVAnalysisViewProps> = ({ onNavigate, onViewJob, onBack }) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [sourceMode, setSourceMode] = useState<'existing' | 'upload'>('existing');
  
  // Existing CVs state
  const [myCVs, setMyCVs] = useState<CVVersion[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AICVAnalysisResult | null>(null);
  
  // History state
  const [history, setHistory] = useState<AICVAnalysisResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadExistingCVs();
    loadHistory();
  }, []);

  const loadExistingCVs = async () => {
    try {
      setLoadingCVs(true);
      const list = await profileApi.getMyCVs();
      const cvList = list || [];
      setMyCVs(cvList);
      if (cvList.length > 0) {
        const defaultCv = cvList.find(c => c.is_default) || cvList[0];
        setSelectedCvId(defaultCv.id);
        setSourceMode('existing');
      } else {
        setSourceMode('upload');
      }
    } catch (err) {
      console.warn('Failed to load candidate CVs:', err);
      setSourceMode('upload');
    } finally {
      setLoadingCVs(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await aiApi.getCVAnalysisHistory();
      setHistory(Array.isArray(res) ? res : (res as any)?.history || []);
    } catch (err: any) {
      console.error('Failed to load CV analysis history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      setErrorMsg('Vui lòng chọn file định dạng PDF hoặc DOCX.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Dung lượng file tối đa là 5MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (sourceMode === 'upload' && !selectedFile) {
      setErrorMsg('Vui lòng chọn hoặc tải lên tệp CV của bạn.');
      return;
    }
    if (sourceMode === 'existing' && !selectedCvId) {
      setErrorMsg('Vui lòng chọn một bản CV trong tài khoản của bạn.');
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      
      const param = sourceMode === 'upload' ? selectedFile! : selectedCvId!;
      const res = await aiApi.analyzeCV(param);
      setCurrentResult(res);
      loadHistory();
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra trong quá trình phân tích CV bằng AI. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleJobClick = (job: MatchingJobPosting) => {
    if (onViewJob) {
      onViewJob(job);
    } else if (onNavigate) {
      onNavigate('job-detail');
    }
  };

  const handleSelectHistoryItem = (item: AICVAnalysisResult) => {
    setCurrentResult(item);
    setActiveTab('analyze');
  };

  const getScoreBadge = (score: number = 75) => {
    if (score >= 85) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        text: 'Rất phù hợp'
      };
    }
    if (score >= 70) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        bar: 'bg-blue-500',
        text: 'Phù hợp tốt'
      };
    }
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      bar: 'bg-amber-500',
      text: 'Tiềm năng'
    };
  };

  const isAnalyzeReady = (sourceMode === 'upload' && selectedFile) || (sourceMode === 'existing' && selectedCvId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation & Back Button */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Quay lại</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            Trí tuệ nhân tạo JobBee AI
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Phân tích CV & Tìm việc làm phù hợp
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 self-start md:self-center relative z-10">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analyze'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Phân tích mới
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử ({history.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'analyze' ? (
        <div className="space-y-6">
          {/* Source Selection & Upload Section */}
          {!currentResult && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
              {/* Source Mode Toggle (Existing CV vs Upload New) */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setSourceMode('existing')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sourceMode === 'existing'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Dùng CV có sẵn trong tài khoản ({myCVs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Tải lên tệp CV mới (PDF / DOCX)</span>
                </button>
              </div>

              {/* Mode A: Select Existing CV */}
              {sourceMode === 'existing' && (
                <div className="space-y-4">
                  {loadingCVs ? (
                    <div className="py-8 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 mx-auto text-blue-600 animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">Đang tải danh sách CV của bạn...</p>
                    </div>
                  ) : myCVs.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                      <FileText className="w-10 h-10 mx-auto text-slate-300" />
                      <h4 className="text-sm font-bold text-slate-700">Chưa có bản CV nào trong tài khoản</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Bạn có thể chuyển sang tab "Tải lên tệp CV mới" để tải file trực tiếp hoặc tạo CV mới trong phần Quản lý CV.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSourceMode('upload')}
                        className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Tải lên tệp CV mới ngay
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {myCVs.map((cv) => {
                        const isSelected = selectedCvId === cv.id;
                        return (
                          <div
                            key={cv.id}
                            onClick={() => setSelectedCvId(cv.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {cv.cv_name}
                                  </h4>
                                  {cv.is_default && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  {cv.career_orientation || 'Chưa phân loại định hướng'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {cv.updated_date ? new Date(cv.updated_date).toLocaleDateString('vi-VN') : '---'}
                                </p>
                              </div>
                            </div>

                            <div className="flex-shrink-0 mt-1">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Upload New File */}
              {sourceMode === 'upload' && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                      : selectedFile
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{selectedFile.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng phân tích
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 hover:underline mt-1">
                        Nhấn để chọn file khác
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Kéo thả file CV vào đây hoặc <span className="text-blue-600 underline">duyệt từ thiết bị</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Hỗ trợ định dạng PDF, DOCX (Dung lượng tối đa 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>AI tự động đối chiếu các tin tuyển dụng đang hoạt động</span>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!isAnalyzeReady || analyzing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>JobBee AI đang tìm việc phù hợp...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Bắt đầu phân tích CV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Result View */}
          {currentResult && (
            <div className="space-y-6">
              {/* Header card of Result */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-base">{currentResult.file_name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Đã phân tích
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {currentResult.analyzed_at ? new Date(currentResult.analyzed_at).toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentResult(null);
                      setSelectedFile(null);
                      setErrorMsg(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Phân tích CV khác
                  </button>
                </div>

                {/* Profile Extracted Summary */}
                {currentResult.extracted_summary && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      Tóm tắt hồ sơ năng lực
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentResult.extracted_summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Matching Job Postings List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    Danh sách Tin Tuyển Dụng phù hợp nhất ({currentResult.matching_jobs?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-500">Sắp xếp theo độ tương thích giảm dần</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentResult.matching_jobs && currentResult.matching_jobs.length > 0 ? (
                    currentResult.matching_jobs.map((job, idx) => {
                      const score = job.match_score || 75;
                      const badge = getScoreBadge(score);
                      return (
                        <div
                          key={job.id || idx}
                          className="bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 space-y-4 relative overflow-hidden group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* Company Logo / Rank */}
                              <div className="relative">
                                {job.company_logo ? (
                                  <img
                                    src={job.company_logo}
                                    alt={job.company_name}
                                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Building2 className="w-7 h-7" />
                                  </div>
                                )}
                                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black text-[11px] flex items-center justify-center shadow-md">
                                  #{idx + 1}
                                </div>
                              </div>

                              {/* Job Details */}
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 
                                    onClick={() => handleJobClick(job)}
                                    className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                                  >
                                    {job.title}
                                  </h4>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                                    {badge.text} • {score}%
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {job.company_name}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {job.location || 'Toàn quốc'}
                                  </span>
                                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {job.salary || 'Thỏa thuận'}
                                  </span>
                                  {job.job_type === 'small_job' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                      Small Job
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                      Toàn thời gian
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action CTA Button */}
                            <button
                              onClick={() => handleJobClick(job)}
                              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-stretch sm:self-center shrink-0 group/btn"
                            >
                              <span>Xem chi tiết việc làm</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${badge.bar}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>

                          {/* Match Reason explanation from AI */}
                          {job.match_reason && (
                            <div className="text-xs text-slate-700 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                              <span className="font-bold text-blue-700">Đánh giá độ phù hợp từ AI: </span>
                              {job.match_reason}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                      Không tìm thấy tin tuyển dụng nào phù hợp trực tiếp với CV. Vui lòng thử chọn bản CV chi tiết hơn hoặc tải lên tệp mới.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Lịch sử các lần phân tích CV ({history.length})
            </h3>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Sparkles className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">Chưa có lịch sử phân tích CV</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Chọn CV của bạn ở tab "Phân tích mới" để nhận gợi ý các tin việc làm phù hợp nhất.
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Phân tích CV ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectHistoryItem(item)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {item.file_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.analyzed_at ? new Date(item.analyzed_at).toLocaleString('vi-VN') : 'Gần đây'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.matching_jobs && item.matching_jobs.length > 0 ? (
                        <>
                          {item.matching_jobs.slice(0, 2).map((mj, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {mj.title} ({mj.match_score || 75}%)
                            </span>
                          ))}
                          {item.matching_jobs.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{item.matching_jobs.length - 2} tin khác
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Đã phân tích
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto">
                      Xem việc làm phù hợp <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
