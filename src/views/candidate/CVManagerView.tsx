import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Check, 
  Layers, 
  Save, 
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileType
} from 'lucide-react';
import type { CVVersion } from '../../types';
import { profileApi } from '../../api';

export const CVManagerView: React.FC = () => {
  const [cvs, setCvs] = useState<CVVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCv, setEditingCv] = useState<CVVersion | null>(null);

  // Form State
  const [cvName, setCvName] = useState('');
  const [careerOrientation, setCareerOrientation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      const list = await profileApi.getMyCVs();
      setCvs(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = () => {
    setEditingCv(null);
    setSelectedFile(null);
    setCvName('');
    setCareerOrientation('Công nghệ thông tin');
    setModalOpen(true);
  };

  const handleOpenEdit = (cv: CVVersion) => {
    setEditingCv(cv);
    setSelectedFile(null);
    setCvName(cv.cv_name);
    setCareerOrientation(cv.career_orientation);
    setModalOpen(true);
  };

  const handleSaveCV = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !editingCv) {
      alert('Vui lòng chọn tệp CV định dạng PDF hoặc Word (.docx)!');
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      if (selectedFile) {
        await profileApi.uploadCVFile(selectedFile, {
          cv_name: cvName,
          career_orientation: careerOrientation,
          is_default: editingCv ? editingCv.is_default : cvs.length === 0,
        });
        setStatusMsg({ 
          type: 'success', 
          text: `Đã tải lên tệp CV "${selectedFile.name}" thành công!` 
        });
      } else if (editingCv) {
        await profileApi.updateCV(editingCv.id, {
          cv_name: cvName,
          career_orientation: careerOrientation,
        });
        setStatusMsg({ type: 'success', text: 'Cập nhật thông tin bản CV thành công!' });
      }

      setModalOpen(false);
      loadCVs();
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu tệp CV.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (cvId: number) => {
    try {
      await profileApi.setDefaultCV(cvId);
      loadCVs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (cv: CVVersion) => {
    if (cv.applications_count && cv.applications_count > 0) {
      const msg = `Không thể xóa bản CV "${cv.cv_name}" vì bạn đã dùng nó để nộp ${cv.applications_count} đơn ứng tuyển cho Nhà tuyển dụng.\n\nĐể sử dụng hồ sơ mới, vui lòng tải lên tệp CV mới và nhấn "Đặt làm mặc định".`;
      setStatusMsg({ type: 'error', text: msg });
      alert(msg);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa bản CV "${cv.cv_name}"?`)) {
      try {
        await profileApi.deleteCV(cv.id);
        setStatusMsg({ type: 'success', text: 'Đã xóa bản CV thành công!' });
        loadCVs();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Không thể xóa bản CV';
        setStatusMsg({ type: 'error', text: msg });
        alert(msg);
      }
    }
  };

  const isDocxFile = (url?: string) => {
    if (!url) return false;
    return url.includes('.docx') || url.includes('.doc');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Hồ sơ tuyển dụng chính thống
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Quản lý Tệp CV (PDF / DOCX)</h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleOpenUpload}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            Tải lên tệp CV (PDF / DOCX)
          </button>
        </div>
      </div>

      {/* Status alerts */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* CV List */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Đang tải danh sách CV...</p>
        </div>
      ) : cvs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Bạn chưa tải lên bản CV nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Hệ thống chỉ chấp nhận tệp CV tải lên trực tiếp (PDF hoặc Word .docx). Hãy tải lên tệp CV đầu tiên của bạn để sẵn sàng ứng tuyển!
          </p>
          <button
            onClick={handleOpenUpload}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            + Tải lên tệp CV ngay (PDF/DOCX)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cvs.map((cv) => {
            const isDocx = isDocxFile(cv.attachment_file);
            return (
              <div
                key={cv.id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
                  cv.is_default ? 'border-blue-500/80 ring-2 ring-blue-500/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Badge header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {cv.career_orientation || 'Chung'}
                      </span>
                      {cv.applications_count !== undefined && cv.applications_count > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="CV đã dùng nộp đơn ứng tuyển">
                          Đã nộp: {cv.applications_count} đơn
                        </span>
                      )}
                    </div>
                    {cv.is_default ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        CV Mặc định
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(cv.id)}
                        className="text-[10px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                  </div>

                  {/* File icon and info */}
                  <div className="flex items-start gap-3.5 pt-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isDocx ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isDocx ? <FileType className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      <h3 className="text-sm font-bold text-slate-900 truncate" title={cv.cv_name}>
                        {cv.cv_name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Định dạng: <strong className={isDocx ? 'text-blue-700' : 'text-red-700'}>{isDocx ? 'Word (.docx)' : 'PDF (.pdf)'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Action button to view original file */}
                  {cv.attachment_file ? (
                    <a
                      href={cv.attachment_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-xs"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Xem / Tải tệp CV gốc ({isDocx ? 'DOCX' : 'PDF'})</span>
                    </a>
                  ) : (
                    <p className="text-[11px] text-amber-600 italic">Chưa có tệp đính kèm</p>
                  )}
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {cv.updated_date ? `Cập nhật: ${new Date(cv.updated_date).toLocaleDateString('vi-VN')}` : ''}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cv)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Đổi tên / Thay tệp CV"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cv)}
                      className={`p-2 rounded-xl transition-colors ${
                        cv.applications_count && cv.applications_count > 0
                          ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50 cursor-pointer'
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                      }`}
                      title={
                        cv.applications_count && cv.applications_count > 0
                          ? `CV này đã nộp ${cv.applications_count} đơn ứng tuyển (không thể xóa)`
                          : 'Xóa CV'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-300" />
                {editingCv ? 'Cập nhật tệp CV' : 'Tải lên tệp CV mới (PDF / DOCX)'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCV} className="p-6 space-y-4">
              {/* File input */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2.5">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Chọn tệp CV từ máy tính {!editingCv && !selectedFile && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  required={!editingCv && !selectedFile}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!cvName) setCvName(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {selectedFile ? (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                ) : editingCv?.attachment_file ? (
                  <p className="text-[11px] text-slate-500">
                    File hiện tại:{' '}
                    <a href={editingCv.attachment_file} target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">
                      Xem tệp đang lưu
                    </a>{' '}
                    (Chọn file mới ở trên nếu muốn thay đổi)
                  </p>
                ) : null}
                <p className="text-[10px] text-slate-500">
                  Chấp nhận định dạng: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.doc</strong> (Tối đa 10MB).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên bản CV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  placeholder="Ví dụ: CV Frontend ReactJS, CV Bán hàng..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Định hướng nghề nghiệp / Vị trí <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={careerOrientation}
                  onChange={(e) => setCareerOrientation(e.target.value)}
                  placeholder="Ví dụ: Lập trình viên, Nhân viên kinh doanh, Phục vụ..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Đang tải lên...' : (editingCv ? 'Cập nhật bản CV' : 'Tải lên & Lưu bản CV')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
