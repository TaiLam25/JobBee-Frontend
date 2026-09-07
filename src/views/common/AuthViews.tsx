import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { User, AccountRole } from '../../types';
import { authApi } from '../../api';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'register' | 'forgot-password';
}

export const AuthViews: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onNavigate,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regRole, setRegRole] = useState<'candidate' | 'employer'>('candidate');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authApi.login({ email: loginEmail, password: loginPassword });
      const payload = res.data;
      const account: User = payload.account || payload.user || payload;
      const accessToken = payload.accessToken || payload.access_token;
      const refreshToken = payload.refreshToken || payload.refresh_token;
      
      if (accessToken) {
        localStorage.setItem('jobbee_access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('jobbee_refresh_token', refreshToken);
      }
      localStorage.setItem('jobbee_user', JSON.stringify(account));
      
      onLoginSuccess(account);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authApi.register({
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone_number: regPhone || undefined,
        full_name: regRole === 'candidate' ? regFullName : undefined,
        company_name: regRole === 'employer' ? regCompanyName : undefined,
      });

      const payload = res.data;
      const account: User = payload.account || payload.user || payload;
      const accessToken = payload.accessToken || payload.access_token;
      const refreshToken = payload.refreshToken || payload.refresh_token;

      if (accessToken) {
        localStorage.setItem('jobbee_access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('jobbee_refresh_token', refreshToken);
      }
      localStorage.setItem('jobbee_user', JSON.stringify(account));

      onLoginSuccess(account);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Đăng ký không thành công. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img src="/logo.png" alt="JobBee" className="h-11 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'Đăng nhập JobBee'}
            {mode === 'register' && 'Đăng ký tài khoản mới'}
            {mode === 'forgot-password' && 'Khôi phục mật khẩu'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Hệ thống kết nối tuyển dụng & Small Job thông minh'}
            {mode === 'register' && 'Chọn vai trò Ứng viên hoặc Nhà tuyển dụng'}
            {mode === 'forgot-password' && 'Nhập email để nhận mã liên kết khôi phục'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>

            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRegRole('candidate')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  regRole === 'candidate' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                Ứng viên
              </button>
              <button
                type="button"
                onClick={() => setRegRole('employer')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  regRole === 'employer' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Nhà tuyển dụng
              </button>
            </div>

            {/* Dynamic field based on role */}
            {regRole === 'candidate' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và tên</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên công ty / Doanh nghiệp</label>
                <input
                  type="text"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder="Công ty TNHH Công nghệ ABC"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email đăng nhập</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu (tối thiểu 6 ký tự)</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản ngay'}
            </button>

            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-900">Email khôi phục đã gửi!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Vui lòng kiểm tra hộp thư của bạn ({forgotEmail}) để nhận hướng dẫn thiết lập mật khẩu mới.
                </p>
                <button
                  onClick={() => setMode('login')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Quay lại trang Đăng nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email đăng ký</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                </button>

                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
