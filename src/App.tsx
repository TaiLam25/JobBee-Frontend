import React, { useState, useEffect } from 'react';
import type { User, JobPosting } from './types';
import { authApi, profileApi, companyApi } from './api';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChatDrawer } from './components/AIChatDrawer';
import { MatchAnalysisModal } from './components/MatchAnalysisModal';
import { NotificationModal } from './components/common/NotificationModal';
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications';

// Views
import { HomeView } from './views/common/HomeView';
import { JobsView } from './views/common/JobsView';
import { JobDetailView } from './views/common/JobDetailView';
import { AuthViews } from './views/common/AuthViews';

// Candidate Views
import { CandidateProfileView } from './views/candidate/CandidateProfileView';
import { CVManagerView } from './views/candidate/CVManagerView';
import { ApplicationsTrackerView } from './views/candidate/ApplicationsTrackerView';
import { SmallJobMyRegistrationsView } from './views/candidate/SmallJobMyRegistrationsView';
import { CareerAdviceView } from './views/candidate/CareerAdviceView';

// Employer Views
import { EmployerDashboard } from './views/employer/EmployerDashboard';
import { PostJobView } from './views/employer/PostJobView';
import { ManageJobsView } from './views/employer/ManageJobsView';
import { JobApplicantsView } from './views/employer/JobApplicantsView';
import { SmallJobRosterView } from './views/employer/SmallJobRosterView';
import { CompanyVerificationView } from './views/employer/CompanyVerificationView';

// Admin Views
import { AdminDashboard } from './views/admin/AdminDashboard';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-rose-400">Đã xảy ra lỗi giao diện</h2>
            <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded text-left overflow-auto max-h-40">
              {this.state.error?.message || 'Lỗi không xác định'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('jobbee_user');
                window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('jobbee_user');
      if (!saved || saved === 'undefined' || saved === '[object Object]') {
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Invalid user in localStorage:', e);
      localStorage.removeItem('jobbee_user');
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>(null);

  // Realtime Notifications with Centered Modal FIFO Queue
  const { currentModalNotification, queueLength, dismissCurrentModal } = useRealtimeNotifications(user);

  // Selected Job for Detail
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // AI Match Modal
  const [matchModalJob, setMatchModalJob] = useState<JobPosting | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Check auth session on boot
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setCurrentView('login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Sync latest user profile & avatar on boot or when user id changes
  useEffect(() => {
    if (!user) return;
    const syncProfile = async () => {
      try {
        if (user.role === 'candidate') {
          const p = await profileApi.getMyProfile();
          if (p) {
            setUser(prev => {
              if (!prev) return null;
              const next = { ...prev, name: p.full_name || prev.name, avatar_url: p.avatar_url || prev.avatar_url, trust_score: p.trust_score };
              localStorage.setItem('jobbee_user', JSON.stringify(next));
              return next;
            });
          }
        } else if (user.role === 'employer') {
          const c = await companyApi.getMyCompany();
          if (c) {
            setUser(prev => {
              if (!prev) return null;
              const next = { ...prev, company_name: c.company_name || prev.company_name, avatar_url: c.avatar_url || c.logo_url || prev.avatar_url, trust_score: c.trust_score, verification_status: c.verification_status };
              localStorage.setItem('jobbee_user', JSON.stringify(next));
              return next;
            });
          }
        }
      } catch (err) {
        console.warn('Sync profile warning:', err);
      }
    };
    syncProfile();
  }, [user?.id]);

  const handleProfileUpdated = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updatedUser };
      localStorage.setItem('jobbee_user', JSON.stringify(next));
      return next;
    });
  };

  const navigate = (view: string, params?: any) => {
    setCurrentView(view);
    setViewParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    if (u?.role === 'admin') navigate('admin-dashboard');
    else if (u?.role === 'employer') navigate('employer-dashboard');
    else navigate('home');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {}
    localStorage.removeItem('jobbee_access_token');
    localStorage.removeItem('jobbee_refresh_token');
    localStorage.removeItem('jobbee_user');
    setUser(null);
    navigate('home');
  };

  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job);
    navigate('job-detail');
  };

  const handleAIMatch = (job: JobPosting) => {
    setMatchModalJob(job);
    setMatchModalOpen(true);
  };

  // Dedicated Standalone Admin Layout (Completely separate from Candidate/Employer UI)
  if (user?.role === 'admin') {
    return (
      <AdminDashboard
        initialTab={
          currentView === 'admin-verifications' ? 'verifications' :
          currentView === 'admin-jobs' ? 'jobs' :
          currentView === 'admin-accounts' ? 'accounts' :
          currentView === 'admin-analytics' ? 'analytics' : 'dashboard'
        }
        currentUser={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* COMMON / PUBLIC VIEWS */}
        {currentView === 'home' && (
          <HomeView
            user={user}
            onNavigate={navigate}
            onViewJob={handleViewJob}
            onAIMatch={handleAIMatch}
          />
        )}

        {currentView === 'jobs' && (
          <JobsView
            initialFilter={viewParams}
            onViewJob={handleViewJob}
            onAIMatch={handleAIMatch}
          />
        )}

        {currentView === 'small-jobs' && (
          <JobsView
            initialFilter={{ type: 'small_job' }}
            onViewJob={handleViewJob}
            onAIMatch={handleAIMatch}
          />
        )}

        {currentView === 'job-detail' && selectedJob && (
          <JobDetailView
            job={selectedJob}
            user={user}
            onBack={() => navigate('jobs')}
            onAIMatch={handleAIMatch}
            onNavigate={navigate}
          />
        )}

        {/* AUTH VIEWS */}
        {currentView === 'login' && (
          <AuthViews
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        )}

        {currentView === 'register' && (
          <AuthViews
            initialMode="register"
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        )}

        {currentView === 'forgot-password' && (
          <AuthViews
            initialMode="forgot-password"
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        )}

        {/* CANDIDATE VIEWS */}
        {user?.role === 'candidate' && (
          <>
            {currentView === 'candidate-profile' && (
              <CandidateProfileView user={user} onProfileUpdated={handleProfileUpdated} />
            )}
            {currentView === 'candidate-cvs' && (
              <CVManagerView />
            )}
            {currentView === 'candidate-applications' && (
              <ApplicationsTrackerView />
            )}
            {currentView === 'candidate-small-jobs' && (
              <SmallJobMyRegistrationsView />
            )}
            {currentView === 'candidate-career-advice' && (
              <CareerAdviceView onViewJob={handleViewJob} />
            )}
          </>
        )}

        {/* EMPLOYER VIEWS */}
        {user?.role === 'employer' && (
          <>
            {currentView === 'employer-dashboard' && (
              <EmployerDashboard user={user} onNavigate={navigate} />
            )}
            {currentView === 'employer-post-job' && (
              <PostJobView user={user} onNavigate={navigate} />
            )}
            {currentView === 'employer-manage-jobs' && (
              <ManageJobsView onNavigate={navigate} />
            )}
            {currentView === 'employer-job-applicants' && viewParams?.jobId && (
              <JobApplicantsView
                jobId={viewParams.jobId}
                onBack={() => navigate('employer-manage-jobs')}
              />
            )}
            {currentView === 'employer-small-job-roster' && viewParams?.jobId && (
              <SmallJobRosterView
                jobId={viewParams.jobId}
                onBack={() => navigate('employer-manage-jobs')}
              />
            )}
            {(currentView === 'employer-verification' || currentView === 'employer-profile') && (
              <CompanyVerificationView onBack={() => navigate('employer-dashboard')} onProfileUpdated={handleProfileUpdated} />
            )}
          </>
        )}
      </main>

      {/* Floating Interactive AI Assistant Drawer */}
      <AIChatDrawer />

      {/* AI Match Analysis Modal Dialog */}
      <MatchAnalysisModal
        job={matchModalJob}
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        onApplyWithCV={(jobId, cvId) => {
          if (selectedJob && selectedJob.id === jobId) {
            navigate('job-detail');
          }
        }}
      />

      {/* Realtime Centered Notification Modal Popup */}
      <NotificationModal
        notification={currentModalNotification}
        queueLength={queueLength}
        onDismiss={() => dismissCurrentModal(true)}
        onNavigate={navigate}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

