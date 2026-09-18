import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  Building2, 
  PlusCircle, 
  ListChecks, 
  Menu, 
  X, 
  CheckCircle,
  Sparkles,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import type { User, Notification } from '../types';
import { notificationApi } from '../api';

interface NavbarProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onLogout: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, onNavigate, onLogout, onBack, canGoBack }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appointmentPopup, setAppointmentPopup] = useState<Notification | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      const list = data || [];
      setNotifications(list);

      // Show popup once for unread appointment notification
      const unreadAppointment = list.find(
        (n: Notification) => !n.is_read && n.metadata?.type === 'small_job_appointment'
      );
      if (unreadAppointment) {
        setAppointmentPopup(unreadAppointment);
      }
    } catch (err) {
      // Quiet fail if not logged in or network error
    }
  };

  const handleDismissAppointmentPopup = async () => {
    if (appointmentPopup) {
      try {
        await notificationApi.markAsRead(appointmentPopup.id);
        setNotifications(prev => prev.map(n => n.id === appointmentPopup.id ? { ...n, is_read: true } : n));
      } catch (err) {}
      setAppointmentPopup(null);
    }
  };

  const handleViewMyRegistrations = async () => {
    await handleDismissAppointmentPopup();
    onNavigate('candidate-small-jobs');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {}
    }
    if (notif.link) {
      onNavigate(notif.link);
      setNotifOpen(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Back Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Quay lại trang trước"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
            )}

            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center focus:outline-hidden group py-1"
            >
              <img 
                src="/logo.png" 
                alt="JobBee" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('jobs')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentView === 'jobs' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tìm việc làm
              </button>
              <button
                onClick={() => onNavigate('small-jobs')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentView === 'small-jobs' ? 'text-amber-700 bg-amber-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                Small Job
              </button>

              {/* Role specific links */}
              {user?.role === 'candidate' && (
                <>
                  <button
                    onClick={() => onNavigate('candidate-applications')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'candidate-applications' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Đơn ứng tuyển
                  </button>
                  <button
                    onClick={() => onNavigate('candidate-cvs')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'candidate-cvs' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Quản lý CV
                  </button>
                  <button
                    onClick={() => onNavigate('candidate-small-jobs')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'candidate-small-jobs' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Ca làm
                  </button>
                  <button
                    onClick={() => onNavigate('candidate-cv-analysis')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      currentView === 'candidate-cv-analysis' ? 'text-indigo-700 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Phân tích CV bằng AI
                  </button>
                  <button
                    onClick={() => onNavigate('candidate-career-advice')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      currentView === 'candidate-career-advice' ? 'text-indigo-700 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Lộ trình & Gợi ý nghề
                  </button>
                </>
              )}

              {user?.role === 'employer' && (
                <>
                  <button
                    onClick={() => onNavigate('employer-dashboard')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'employer-dashboard' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Tổng quan
                  </button>
                  <button
                    onClick={() => onNavigate('employer-manage-jobs')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'employer-manage-jobs' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Quản lý tin
                  </button>
                  <button
                    onClick={() => onNavigate('employer-post-job')}
                    className="ml-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Đăng tin mới
                  </button>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => onNavigate('admin-dashboard')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'admin-dashboard' ? 'text-indigo-700 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard Quản trị
                  </button>
                  <button
                    onClick={() => onNavigate('admin-verifications')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'admin-verifications' ? 'text-indigo-700 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Duyệt DN
                  </button>
                  <button
                    onClick={() => onNavigate('admin-jobs')}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'admin-jobs' ? 'text-indigo-700 bg-indigo-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Duyệt Tin
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden"
                    title="Thông báo"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                            Không có thông báo mới
                          </div>
                        ) : (
                          notifications.slice(0, 15).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex gap-3 items-start ${
                                !notif.is_read ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-blue-600' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 leading-snug">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.content}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.created_date).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.email}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {user.name || user.company_name || user.email.split('@')[0]}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 capitalize flex items-center gap-1">
                        {user.role === 'candidate' && 'Ứng viên'}
                        {user.role === 'employer' && (
                          <>
                            NTD {user.verification_status === 'verified' && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                          </>
                        )}
                        {user.role === 'admin' && 'Quản trị viên'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.email}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user.name || user.company_name || 'Người dùng'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      {user.role === 'candidate' && (
                        <>
                          <button
                            onClick={() => { onNavigate('candidate-profile'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            Hồ sơ cá nhân
                          </button>
                          <button
                            onClick={() => { onNavigate('candidate-cvs'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Quản lý đa bản CV
                          </button>
                          <button
                            onClick={() => { onNavigate('candidate-cv-analysis'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2.5 font-medium"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Phân tích CV bằng AI
                          </button>
                          <button
                            onClick={() => { onNavigate('candidate-career-advice'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <Sparkles className="w-4 h-4 text-slate-400" />
                            Lộ trình & Gợi ý nghề
                          </button>
                        </>
                      )}

                      {user.role === 'employer' && (
                        <>
                          <button
                            onClick={() => { onNavigate('employer-profile'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Hồ sơ doanh nghiệp
                          </button>
                          <button
                            onClick={() => { onNavigate('employer-verification'); setUserDropdownOpen(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Xác minh doanh nghiệp
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 transition-all"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => { onNavigate('jobs'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Tìm việc làm
          </button>
          <button
            onClick={() => { onNavigate('small-jobs'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Small Job
          </button>

          {user?.role === 'candidate' && (
            <>
              <button
                onClick={() => { onNavigate('candidate-applications'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Đơn ứng tuyển & Timeline
              </button>
              <button
                onClick={() => { onNavigate('candidate-cvs'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Quản lý đa bản CV
              </button>
              <button
                onClick={() => { onNavigate('candidate-cv-analysis'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Phân tích CV bằng AI
              </button>
              <button
                onClick={() => { onNavigate('candidate-career-advice'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-400" />
                Lộ trình & Gợi ý nghề
              </button>
            </>
          )}

          {user?.role === 'employer' && (
            <>
              <button
                onClick={() => { onNavigate('employer-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard Tuyển dụng
              </button>
              <button
                onClick={() => { onNavigate('employer-post-job'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 font-semibold"
              >
                + Đăng tin tuyển dụng mới
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => { onNavigate('admin-verifications'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Xét duyệt doanh nghiệp
              </button>
              <button
                onClick={() => { onNavigate('admin-jobs'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Kiểm duyệt tin tuyển dụng
              </button>
            </>
          )}
        </div>
      )}

      {/* Small Job Appointment Popup Modal for Candidate */}
      {appointmentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                  Lịch hẹn ca làm việc
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{appointmentPopup.title}</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs text-amber-950">
              <div className="font-semibold text-slate-800 text-sm">
                {appointmentPopup.metadata?.title || 'Ca làm Small Job'}
              </div>
              <div>
                <span className="text-slate-500 font-medium">Doanh nghiệp:</span>{' '}
                <strong className="text-slate-900">{appointmentPopup.metadata?.company_name || 'Nhà tuyển dụng'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Ngày bắt đầu:</span>{' '}
                <strong className="text-slate-900">
                  {appointmentPopup.metadata?.start_time ? new Date(appointmentPopup.metadata.start_time).toLocaleDateString('vi-VN') : 'Theo lịch'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Khung giờ làm việc:</span>{' '}
                <strong className="text-slate-900">{appointmentPopup.metadata?.working_hours || 'Theo ca'}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Địa điểm làm việc:</span>{' '}
                <strong className="text-slate-900">{appointmentPopup.metadata?.location || 'Xem trong chi tiết'}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {appointmentPopup.content}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleDismissAppointmentPopup}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Đã xem
              </button>
              <button
                onClick={handleViewMyRegistrations}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
              >
                Xem ca làm của tôi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
