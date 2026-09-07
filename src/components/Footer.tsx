import React from 'react';
import { ShieldCheck, Clock, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img 
                src="/logo-white.png" 
                alt="JobBee" 
                className="h-9 w-auto object-contain" 
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng kết nối tuyển dụng việc làm chuyên nghiệp & việc làm ngắn hạn Small Job ứng dụng Trợ lý AI và hệ thống Điểm uy tín 2 chiều minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Hệ thống xác minh & kiểm duyệt tin 100%
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dành cho Ứng viên</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer">Tìm kiếm việc làm Full-time</span></li>
              <li><span className="hover:text-white cursor-pointer">Tìm Small Job (Theo ca / Theo ngày)</span></li>
              <li><span className="hover:text-white cursor-pointer">Tạo & quản lý đa bản CV theo định hướng</span></li>
              <li><span className="hover:text-white cursor-pointer">AI So khớp độ phù hợp hồ sơ</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dành cho Nhà tuyển dụng</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer">Đăng tin tuyển dụng chính thức</span></li>
              <li><span className="hover:text-white cursor-pointer">Đăng tuyển việc ngắn hạn</span></li>
              <li><span className="hover:text-white cursor-pointer">AI Chấm điểm & Xếp hạng CV ứng viên</span></li>
              <li><span className="hover:text-white cursor-pointer">Quy trình xác minh doanh nghiệp</span></li>
              <li><span className="hover:text-white cursor-pointer">Đánh giá & Điểm uy tín doanh nghiệp</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Đồ án chuyên ngành</h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p><strong className="text-slate-300">Đề tài:</strong> Xây dựng hệ thống tuyển dụng việc làm trực tuyến</p>
              <p><strong className="text-slate-300">SV thực hiện:</strong> Lâm Đức Tài (2351010186)</p>
              <p><strong className="text-slate-300">GV hướng dẫn:</strong> TS. Nguyễn Tiến Đạt</p>
              <p><strong className="text-slate-300">Đơn vị:</strong> Khoa Đào tạo Đặc biệt - ĐH Mở TP.HCM</p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 JobBee Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Xây dựng với <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> công nghệ Fullstack & Real AI
          </div>
        </div>
      </div>
    </footer>
  );
};
