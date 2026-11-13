import React, { useState } from 'react';
import { 
  WorkerProfile, 
  JobVacancy, 
  JobApplication, 
  CompatibilityScore, 
  TradeCategory, 
  AvailabilityShift,
  MatchingWeights,
  VerifiedBadge
} from '../types';
import {
  computeCompatibilityScore,
  computeWorkerCompetitionProfile,
  generateJobRecommendations,
} from '../services/matchingEngine';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Search, 
  ArrowRight, 
  Briefcase, 
  SlidersHorizontal,
  ShieldCheck,
  Building,
  Check,
  Plus,
  FileCheck,
  Calendar,
  ExternalLink,
  Shield,
  UploadCloud,
  Trophy,
  Bookmark,
  TrendingUp
} from 'lucide-react';

interface WorkerPortalProps {
  worker: WorkerProfile;
  allWorkers: WorkerProfile[];
  onUpdateWorker: (updated: WorkerProfile) => void;
  jobs: JobVacancy[];
  applications: JobApplication[];
  onApplyJob: (job: JobVacancy, note: string) => void;
  onNavigateToTasks: (workerId?: string) => void;
  weights: MatchingWeights;
  initialTab?: 'matches' | 'competition' | 'all-jobs' | 'applications';
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({
  worker,
  allWorkers,
  onUpdateWorker,
  jobs,
  applications,
  onApplyJob,
  onNavigateToTasks,
  weights,
  initialTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [minPay, setMinPay] = useState<number>(0);
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'matches' | 'competition' | 'all-jobs' | 'applications'>(
    initialTab || 'matches'
  );
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [recCategoryFilter, setRecCategoryFilter] = useState<
    'all' | 'Top Recommended' | 'Strong Skill Fit' | 'Upskill Opportunity' | 'saved'
  >('all');
  const [maxRecDistanceKm, setMaxRecDistanceKm] = useState<number>(100);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skillmatch_saved_jobs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('skillmatch_saved_jobs_v1', JSON.stringify(bookmarkedJobIds));
    } catch {
      // ignore storage quota errors
    }
  }, [bookmarkedJobIds]);
  
  // Modals state
  const [applyingJob, setApplyingJob] = useState<JobVacancy | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [viewingBreakdownJob, setViewingBreakdownJob] = useState<{ job: JobVacancy; score: CompatibilityScore } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingBadgeModal, setIsAddingBadgeModal] = useState(false);
  const [editedSkillInput, setEditedSkillInput] = useState('');
  const [profileForm, setProfileForm] = useState<WorkerProfile>(worker);
  const [showCredentials, setShowCredentials] = useState(false);

  // New badge form state
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeCode, setNewBadgeCode] = useState('');
  const [newBadgeIssuer, setNewBadgeIssuer] = useState('');
  const [newBadgeLicense, setNewBadgeLicense] = useState('');
  const [newBadgeArea, setNewBadgeArea] = useState<TradeCategory | 'General Safety' | 'Compliance'>('General Safety');
  const [newBadgeExpiry, setNewBadgeExpiry] = useState('2028-12-31');
  const [newBadgeMultiplier, setNewBadgeMultiplier] = useState(1.10);
  const [newBadgeDesc, setNewBadgeDesc] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Synchronize profileForm when active worker changes
  React.useEffect(() => {
    setProfileForm(worker);
  }, [worker]);

  // Job Recommendation Engine (Module 7)
  const allRecommendations = generateJobRecommendations(
    worker,
    jobs,
    applications,
    bookmarkedJobIds,
    weights
  );

  const recommendedJobs = allRecommendations.filter((rec) => {
    const withinDist = rec.score.distanceKm <= maxRecDistanceKm;
    if (!withinDist) return false;
    if (recCategoryFilter === 'saved') return rec.isBookmarked;
    if (recCategoryFilter !== 'all') return rec.fitCategory === recCategoryFilter;
    return rec.score.totalScore >= 55;
  });

  // Worker Competition Profile Engine (Module 3)
  const competitionBenchmark = computeWorkerCompetitionProfile(
    worker,
    allWorkers,
    jobs
  );

  const toggleBookmarkJob = (jobId: string) => {
    setBookmarkedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleQuickAddSkillFromMarket = (skill: string) => {
    if (!worker.skills.includes(skill)) {
      onUpdateWorker({
        ...worker,
        skills: [...worker.skills, skill],
      });
    }
  };

  // Compute compatibility score for all jobs (explore tab)
  const scoredJobs = jobs.map((job) => ({
    job,
    score: computeCompatibilityScore(worker, job, weights),
    isApplied: applications.some((app) => app.jobId === job.id && app.workerId === worker.id),
    application: applications.find((app) => app.jobId === job.id && app.workerId === worker.id),
  }));

  // Filtered jobs list
  const filteredJobs = scoredJobs.filter((item) => {
    const matchesSearch =
      item.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.job.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrade = selectedTrade === 'all' || item.job.trade === selectedTrade;
    const matchesShift = selectedShift === 'all' || item.job.shift === selectedShift;
    const matchesPay = item.job.payRate >= minPay;

    return matchesSearch && matchesTrade && matchesShift && matchesPay;
  });

  const workerApplications = applications.filter((app) => app.workerId === worker.id);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    onApplyJob(applyingJob, coverNote);
    setApplyingJob(null);
    setCoverNote('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorker(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddSkill = () => {
    if (!editedSkillInput.trim()) return;
    if (!profileForm.skills.includes(editedSkillInput.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, editedSkillInput.trim()],
      });
    }
    setEditedSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter((s) => s !== skillToRemove),
    });
  };

  // Add new verified badge submission
  const handleAddNewBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim() || !newBadgeIssuer.trim()) return;

    const newBadge: VerifiedBadge = {
      id: `vb-${Date.now()}`,
      name: newBadgeName.trim(),
      code: newBadgeCode.trim() || newBadgeName.trim().substring(0, 8).toUpperCase(),
      issuer: newBadgeIssuer.trim(),
      licenseNumber: newBadgeLicense.trim() || `VER-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newBadgeExpiry,
      status: 'verified',
      competencyArea: newBadgeArea,
      tierMultiplier: newBadgeMultiplier,
      description: newBadgeDesc.trim() || 'Accredited trade competency verified by national certification board.',
    };

    const updatedWorker: WorkerProfile = {
      ...worker,
      verifiedBadges: [...(worker.verifiedBadges || []), newBadge],
      verificationTier: 'Master Craftsman',
    };

    onUpdateWorker(updatedWorker);
    setIsAddingBadgeModal(false);
    // Reset form
    setNewBadgeName('');
    setNewBadgeCode('');
    setNewBadgeIssuer('');
    setNewBadgeLicense('');
    setNewBadgeDesc('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Worker Header Card with Competency Profile */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                />
                {worker.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-800 text-white p-0.5 rounded-full border-2 border-white" title="Verified Trade Competency">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-stone-900">
                    {worker.name}
                  </h1>
                  <span className="text-xs font-semibold text-emerald-800">
                    · {worker.trade}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-600 mt-1 font-mono tabular-nums">
                  <span>{worker.experienceYears} yrs exp</span>
                  <span aria-hidden="true">·</span>
                  <span>{worker.location.city}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-stone-900">₹{worker.dailyRate}/day</span>
                  <span aria-hidden="true">·</span>
                  <span>Rating {worker.rating}/5 ({worker.completedGigs} jobs)</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowCredentials((v) => !v)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-300 transition-colors cursor-pointer"
              >
                {showCredentials
                  ? 'Hide Badges & Skills'
                  : `View Badges & Skills (${worker.verifiedBadges?.length || 0})`}
              </button>

              <button
                id="btn-add-verified-badge"
                onClick={() => setIsAddingBadgeModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Badge
              </button>

              <button
                id="btn-edit-worker-profile"
                onClick={() => setIsEditingProfile(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
                Edit Skills
              </button>

              <button
                id="btn-worker-active-tasks"
                onClick={() => onNavigateToTasks(worker.id)}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-stone-700" />
                Tasks
              </button>
            </div>
          </div>
        </div>

        {/* VERIFIED BADGES & SKILLS (EXPANDABLE) */}
        {showCredentials && (
          <>
            <div className="p-6 bg-white border-b border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-stone-800">
                      Accredited Verified Competencies & Industry Badges ({worker.verifiedBadges?.length || 0})
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Officially validated credentials by industry boards, unlocking tiered matching multiplier bonuses on safety-critical projects.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingBadgeModal(true)}
                  className="text-xs font-mono text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Register New License
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {(worker.verifiedBadges || []).map((badge) => (
                  <div 
                    key={badge.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                          {badge.code}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                          +{Math.round(((badge.tierMultiplier || 1.10) - 1.0) * 100)}% Match Boost
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 mt-2 leading-snug">
                        {badge.name}
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
                        {badge.issuer}
                      </p>
                      {badge.description && (
                        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                          {badge.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] font-mono text-stone-600">
                      <span className="truncate">Lic #{badge.licenseNumber}</span>
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        Verified · Exp {badge.expiryDate.substring(0, 7)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worker Skills Bar & Availability */}
            <div className="bg-stone-50/50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">
                  Specialized Skills:
                </span>
                {worker.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-white text-stone-800 text-xs px-2.5 py-1 rounded-md border border-stone-200 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
                <span className="text-stone-500">Shift Alignment:</span>
                <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-300 font-semibold">
                  {worker.availability}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sub navigation: Job Recommendations vs Competition Profile vs Search All vs Applications */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            id="tab-recommended-jobs"
            onClick={() => setActiveTab('matches')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            Job Recommendations
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'matches' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {recommendedJobs.length}
            </span>
          </button>

          <button
            id="tab-competition-profile"
            onClick={() => setActiveTab('competition')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'competition'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-800" />
            Competition Profile
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'competition' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              #{competitionBenchmark.tradeRank}
            </span>
          </button>

          <button
            id="tab-all-jobs"
            onClick={() => setActiveTab('all-jobs')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all-jobs'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            All Vacancies
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'all-jobs' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {jobs.length}
            </span>
          </button>

          <button
            id="tab-my-applications"
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            Pipeline
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'applications' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {workerApplications.length}
            </span>
          </button>
        </div>

        <div className="text-xs font-mono text-stone-600 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Competitive Rank: <strong className="text-emerald-800">Top {100 - competitionBenchmark.percentile + 1}%</strong> · {worker.verifiedBadges?.length || 0} Badges</span>
        </div>
      </div>

      {/* TAB 1: JOB RECOMMENDATION MODULE */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                  <Sparkles className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                    Personalized Job Recommendations for {worker.name}
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Ranked by skill coverage, geo-distance, wage alignment, and verified credential multipliers with transparent match reasons.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('all-jobs')}
                className="text-xs font-mono font-semibold text-emerald-800 hover:text-emerald-950 whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
              >
                Explore all {jobs.length} vacancies <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recommendation Tier & Distance Filters */}
            <div className="pt-3 border-t border-emerald-200/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Qualified Matches' },
                  { id: 'Top Recommended', label: 'Top Recommended (≥80%)' },
                  { id: 'Strong Skill Fit', label: 'Strong Skill Fit' },
                  { id: 'Upskill Opportunity', label: 'Upskill Needed' },
                  { id: 'saved', label: `Saved (${bookmarkedJobIds.length})` },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setRecCategoryFilter(chip.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer border ${
                      recCategoryFilter === chip.id
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-stone-700">
                <span>Max Distance: <strong className="text-emerald-800">{maxRecDistanceKm} km</strong></span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={maxRecDistanceKm}
                  onChange={(e) => setMaxRecDistanceKm(Number(e.target.value))}
                  className="w-28 accent-emerald-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No recommendations match this filter</p>
              <p className="text-xs text-stone-500">
                Try increasing the distance filter or switching back to "All Qualified Matches".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendedJobs.map((rec) => (
                <JobCard
                  key={rec.job.id}
                  job={rec.job}
                  score={rec.score}
                  isApplied={rec.isApplied}
                  application={rec.application}
                  reasons={rec.reasons}
                  fitCategory={rec.fitCategory}
                  isBookmarked={rec.isBookmarked}
                  onToggleBookmark={() => toggleBookmarkJob(rec.job.id)}
                  onApply={() => setApplyingJob(rec.job)}
                  onViewBreakdown={() => setViewingBreakdownJob({ job: rec.job, score: rec.score })}
                  onNavigateToTasks={onNavigateToTasks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WORKER COMPETITION PROFILE MODULE */}
      {activeTab === 'competition' && (
        <div className="space-y-6">
          {/* Competition KPI Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <p className="text-xs font-semibold text-emerald-800">
                  Trade Benchmarking · {worker.trade}
                </p>
                <h2 className="text-xl font-bold text-stone-900 mt-0.5">
                  How {worker.name} Ranks Against Peers
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Compares your skills, verified badges, experience, and daily rate against other specialists in your trade.
                </p>
              </div>

              <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl text-center shrink-0">
                <span className="text-[11px] text-emerald-100 block">
                  Competition Score
                </span>
                <span className="text-2xl font-bold font-mono tabular-nums">
                  {competitionBenchmark.competitionScore} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-mono text-stone-500">Trade Peer Rank</span>
                <div className="text-2xl font-mono font-black text-emerald-800 mt-1">
                  #{competitionBenchmark.tradeRank} <span className="text-xs font-normal text-stone-500">of {competitionBenchmark.totalPeersInTrade}</span>
                </div>
                <p className="text-[10px] font-mono text-stone-600 mt-1">In {worker.trade}</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-mono text-stone-500">Platform Percentile</span>
                <div className="text-2xl font-mono font-black text-stone-900 mt-1">
                  {competitionBenchmark.percentile}th
                </div>
                <p className="text-[10px] font-mono text-emerald-800 font-semibold mt-1">
                  Overall #{competitionBenchmark.overallRank} of {competitionBenchmark.totalWorkers}
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-mono text-stone-500">Daily Rate vs Market</span>
                <div className="text-2xl font-mono font-black text-stone-900 mt-1">
                  ₹{worker.dailyRate}
                </div>
                <p className="text-[10px] font-mono text-stone-600 mt-1">
                  Trade Avg: ₹{competitionBenchmark.avgTradeDailyRate}/day
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-mono text-stone-500">Verified Badge Power</span>
                <div className="text-2xl font-mono font-black text-emerald-800 mt-1">
                  {worker.verifiedBadges?.length || 0} <span className="text-xs font-normal text-stone-500">vs {competitionBenchmark.avgTradeBadges} avg</span>
                </div>
                <p className="text-[10px] font-mono text-stone-600 mt-1">
                  Tier: {worker.verificationTier || 'Standard'}
                </p>
              </div>
            </div>

            {/* Competitive Strengths & Market Skill Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Competitive Advantages Over Peers
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {competitionBenchmark.competitiveStrengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                  High-Demand Skills to Gain an Edge
                </h3>
                {competitionBenchmark.highDemandMissingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-800 font-medium">
                    You already possess all top-requested skills in open {worker.trade} vacancies!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-600">
                      Adding these employer-requested skills raises your competitive score immediately:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {competitionBenchmark.highDemandMissingSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleQuickAddSkillFromMarket(skill)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-800 hover:text-white border border-stone-300 rounded-lg text-xs font-mono font-semibold text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" /> {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trade Peer Standings Table */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900">
              Trade Competition Standings ({worker.trade} Specialists)
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Specialist</th>
                    <th className="p-3">Skills</th>
                    <th className="p-3">Verified Badges</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Daily Rate</th>
                    <th className="p-3 text-right">Comp Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {competitionBenchmark.peerStandings.map((peer, idx) => (
                    <tr
                      key={peer.workerId}
                      className={peer.isCurrent ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-stone-50'}
                    >
                      <td className="p-3 font-bold text-stone-900">#{idx + 1}</td>
                      <td className="p-3">
                        <span className="text-stone-900 font-bold">{peer.name}</span>
                        {peer.isCurrent && (
                          <span className="ml-2 text-[10px] bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                        <span className="block text-[10px] text-stone-500">{peer.city}</span>
                      </td>
                      <td className="p-3 text-stone-700">{peer.skillsCount} skills</td>
                      <td className="p-3 text-emerald-800 font-bold">{peer.badgesCount} badges</td>
                      <td className="p-3 text-stone-700">{peer.experienceYears} yrs</td>
                      <td className="p-3 text-stone-700">₹{peer.dailyRate}</td>
                      <td className="p-3 text-right font-black text-emerald-800">{peer.competitionScore}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPLORE ALL JOBS & FILTERS */}
      {activeTab === 'all-jobs' && (
        <div className="space-y-5">
          {/* Filters card */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Search Keywords</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Title, skill, employer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50 text-stone-900 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Trade Category</label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50 text-stone-900 cursor-pointer"
                >
                  <option value="all">All Blue-Collar Trades</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Welding & Fabrication">Welding & Fabrication</option>
                  <option value="HVAC & Refrigeration">HVAC & Refrigeration</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Heavy Equipment & Operations">Heavy Equipment & Operations</option>
                  <option value="Carpentry & Framing">Carpentry & Framing</option>
                  <option value="Masonry & Concrete">Masonry & Concrete</option>
                  <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Shift Type</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50 text-stone-900 cursor-pointer"
                >
                  <option value="all">Any Shift</option>
                  <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                  <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                  <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                  <option value="Flexible / Any">Flexible / Any</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Min Pay: <span className="font-mono text-emerald-800 font-semibold">₹{minPay}/day</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="3500"
                  step="100"
                  value={minPay}
                  onChange={(e) => setMinPay(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map(({ job, score, isApplied, application }) => (
              <JobCard
                key={job.id}
                job={job}
                score={score}
                isApplied={isApplied}
                application={application}
                onApply={() => setApplyingJob(job)}
                onViewBreakdown={() => setViewingBreakdownJob({ job, score })}
                onNavigateToTasks={onNavigateToTasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-stone-800">
                Application & Deployment Pipeline ({workerApplications.length})
              </h3>
            </div>

            <div className="divide-y divide-stone-200">
              {workerApplications.map((app) => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{app.jobTitle}</h4>
                      <span className="text-xs text-stone-500">· {app.companyName}</span>
                    </div>
                    <div className="text-xs font-mono text-stone-500 flex items-center gap-3">
                      <span>Applied: {app.appliedDate}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-800">
                        {app.compatibilityScore.totalScore}% Compatibility Score
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono px-3 py-1 rounded-md font-bold uppercase tracking-wider border ${
                      app.status === 'hired'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-stone-100 text-stone-700 border-stone-300'
                    }`}>
                      {app.status}
                    </span>
                    {app.status === 'hired' && (
                      <button
                        onClick={() => onNavigateToTasks()}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                      >
                        Site Tasks →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Apply for Job */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Apply for Vacancy</h3>
                <p className="text-xs text-stone-500 mt-0.5">{applyingJob.title}</p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-4">
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  Your Profile Credentials Will Be Transmitted
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Your certified competencies, verified license numbers ({worker.verifiedBadges?.map(b => b.code).join(', ')}), and rate expectation (₹{worker.dailyRate}/day) will be dispatched to the employer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Introduction / Safety Experience Note
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="State your availability, high-voltage/structural welding experience, and PPE readiness..."
                  className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  Confirm & Dispatch Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Verify New Certification Badge */}
      {isAddingBadgeModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-base font-bold text-stone-900">Register Verified Credential</h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Submit official trade certificates to earn a verified matching score multiplier.
                </p>
              </div>
              <button
                onClick={() => setIsAddingBadgeModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewBadgeSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
                Registered certifications are audited against standard state licensing registries and activate an algorithmic multiplier (e.g. +10% to +15% boost).
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OSHA 30-Hour Construction Safety, AWS Certified Welder"
                  value={newBadgeName}
                  onChange={(e) => setNewBadgeName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OSHA-30, AWS-D1.1"
                    value={newBadgeCode}
                    onChange={(e) => setNewBadgeCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Competency Domain
                  </label>
                  <select
                    value={newBadgeArea}
                    onChange={(e) => setNewBadgeArea(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="General Safety">General Safety</option>
                    <option value="Compliance">Compliance & Inspection</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Welding & Fabrication">Welding & Fabrication</option>
                    <option value="HVAC & Refrigeration">HVAC & Refrigeration</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Heavy Equipment & Operations">Heavy Equipment & Operations</option>
                    <option value="Carpentry & Framing">Carpentry & Framing</option>
                    <option value="Masonry & Concrete">Masonry & Concrete</option>
                    <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Issuing Authority *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OSHA Directorate, AWS, State Board"
                    value={newBadgeIssuer}
                    onChange={(e) => setNewBadgeIssuer(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    License / Reg Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REG-88419-A"
                    value={newBadgeLicense}
                    onChange={(e) => setNewBadgeLicense(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newBadgeExpiry}
                    onChange={(e) => setNewBadgeExpiry(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tier Multiplier Boost
                  </label>
                  <select
                    value={newBadgeMultiplier}
                    onChange={(e) => setNewBadgeMultiplier(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value={1.08}>Tier 1 (+8% Multiplier)</option>
                    <option value={1.12}>Tier 2 (+12% Multiplier)</option>
                    <option value={1.15}>Master Tier (+15% Multiplier)</option>
                  </select>
                </div>
              </div>

              {/* Simulated Document Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Upload Credential Document (PDF / Scan)
                </label>
                <div 
                  onClick={() => setIsUploadingDoc(!isUploadingDoc)}
                  className="border-2 border-dashed border-stone-300 hover:border-emerald-700 rounded-xl p-4 text-center cursor-pointer transition-colors bg-stone-50"
                >
                  <UploadCloud className="w-6 h-6 text-stone-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-stone-800">
                    {isUploadingDoc ? 'Document attached: certified_license_scan.pdf (1.4 MB)' : 'Click to attach license document or drop scan'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Accepted: PDF, PNG, JPG (Max 15MB) · Encrypted verification storage
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Competency Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of certified scope (e.g., high-voltage 400A panel wiring, pressure vessel welding)..."
                  value={newBadgeDesc}
                  onChange={(e) => setNewBadgeDesc(e.target.value)}
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddingBadgeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  Verify & Register Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Multi-Criteria Compatibility Breakdown */}
      {viewingBreakdownJob && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-base font-bold text-stone-900">Multi-Criteria Score Breakdown</h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{viewingBreakdownJob.job.title}</p>
              </div>
              <button
                onClick={() => setViewingBreakdownJob(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Overall & Multiplier Highlight */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-900 font-bold">
                    Final Boosted Score
                  </span>
                  <div className="text-3xl font-extrabold text-stone-900 font-mono mt-0.5">
                    {viewingBreakdownJob.score.totalScore}%
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Base Score: {viewingBreakdownJob.score.baseScore || viewingBreakdownJob.score.totalScore}%
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-emerald-800 text-white text-xs font-mono font-bold px-2.5 py-1 rounded">
                    {viewingBreakdownJob.score.verifiedBadgeMultiplier || 1.0}x Multiplier
                  </span>
                  <p className="text-[11px] font-mono text-emerald-900 font-semibold mt-1">
                    +{Math.round(((viewingBreakdownJob.score.verifiedBadgeMultiplier || 1.0) - 1.0) * 100)}% Badge Visibility Boost
                  </p>
                </div>
              </div>

              {/* 5 Core Components */}
              <div className="space-y-2.5">
                <ScoreBar
                  label={`Skills Compatibility (${Math.round(weights.skillsWeight * 100)}% Weight)`}
                  score={viewingBreakdownJob.score.breakdown.skillMatchScore}
                  colorClass="bg-emerald-800"
                />
                <ScoreBar
                  label={`Experience Level (${Math.round(weights.experienceWeight * 100)}% Weight)`}
                  score={viewingBreakdownJob.score.breakdown.experienceScore}
                  colorClass="bg-stone-700"
                />
                <ScoreBar
                  label={`Geographic Proximity (${Math.round(weights.geographicalWeight * 100)}% Weight)`}
                  score={viewingBreakdownJob.score.breakdown.geographicalScore}
                  colorClass="bg-stone-600"
                />
                <ScoreBar
                  label={`Availability / Shift Alignment (${Math.round(weights.availabilityWeight * 100)}% Weight)`}
                  score={viewingBreakdownJob.score.breakdown.availabilityScore}
                  colorClass="bg-stone-500"
                />
                <ScoreBar
                  label={`Compensation Alignment (${Math.round(weights.compensationWeight * 100)}% Weight)`}
                  score={viewingBreakdownJob.score.breakdown.compensationScore}
                  colorClass="bg-emerald-700"
                />
              </div>

              {/* Applied Verified Badges list */}
              <div className="pt-2 border-t border-stone-200">
                <span className="text-xs font-mono font-bold text-stone-700 block mb-1.5">
                  Applied Verified Accreditations ({worker.verifiedBadges?.length || 0}):
                </span>
                <div className="space-y-1">
                  {(worker.verifiedBadges || []).map((badge) => (
                    <div key={badge.id} className="text-xs text-stone-600 flex items-center justify-between bg-stone-50 px-2 py-1 rounded">
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        {badge.name} ({badge.code})
                      </span>
                      <span className="font-mono text-emerald-800 font-bold">
                        +{Math.round(((badge.tierMultiplier || 1.10) - 1.0) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setViewingBreakdownJob(null)}
                  className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-700 cursor-pointer"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Worker Profile */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-stone-900">Edit Worker Profile & Competencies</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Modify profile attributes to observe live recalculation of job matches.
                </p>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Trade</label>
                  <select
                    value={profileForm.trade}
                    onChange={(e) => setProfileForm({ ...profileForm, trade: e.target.value as TradeCategory })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Welding & Fabrication">Welding & Fabrication</option>
                    <option value="HVAC & Refrigeration">HVAC & Refrigeration</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Heavy Equipment & Operations">Heavy Equipment & Operations</option>
                    <option value="Carpentry & Framing">Carpentry & Framing</option>
                    <option value="Masonry & Concrete">Masonry & Concrete</option>
                    <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={profileForm.experienceYears}
                    onChange={(e) => setProfileForm({ ...profileForm, experienceYears: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Shift Availability</label>
                  <select
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value as AvailabilityShift })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                    <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                    <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                    <option value="Flexible / Any">Flexible / Any</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Expected Daily Rate (₹)</label>
                  <input
                    type="number"
                    min={500}
                    step={50}
                    value={profileForm.dailyRate}
                    onChange={(e) => setProfileForm({ ...profileForm, dailyRate: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Max Travel Distance (km)</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={profileForm.location.maxTravelDistanceKm}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      location: {
                        ...profileForm.location,
                        maxTravelDistanceKm: Number(e.target.value)
                      }
                    })}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Skills Editor */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Specialized Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a new skill (e.g. Arc Welding, PLC)..."
                    value={editedSkillInput}
                    onChange={(e) => setEditedSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 text-xs p-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-200 min-h-[50px]">
                  {profileForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white text-stone-800 text-xs px-2.5 py-1 rounded-md border border-stone-200 flex items-center gap-1.5 shadow-2xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  Save Profile & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Job Card with clean enterprise styling & recommendation reasons
interface JobCardProps {
  job: JobVacancy;
  score: CompatibilityScore;
  isApplied: boolean;
  application?: JobApplication;
  reasons?: string[];
  fitCategory?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onApply: () => void;
  onViewBreakdown: () => void;
  onNavigateToTasks: (workerId?: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  score,
  isApplied,
  application,
  reasons,
  fitCategory,
  isBookmarked,
  onToggleBookmark,
  onApply,
  onViewBreakdown,
  onNavigateToTasks,
}) => {
  const hasBadgeBoost = score.verifiedBadgeMultiplier && score.verifiedBadgeMultiplier > 1.0;

  return (
    <div
      className="h-full rounded-2xl bg-white border border-stone-200 hover:border-stone-300 hover:shadow-xs p-5 transition-all shadow-2xs flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Header with Title and Compatibility Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-stone-500">
              <span className="font-medium text-stone-700">{job.companyName}</span>
              {fitCategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-800">{fitCategory}</span>
                </>
              )}
            </div>
            <h3 className="text-base font-bold text-stone-900 leading-snug tracking-tight">
              {job.title}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {job.projectName}
            </p>
          </div>

          {/* Compatibility Indicator + Bookmark */}
          <div className="flex items-start gap-2 shrink-0">
            {onToggleBookmark && (
              <button
                onClick={onToggleBookmark}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-stone-900'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Save job recommendation'}
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onViewBreakdown}
              className="flex flex-col items-end cursor-pointer group"
              title="Click to view multi-criteria breakdown"
            >
              <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs border ${
                score.totalScore >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : score.totalScore >= 65
                  ? 'bg-stone-100 text-stone-800 border-stone-300'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}>
                <ShieldCheck className="w-3 h-3 text-emerald-800" />
                <span>{score.totalScore}% Match</span>
              </div>
              {hasBadgeBoost && (
                <span className="text-[10px] font-mono text-emerald-800 font-bold mt-0.5">
                  {score.verifiedBadgeMultiplier}x Badge Boost
                </span>
              )}
              <span className="text-[10px] font-mono text-stone-500 underline font-medium mt-0.5 group-hover:text-stone-800">
                inspect math
              </span>
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Explainable Recommendation Reasons (Module 7) */}
        {reasons && reasons.length > 0 && (
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-2.5 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900 block">
              Why Recommended:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {reasons.slice(0, 3).map((r, i) => (
                <span key={i} className="text-[11px] font-mono text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  • {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">Skills:</span>
            {job.requiredSkills.map((skill) => {
              const hasSkill = score.matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                    hasSkill
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {hasSkill ? '✓' : '•'} {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Info badges in clean light inset */}
        <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="font-bold text-stone-900 font-mono">
              ₹{job.payRate} / {job.payType}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span className="truncate text-stone-700">{job.shift}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span className="font-mono text-[11px] text-stone-700">{score.distanceKm} km ({job.location.city})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span className="text-stone-700">Req: {job.requiredExperienceYears}y exp</span>
          </div>
        </div>
      </div>

      {/* Footer / Apply action */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-stone-500">
          <span className="font-semibold text-stone-900">{job.openings - job.filledCount}</span> slots open
          {job.urgency === 'immediate' && (
            <span className="ml-2 bg-stone-200 text-stone-900 border border-stone-300 px-1.5 py-0.5 rounded font-bold text-[10px]">
              Priority Start
            </span>
          )}
        </div>

        <div>
          {isApplied ? (
            application?.status === 'hired' ? (
              <button
                onClick={() => onNavigateToTasks()}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Hired · Tasks
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-mono rounded-xl border border-stone-200 font-semibold">
                Applied ({application?.status})
              </span>
            )
          ) : (
            <button
              id={`btn-apply-${job.id}`}
              onClick={onApply}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Apply for Gig
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ScoreBar: React.FC<{ label: string; score: number; colorClass: string }> = ({
  label,
  score,
  colorClass,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-stone-700">
        <span>{label}</span>
        <span className="font-bold font-mono">{score}%</span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};
