export type AccountRole = 'candidate' | 'employer' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type JobType = 'full_time' | 'small_job';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type SmallJobRegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'absent' | 'completed';
export type JobApplicationStatus = 
  | 'submitted' 
  | 'received' 
  | 'under_review' 
  | 'interview_invited' 
  | 'interviewed' 
  | 'passed' 
  | 'rejected' 
  | 'withdrawn';
export type AISupportType = 'chatbot' | 'term_explanation' | 'fit_analysis' | 'job_suggestion' | 'cv_scoring';

export interface User {
  id: number;
  email: string;
  phone_number?: string;
  role: AccountRole;
  is_locked?: boolean;
  created_date?: string;
  // Augmented from candidate_profile / employer
  name?: string;
  avatar_url?: string;
  company_name?: string;
  verification_status?: VerificationStatus;
  trust_score?: number;
}

export interface CandidateProfile {
  id: number;
  account_id: number;
  full_name: string;
  avatar_url?: string;
  education?: string;
  skills?: string;
  experience?: string;
  trust_score: number;
  email?: string;
  phone_number?: string;
}

export interface CVVersion {
  id: number;
  profile_id: number;
  cv_name: string;
  career_orientation: string;
  cv_content?: {
    summary?: string;
    skills?: string[];
    education?: { school: string; major: string; year: string }[];
    experience?: { company: string; role: string; period: string; desc: string }[];
    projects?: { name: string; link: string; desc: string }[];
    certifications?: string[];
  };
  attachment_file?: string;
  is_default: boolean;
  updated_date?: string;
  applications_count?: number;
}

export interface Employer {
  id: number;
  account_id: number;
  company_name: string;
  logo_url?: string;
  avatar_url?: string;
  company_image_url?: string;
  address?: string;
  website?: string;
  description?: string;
  verification_status: VerificationStatus;
  verification_document?: string;
  trust_score: number;
  decided_at?: string;
  email?: string;
  phone_number?: string;
}

export interface AccountReview {
  id: number;
  small_job_registration_id: number;
  reviewer_id: number;
  reviewee_id: number;
  score: number;
  comment?: string;
  review_date: string;
  job_id?: number;
  job_title?: string;
  reviewer_role?: 'candidate' | 'employer';
  reviewer_candidate_name?: string;
  reviewer_candidate_avatar?: string;
  reviewer_company_name?: string;
  reviewer_company_avatar?: string;
}

export interface Province {
  id: number;
  name: string;
  type: 'tinh' | 'thanh_pho';
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface JobPosting {
  id: number;
  employer_id: number;
  company_name?: string;
  company_logo?: string;
  employer_trust_score?: number;
  verification_status?: VerificationStatus;
  title: string;
  job_description: string;
  requirements: string;
  benefits?: string;
  salary?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  is_negotiable?: boolean;
  location: string;
  province_id?: number;
  province_name?: string;
  province_type?: 'tinh' | 'thanh_pho';
  industries?: Industry[];
  tags?: string[];
  job_type: JobType;
  approval_status: ApprovalStatus;
  posted_date: string;
  decided_at?: string;
  applicants_count?: number;
  views_count?: number;
  // Small job fields if job_type === 'small_job'
  small_job?: SmallJobPosting;
  is_closed?: boolean;
  registered_count?: number;
  confirmed_count?: number;
  completed_count?: number;
  positions_needed?: number;
  working_hours?: string;
  start_time?: string;
  number_of_days?: number;
}

export interface SmallJobPosting {
  id: number;
  job_posting_id: number;
  working_hours: string;
  number_of_days: number;
  positions_needed: number;
  start_time: string;
  registered_count?: number;
  is_closed?: boolean;
}

export interface SmallJobRegistration {
  id: number;
  small_job_posting_id: number;
  job_id?: number;
  job_posting_id?: number;
  account_id: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_trust_score?: number;
  job_title?: string;
  company_name?: string;
  company_logo?: string;
  company_image_url?: string;
  working_hours?: string;
  start_time?: string;
  location?: string;
  salary?: string;
  is_closed?: boolean;
  cancellation_reason?: string;
  status: SmallJobRegistrationStatus;
  registration_date: string;
  has_reviewed?: boolean;
  employer_review?: { id?: number; score: number; comment?: string; review_date?: string } | null;
  candidate_review?: { id?: number; score: number; comment?: string; review_date?: string } | null;
  my_review?: { id?: number; score: number; comment?: string; review_date?: string } | null;
}

export interface JobApplication {
  id: number;
  cv_version_id: number;
  job_posting_id: number;
  status: JobApplicationStatus;
  application_date: string;
  status_updated_date?: string;
  // Joins
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  candidate_avatar?: string;
  candidate_trust_score?: number;
  trust_score?: number;
  cv_name?: string;
  career_orientation?: string;
  cv_content?: any;
  attachment_file?: string;
  job_title?: string;
  company_name?: string;
  company_logo?: string;
  salary?: string;
  location?: string;
  note?: string;
  skills?: string;
  education?: string;
  experience?: string;
  // AI ranking result
  ai_rank?: number;
  ai_match_score?: number;
  ai_justification?: string;
}

export interface Review {
  id: number;
  small_job_registration_id: number;
  reviewer_id: number;
  reviewer_name?: string;
  reviewee_id: number;
  reviewee_name?: string;
  score: number;
  comment?: string;
  is_disputed: boolean;
  review_date: string;
}

export interface Notification {
  id: number;
  account_id: number;
  title: string;
  content: string;
  link?: string;
  metadata?: any;
  is_read: boolean;
  created_date: string;
}

export interface SmallJobStats {
  positions_needed: number;
  is_closed: boolean;
  registered: number;
  confirmed: number;
  completed: number;
  absent: number;
  cancelled: number;
  total_active_registrations: number;
}

export interface MatchingJobPosting extends JobPosting {
  match_score?: number;
  match_reason?: string;
}

export interface CVAnalysisIndustry {
  industry_id: number;
  industry_name: string;
  confidence_score: number;
  reason: string;
}

export interface AICVAnalysisResult {
  id?: number;
  file_name?: string;
  extracted_summary?: string;
  matching_jobs?: MatchingJobPosting[];
  industries?: CVAnalysisIndustry[];
  analyzed_at?: string;
  timestamp?: string;
}

export interface RecommendedCareer {
  career_name: string;
  suitability_score: number;
  why_suitable: string;
  expected_salary: string;
  key_responsibilities: string;
}

export interface RoadmapPhase {
  phase: string;
  content: string;
  milestone: string;
}

export interface AICareerGuidanceResult {
  summary_analysis: string;
  recommended_careers: RecommendedCareer[];
  learning_roadmap: RoadmapPhase[] | string;
  recommended_skills: string[];
  priority_focus: string;
  matching_jobs?: JobPosting[];
}

export interface AISkillAdviceResult {
  recommended_skills: string[];
  learning_roadmap: string;
  priority_focus: string;
}

export interface PlatformStats {
  active_jobs: number;
  active_small_jobs: number;
  verified_employers: number;
  total_users: number;
}

export interface SystemStatistics {
  total_users: number;
  total_candidates: number;
  total_employers: number;
  total_jobs: number;
  total_applications: number;
  total_small_jobs: number;
  pending_verifications: number;
  pending_jobs: number;
}

export interface DashboardInsightData<T = any> {
  role: 'admin' | 'employer' | 'candidate';
  stats: T;
  insight: string;
  is_cached: boolean;
  generated_at: string;
}

export type AdminAnalyticsRange = '7d' | '30d' | '90d';

export interface AccountsGrowthItem {
  date: string;
  candidate: number;
  employer: number;
}

export interface JobPostingsGrowthItem {
  date: string;
  full_time: number;
  small_job: number;
}

export interface ApprovalStatusWeekItem {
  week: string;
  approved: number;
  pending: number;
  rejected: number;
  hidden: number;
}

export interface AccountRoleItem {
  role: string;
  label: string;
  count: number;
}

export interface VerificationBreakdownItem {
  status: string;
  label: string;
  count: number;
}

export interface AvgApprovalTime {
  employer: {
    hours: number;
    prev_hours: number;
    diff_percent: number;
  };
  job: {
    hours: number;
    prev_hours: number;
    diff_percent: number;
  };
}

export interface JobIndustryItem {
  industry_name: string;
  count: number;
}

export interface AdminAnalyticsData {
  range: AdminAnalyticsRange;
  isDemoMode: boolean;
  actionQueue: {
    pendingEmployers: number;
    pendingJobs: number;
  };
  overview: {
    totalAccounts: number;
    accountsByRole: { role: string; count: number }[];
    totalJobs: number;
    jobsByStatus: { approval_status: string; count: number }[];
    totalApplications: number;
    totalSmallJobs?: number;
    activeSmallJobs?: number;
    smallJobRegistrations?: number;
    aiCvAnalyses?: number;
    aiChatbotSessions?: number;
  };
  accountsGrowth: AccountsGrowthItem[];
  jobPostingsGrowth: JobPostingsGrowthItem[];
  approvalStatusByWeek: ApprovalStatusWeekItem[];
  accountsByRole: AccountRoleItem[];
  employerVerificationBreakdown: VerificationBreakdownItem[];
  avgApprovalTime: AvgApprovalTime;
  jobsByIndustry: JobIndustryItem[];
  salaryBreakdown?: {
    negotiable: number;
    under_10m: number;
    from_10m_to_20m: number;
    from_20m_to_30m: number;
    above_30m: number;
  };
  topProvinces?: { name: string; count: number }[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta?: PaginationMeta;
}

export interface VerificationDocumentInfo {
  hasDocument: boolean;
  companyName?: string;
  signedUrl?: string | null;
  fileType?: 'pdf' | 'docx' | 'image' | 'other' | null;
  fileName?: string | null;
  originalUrl?: string | null;
  expiresInSeconds?: number;
  message?: string;
}

