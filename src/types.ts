export type UserRole = 'worker' | 'employer' | 'admin';

export type TradeCategory = 
  | 'Electrical'
  | 'Plumbing'
  | 'Welding & Fabrication'
  | 'Carpentry & Framing'
  | 'HVAC & Refrigeration'
  | 'Masonry & Concrete'
  | 'Heavy Equipment & Operations'
  | 'Logistics & Warehousing'
  | 'Automotive & Mechanical'
  | 'Painting & Finishing';

export type AvailabilityShift = 'Morning (6 AM - 2 PM)' | 'Evening (2 PM - 10 PM)' | 'Night (10 PM - 6 AM)' | 'Flexible / Any' | 'Weekend Only';

export type ApplicationStatus = 'applied' | 'screening' | 'shortlisted' | 'interview' | 'hired' | 'rejected';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  phone?: string;
  linkedWorkerId?: string;
  linkedEmployerId?: string;
  companyName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface EmployerProfile {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  city: string;
  state: string;
  gstinOrRegId?: string;
  verified: boolean;
}

export interface VerifiedBadge {
  id: string;
  name: string;
  code: string;
  issuer: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'verified' | 'pending' | 'under_review';
  competencyArea: TradeCategory | 'General Safety' | 'Compliance';
  tierMultiplier: number; // e.g. 1.08 = 8% matching boost
  description?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  trade: TradeCategory;
  title: string;
  experienceYears: number;
  rating: number;
  completedGigs: number;
  hourlyRate: number;
  dailyRate: number;
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    maxTravelDistanceKm: number;
  };
  skills: string[];
  certifications: string[];
  verifiedBadges: VerifiedBadge[];
  verificationTier?: 'Standard' | 'Certified Specialist' | 'Master Craftsman';
  availability: AvailabilityShift;
  isAvailableNow: boolean;
  bio: string;
  verified: boolean;
}

export interface JobVacancy {
  id: string;
  employerId: string;
  companyName: string;
  companyLogo?: string;
  projectName: string;
  title: string;
  trade: TradeCategory;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperienceYears: number;
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    siteAddress: string;
  };
  shift: AvailabilityShift;
  payType: 'hourly' | 'daily' | 'fixed';
  payRate: number;
  duration: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  status: 'open' | 'in_progress' | 'filled' | 'closed';
  openings: number;
  filledCount: number;
  postedDate: string;
  deadlineDate: string;
}

export interface CompatibilityScore {
  totalScore: number; // 0 to 100%
  baseScore?: number;
  breakdown: {
    skillMatchScore: number;       // weight ~ 35%
    experienceScore: number;       // weight ~ 20%
    geographicalScore: number;     // weight ~ 20%
    availabilityScore: number;     // weight ~ 15%
    compensationScore: number;     // weight ~ 10%
  };
  verifiedBadgeMultiplier?: number; // e.g. 1.10 = +10% boost
  verifiedBadgesCount?: number;
  matchedSkills: string[];
  missingSkills: string[];
  distanceKm: number;
  recommendationTier: 'High Match' | 'Good Match' | 'Moderate Match' | 'Low Match';
}

export interface SkillMatchAnalysis {
  requiredTotal: number;
  requiredMatched: string[];
  requiredMissing: string[];
  preferredTotal: number;
  preferredMatched: string[];
  preferredMissing: string[];
  requiredCoveragePct: number;
  preferredBonusPct: number;
  overallSkillFitPct: number;
  hasTradeMatch: boolean;
  hasDirectTradeBadge: boolean;
  hasSafetyBadge: boolean;
  upskillSuggestions: string[];
}

export interface WorkerCompetitionBenchmark {
  tradeRank: number;
  totalPeersInTrade: number;
  overallRank: number;
  totalWorkers: number;
  percentile: number;
  competitionScore: number; // 0 - 100 composite competitive index
  avgTradeSkills: number;
  avgTradeExperience: number;
  avgTradeDailyRate: number;
  avgTradeBadges: number;
  avgTradeRating: number;
  highDemandMissingSkills: string[];
  competitiveStrengths: string[];
  peerStandings: {
    workerId: string;
    name: string;
    title: string;
    city: string;
    skillsCount: number;
    badgesCount: number;
    experienceYears: number;
    rating: number;
    completedGigs: number;
    dailyRate: number;
    competitionScore: number;
    isCurrent: boolean;
  }[];
}

export interface JobRecommendationItem {
  job: JobVacancy;
  score: CompatibilityScore;
  skillAnalysis: SkillMatchAnalysis;
  fitCategory: 'Top Recommended' | 'Strong Skill Fit' | 'Upskill Opportunity' | 'Explore';
  reasons: string[];
  isApplied: boolean;
  isBookmarked: boolean;
  application?: JobApplication;
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  jobTitle: string;
  companyName: string;
  workerName: string;
  workerTrade: TradeCategory;
  appliedDate: string;
  status: ApplicationStatus;
  compatibilityScore: CompatibilityScore;
  coverNote?: string;
  hiredDate?: string;
  assignedTaskId?: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  trade: TradeCategory;
  status: TaskStatus;
  priority: TaskPriority;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerAvatar?: string;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  checklists: TaskChecklistItem[];
  location: string;
  safetyRequirement?: string;
  lastUpdated: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'job_match' | 'application_update' | 'task_assignment' | 'milestone' | 'alert';
  timestamp: string;
  read: boolean;
  linkTab?: 'worker' | 'employer' | 'matching' | 'tasks' | 'analytics' | 'architecture' | 'auth';
}

export interface MatchingWeights {
  skillsWeight: number;       // e.g. 0.35
  experienceWeight: number;   // e.g. 0.20
  geographicalWeight: number; // e.g. 0.20
  availabilityWeight: number; // e.g. 0.15
  compensationWeight: number; // e.g. 0.10
}
