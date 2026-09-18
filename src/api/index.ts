import { apiClient } from './client';
import type {
  User,
  CandidateProfile,
  CVVersion,
  Employer,
  JobPosting,
  JobApplication,
  SmallJobRegistration,
  Review,
  Notification,
  AICVAnalysisResult,
  MatchingJobPosting,
  CVAnalysisIndustry,
  AISkillAdviceResult,
  AICareerGuidanceResult,
  SystemStatistics,
  PlatformStats,
  DashboardInsightData,
  SmallJobStats,
  AccountReview,
  PaginationMeta,
  VerificationDocumentInfo,
  Province,
  Industry,
} from '../types';

// ==========================================
// 1. AUTH API
// ==========================================
export const authApi = {
  register: async (data: { 
    email: string; 
    password: string; 
    role: 'candidate' | 'employer'; 
    phone_number?: string; 
    phone?: string; 
    full_name?: string; 
    fullName?: string; 
    company_name?: string; 
    companyName?: string; 
  }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/accounts/me');
    return (res.data?.data || res.data) as User;
  },
  updateProfile: async (data: Partial<User>) => {
    const res = await apiClient.put('/accounts/me', data);
    return res.data?.data || res.data;
  },
  changePassword: async (data: { old_password: string; new_password: string }) => {
    const res = await apiClient.put('/accounts/me/password', data);
    return res.data;
  }
};

// ==========================================
// 2. PROFILE & CV API
// ==========================================
export const profileApi = {
  getMyProfile: async () => {
    const res = await apiClient.get('/profiles/me');
    return (res.data?.data || res.data) as CandidateProfile;
  },
  updateMyProfile: async (data: Partial<CandidateProfile>, avatarFile?: File) => {
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });
      const res = await apiClient.put('/profiles/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return (res.data?.data || res.data) as CandidateProfile;
    }
    const res = await apiClient.put('/profiles/me', data);
    return (res.data?.data || res.data) as CandidateProfile;
  },
  getMyCVs: async () => {
    const res = await apiClient.get('/profiles/me/cvs');
    return (res.data?.data || res.data || []) as CVVersion[];
  },
  getCVById: async (id: number) => {
    const res = await apiClient.get(`/profiles/me/cvs/${id}`);
    return (res.data?.data || res.data) as CVVersion;
  },
  createCV: async (data: Partial<CVVersion>) => {
    const res = await apiClient.post('/profiles/me/cvs', data);
    return (res.data?.data || res.data) as CVVersion;
  },
  updateCV: async (id: number, data: Partial<CVVersion>) => {
    const res = await apiClient.put(`/profiles/me/cvs/${id}`, data);
    return (res.data?.data || res.data) as CVVersion;
  },
  deleteCV: async (id: number) => {
    const res = await apiClient.delete(`/profiles/me/cvs/${id}`);
    return res.data;
  },
  uploadCVFile: async (file: File, data: { cv_name: string; career_orientation: string; is_default?: boolean }) => {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('cv_name', data.cv_name);
    formData.append('career_orientation', data.career_orientation);
    if (data.is_default !== undefined) {
      formData.append('is_default', String(data.is_default));
    }
    const res = await apiClient.post('/profiles/me/cvs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (res.data?.data || res.data) as CVVersion;
  },
  setDefaultCV: async (id: number) => {
    const res = await apiClient.put(`/profiles/me/cvs/${id}/set-default`);
    return (res.data?.data || res.data) as CVVersion;
  },
};

// ==========================================
// 3. JOB & SMALL JOB API
// ==========================================
export const jobApi = {
  getJobs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    job_type?: string;
    location?: string;
    province_id?: number | string;
    province_ids?: (number | string)[];
    industry_id?: number | string;
    industry_ids?: (number | string)[];
    tag?: string;
    tags?: string | string[];
    salary_range?: string;
    salary_min?: number | string;
    salary_max?: number | string;
    include_negotiable?: boolean | string;
    sort?: string;
  }) => {
    const res = await apiClient.get('/jobs', { params });
    const rawData = res.data?.data;
    const rawMeta = res.data?.meta;
    const jobsList = Array.isArray(rawData) ? rawData : (rawData?.jobs || []);
    return {
      jobs: jobsList as JobPosting[],
      total: rawMeta?.total || jobsList.length,
      page: rawMeta?.page || 1,
      totalPages: rawMeta?.totalPages || 1,
    };
  },
  getSalaryRange: async () => {
    const res = await apiClient.get('/jobs/salary-range');
    return (res.data?.data || res.data) as { min: number; max: number };
  },
  getJobById: async (id: number) => {
    const res = await apiClient.get(`/jobs/${id}`);
    return (res.data?.data || res.data) as JobPosting;
  },
  createJob: async (data: any) => {
    const res = await apiClient.post('/jobs', data);
    return (res.data?.data || res.data) as JobPosting;
  },
  updateJob: async (id: number, data: any) => {
    const res = await apiClient.put(`/jobs/${id}`, data);
    return (res.data?.data || res.data) as JobPosting;
  },
  deleteJob: async (id: number) => {
    const res = await apiClient.delete(`/jobs/${id}`);
    return res.data;
  },
  getMyJobs: async () => {
    const res = await apiClient.get('/jobs/mine');
    return (res.data?.data || res.data || []) as JobPosting[];
  },
  getSmallJobs: async (params?: { location?: string; working_hours?: string }) => {
    const res = await apiClient.get('/small-jobs', { params });
    const rawData = res.data?.data;
    return (Array.isArray(rawData) ? rawData : (rawData?.jobs || [])) as JobPosting[];
  },
  getPlatformStats: async () => {
    const res = await apiClient.get('/jobs/platform-stats');
    return (res.data?.data || res.data) as PlatformStats;
  },
};

// ==========================================
// PROVINCE & INDUSTRY API
// ==========================================
export const provinceApi = {
  getProvinces: async (type?: 'tinh' | 'thanh_pho') => {
    const res = await apiClient.get('/provinces', { params: type ? { type } : undefined });
    return (res.data?.data || res.data || []) as Province[];
  },
  getIndustries: async () => {
    const res = await apiClient.get('/industries');
    return (res.data?.data || res.data || []) as Industry[];
  },
};

// ==========================================
// 4. APPLICATION API
// ==========================================
export const applicationApi = {
  applyJob: async (data: { job_posting_id: number; cv_version_id: number; note?: string }) => {
    const res = await apiClient.post('/applications', data);
    return (res.data?.data || res.data) as JobApplication;
  },
  getMyApplications: async () => {
    const res = await apiClient.get('/applications/me');
    return (res.data?.data || res.data || []) as JobApplication[];
  },
  withdrawApplication: async (id: number) => {
    const res = await apiClient.delete(`/applications/${id}`);
    return res.data;
  },
  getApplicationHistory: async (id: number) => {
    const res = await apiClient.get(`/applications/${id}/history`);
    return (res.data?.data || res.data || []) as any[];
  },
  getJobApplicationsForEmployer: async (jobId: number) => {
    const res = await apiClient.get(`/jobs/${jobId}/applications`);
    return (res.data?.data || res.data || []) as JobApplication[];
  },
  updateApplicationStatus: async (applicationId: number, status: string, note?: string) => {
    const res = await apiClient.put(`/applications/${applicationId}/status`, { status, note });
    return (res.data?.data || res.data) as JobApplication;
  },
};

// ==========================================
// 5. SMALL JOB MANAGEMENT API
// ==========================================
export const smallJobApi = {
  registerShift: async (jobId: number) => {
    const res = await apiClient.post(`/small-jobs/${jobId}/register`);
    return (res.data?.data || res.data) as SmallJobRegistration;
  },
  cancelRegistration: async (jobId: number, reason?: string) => {
    const res = await apiClient.post(`/small-jobs/${jobId}/cancel`, { reason });
    return res.data;
  },
  getMyRegistrations: async () => {
    const res = await apiClient.get('/small-jobs/registrations/mine');
    return (res.data?.data || res.data || []) as SmallJobRegistration[];
  },
  getRegistrationsByJob: async (jobId: number) => {
    const res = await apiClient.get(`/small-jobs/${jobId}/registrations`);
    return (res.data?.data || res.data || []) as SmallJobRegistration[];
  },
  updateRegistrationStatus: async (registrationId: number, status: string) => {
    const res = await apiClient.put(`/small-jobs/registrations/${registrationId}/status`, { status });
    return (res.data?.data || res.data) as SmallJobRegistration;
  },
  submitReview: async (registrationId: number, data: { score: number; comment?: string }) => {
    const res = await apiClient.post(`/small-jobs/registrations/${registrationId}/reviews`, data);
    return (res.data?.data || res.data) as Review;
  },
  completeShift: async (jobId: number) => {
    const res = await apiClient.put(`/small-jobs/${jobId}/complete`);
    return res.data?.data || res.data;
  },
  getShiftStats: async (jobId: number) => {
    const res = await apiClient.get(`/small-jobs/${jobId}/stats`);
    return (res.data?.data || res.data) as SmallJobStats;
  },
};

// ==========================================
// 6. AI AGENT & ASSISTANT API
// ==========================================
export const aiApi = {
  chat: async (question: string, support_type = 'chatbot') => {
    const res = await apiClient.post('/ai/chat', { question, support_type });
    return (res.data?.data || res.data) as { answer: string; timestamp: string };
  },
  analyzeCV: async (fileOrCvId: File | number) => {
    let res;
    if (typeof fileOrCvId === 'number') {
      res = await apiClient.post('/ai/cv-analysis', { cv_id: fileOrCvId });
    } else {
      const formData = new FormData();
      formData.append('cv', fileOrCvId);
      res = await apiClient.post('/ai/cv-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return (res.data?.data || res.data) as AICVAnalysisResult;
  },
  getCVAnalysisHistory: async () => {
    const res = await apiClient.get('/ai/cv-analysis/history');
    return (res.data?.data || res.data || []) as AICVAnalysisResult[];
  },
  parseCVFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/ai/parse-cv-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (res.data?.data || res.data) as Partial<CVVersion>;
  },
  getSkillAdvice: async () => {
    const res = await apiClient.get('/ai/skill-advice');
    return (res.data?.data || res.data) as AICareerGuidanceResult;
  },
  getCareerGuidance: async (params?: { interests?: string; goals?: string; strengths?: string }) => {
    const res = await apiClient.post('/ai/career-guidance', params || {});
    return (res.data?.data || res.data) as AICareerGuidanceResult;
  },
  rankApplicants: async (jobId: number) => {
    const res = await apiClient.post(`/jobs/${jobId}/ai-ranking`);
    return (res.data?.data || res.data || []) as JobApplication[];
  },
  getConversationHistory: async () => {
    const res = await apiClient.get('/ai/conversations');
    return (res.data?.data || res.data || []) as any[];
  },
  getDashboardInsight: async (role: 'admin' | 'employer' | 'candidate', refresh: boolean = false) => {
    const res = await apiClient.get(`/ai/dashboard-insight/${role}`, {
      params: refresh ? { refresh: true } : undefined,
    });
    return (res.data?.data || res.data) as DashboardInsightData;
  },
};

// ==========================================
// 7. EMPLOYER & COMPANY API
// ==========================================
export const companyApi = {
  getMyCompany: async () => {
    const res = await apiClient.get('/employers/me');
    return (res.data?.data || res.data) as Employer;
  },
  updateMyCompany: async (data: Partial<Employer>, files?: { avatar?: File; company_image?: File }) => {
    if (files?.avatar || files?.company_image) {
      const formData = new FormData();
      if (files.avatar) formData.append('avatar', files.avatar);
      if (files.company_image) formData.append('company_image', files.company_image);
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });
      const res = await apiClient.put('/employers/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return (res.data?.data || res.data) as Employer;
    }
    const res = await apiClient.put('/employers/me', data);
    return (res.data?.data || res.data) as Employer;
  },
  submitVerification: async (data?: { verification_document?: string }, file?: File) => {
    if (file) {
      const formData = new FormData();
      formData.append('document', file);
      if (data?.verification_document) {
        formData.append('verification_document', data.verification_document);
      }
      const res = await apiClient.post('/employers/me/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return (res.data?.data || res.data) as Employer;
    }
    const res = await apiClient.post('/employers/me/verification', data || {});
    return (res.data?.data || res.data) as Employer;
  },
};

// ==========================================
// 8. ADMIN MANAGEMENT API
// ==========================================
export const adminApi = {
  getStatistics: async () => {
    const res = await apiClient.get('/admin/statistics');
    return (res.data?.data || res.data) as SystemStatistics;
  },
  getPendingCompanies: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/companies/pending', { params });
    const data = (res.data?.data || []) as Employer[];
    const pagination = (res.data?.pagination || res.data?.meta || { total: data.length, page: 1, limit: data.length || 50, totalPages: 1 }) as PaginationMeta;
    return { data, pagination };
  },
  getCompanies: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/companies', { params });
    const data = (res.data?.data || []) as Employer[];
    const pagination = (res.data?.pagination || res.data?.meta || { total: data.length, page: 1, limit: data.length || 50, totalPages: 1 }) as PaginationMeta;
    return { data, pagination };
  },
  getCompanyById: async (employerId: number) => {
    const res = await apiClient.get(`/admin/companies/${employerId}`);
    return (res.data?.data || res.data) as Employer & { jobs?: JobPosting[] };
  },
  getVerificationDocSignedUrl: async (employerId: number) => {
    const res = await apiClient.get(`/admin/companies/${employerId}/verification-document-url`);
    return (res.data?.data || res.data) as VerificationDocumentInfo;
  },
  verifyCompany: async (employerId: number, status: 'verified' | 'rejected') => {
    const res = await apiClient.put(`/admin/companies/${employerId}/verify`, { status });
    return (res.data?.data || res.data) as Employer;
  },
  getPendingJobs: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/jobs/pending', { params });
    const data = (res.data?.data || []) as JobPosting[];
    const pagination = (res.data?.pagination || res.data?.meta || { total: data.length, page: 1, limit: data.length || 50, totalPages: 1 }) as PaginationMeta;
    return { data, pagination };
  },
  moderateJob: async (jobId: number, status: 'approved' | 'rejected') => {
    const res = await apiClient.put(`/admin/jobs/${jobId}/moderate`, { status });
    return (res.data?.data || res.data) as JobPosting;
  },
  getAllAccounts: async (params?: { role?: string; is_locked?: boolean | string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/accounts', { params });
    const data = (res.data?.data || []) as User[];
    const pagination = (res.data?.pagination || res.data?.meta || { total: data.length, page: 1, limit: data.length || 50, totalPages: 1 }) as PaginationMeta;
    return { data, pagination };
  },
  lockAccount: async (accountId: number, is_locked: boolean) => {
    const res = await apiClient.put(`/admin/accounts/${accountId}/lock`, { is_locked });
    return (res.data?.data || res.data) as User;
  },
  getAnalytics: async (range: '7d' | '30d' | '90d' = '30d') => {
    const res = await apiClient.get('/admin/analytics', { params: { range } });
    return (res.data?.data || res.data) as import('../types').AdminAnalyticsData;
  },
};

// ==========================================
// 9. NOTIFICATION API
// ==========================================
export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return (res.data?.data || res.data || []) as Notification[];
  },
  markAsRead: async (id: number) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },
};

// ==========================================
// 10. REVIEW API
// ==========================================
export const reviewApi = {
  getMyReviews: async () => {
    const res = await apiClient.get('/reviews/me');
    return (res.data?.data || res.data || []) as AccountReview[];
  },
  getAccountReviews: async (accountId: number) => {
    const res = await apiClient.get(`/reviews/account/${accountId}`);
    return (res.data?.data || res.data || []) as AccountReview[];
  },
};
