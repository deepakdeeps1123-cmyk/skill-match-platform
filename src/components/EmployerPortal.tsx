import React, { useState } from 'react';
import { 
  JobVacancy, 
  WorkerProfile, 
  JobApplication, 
  MatchingWeights, 
  TradeCategory, 
  AvailabilityShift 
} from '../types';
import { computeCompatibilityScore } from '../services/matchingEngine';
import { 
  Plus, 
  Users, 
  Briefcase, 
  Sparkles, 
  Clock, 
  MapPin, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Check, 
  UserCheck,
  Building,
  Filter,
  Pencil,
  Trash2,
  Power
} from 'lucide-react';

interface EmployerPortalProps {
  jobs: JobVacancy[];
  workers: WorkerProfile[];
  applications: JobApplication[];
  onAddJob: (newJob: Omit<JobVacancy, 'id' | 'postedDate' | 'filledCount'>) => void;
  onUpdateJob: (updatedJob: JobVacancy) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: JobApplication['status']) => void;
  onHireWorker: (worker: WorkerProfile, job: JobVacancy) => void;
  onNavigateToTasks: (workerId?: string) => void;
  weights: MatchingWeights;
  activeEmployerName?: string;
  initialTab?: 'ranked-pool' | 'applications' | 'my-vacancies' | 'employees';
}

export const EmployerPortal: React.FC<EmployerPortalProps> = ({
  jobs,
  workers,
  applications,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onHireWorker,
  onNavigateToTasks,
  weights,
  activeEmployerName,
  initialTab,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<JobVacancy | null>(null);
  const [activeTab, setActiveTab] = useState<'ranked-pool' | 'applications' | 'my-vacancies' | 'employees'>(
    initialTab || 'my-vacancies'
  );
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);

  // Selected job for candidate pool evaluation
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobProject, setNewJobProject] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('Metro Infrastructure & EPC Ltd');
  const [newJobTrade, setNewJobTrade] = useState<TradeCategory>('Electrical');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('');
  const [newJobPrefSkills, setNewJobPrefSkills] = useState('');
  const [newJobExp, setNewJobExp] = useState(3);
  const [newJobPay, setNewJobPay] = useState(2400);
  const [newJobPayType, setNewJobPayType] = useState<'daily' | 'hourly'>('daily');
  const [newJobShift, setNewJobShift] = useState<AvailabilityShift>('Morning (6 AM - 2 PM)');
  const [newJobCity, setNewJobCity] = useState('Chennai');
  const [newJobSiteAddress, setNewJobSiteAddress] = useState('Central Metro Hub Gate 4');
  const [newJobOpenings, setNewJobOpenings] = useState(4);
  const [newJobUrgency, setNewJobUrgency] = useState<'normal' | 'urgent' | 'immediate'>('urgent');

  // Compute compatibility score of all workers for the selected job
  const rawRankedWorkers = selectedJob
    ? workers.map((worker) => {
        const score = computeCompatibilityScore(worker, selectedJob, weights);
        const app = applications.find(
          (a) => a.jobId === selectedJob.id && a.workerId === worker.id
        );
        return {
          worker,
          score,
          application: app,
          isHired: app?.status === 'hired',
          isShortlisted: app?.status === 'shortlisted',
        };
      }).sort((a, b) => b.score.totalScore - a.score.totalScore)
    : [];

  const rankedWorkers = verifiedOnlyFilter 
    ? rawRankedWorkers.filter(w => (w.worker.verifiedBadges?.length || 0) > 0)
    : rawRankedWorkers;

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const reqSkillsArray = newJobSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const prefSkillsArray = newJobPrefSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onAddJob({
      employerId: 'emp-1',
      companyName: newJobCompany,
      projectName: newJobProject,
      title: newJobTitle,
      trade: newJobTrade,
      description: newJobDesc,
      requiredSkills: reqSkillsArray,
      preferredSkills: prefSkillsArray,
      requiredExperienceYears: newJobExp,
      location: {
        city: newJobCity,
        state: 'Tamil Nadu',
        lat: 13.0827,
        lng: 80.2707,
        siteAddress: newJobSiteAddress,
      },
      shift: newJobShift,
      payType: newJobPayType,
      payRate: newJobPay,
      duration: '1 Month (Renewable)',
      urgency: newJobUrgency,
      status: 'open',
      openings: newJobOpenings,
      deadlineDate: '2026-10-15',
    });

    setIsPostingJob(false);
    // Reset form
    setNewJobTitle('');
    setNewJobProject('');
    setNewJobDesc('');
    setNewJobSkills('');
    setNewJobPrefSkills('');
  };

  const currentJobApplications = applications.filter((app) => app.jobId === selectedJob?.id);
  const hiredApplications = applications.filter((app) => app.status === 'hired');

  const handleOpenEditJob = (job: JobVacancy) => {
    setEditingJob(job);
    setNewJobTitle(job.title);
    setNewJobProject(job.projectName);
    setNewJobCompany(job.companyName);
    setNewJobTrade(job.trade);
    setNewJobDesc(job.description);
    setNewJobSkills(job.requiredSkills.join(', '));
    setNewJobPrefSkills(job.preferredSkills.join(', '));
    setNewJobExp(job.requiredExperienceYears);
    setNewJobPay(job.payRate);
    setNewJobPayType(job.payType === 'fixed' ? 'daily' : job.payType);
    setNewJobShift(job.shift);
    setNewJobCity(job.location.city);
    setNewJobSiteAddress(job.location.siteAddress);
    setNewJobOpenings(job.openings);
    setNewJobUrgency(job.urgency);
    setIsPostingJob(true);
  };

  const handleSaveJobForm = (e: React.FormEvent) => {
    if (editingJob) {
      e.preventDefault();
      const reqSkillsArray = newJobSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const prefSkillsArray = newJobPrefSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      onUpdateJob({
        ...editingJob,
        companyName: newJobCompany,
        projectName: newJobProject,
        title: newJobTitle,
        trade: newJobTrade,
        description: newJobDesc,
        requiredSkills: reqSkillsArray,
        preferredSkills: prefSkillsArray,
        requiredExperienceYears: newJobExp,
        location: {
          ...editingJob.location,
          city: newJobCity,
          siteAddress: newJobSiteAddress,
        },
        shift: newJobShift,
        payType: newJobPayType,
        payRate: newJobPay,
        urgency: newJobUrgency,
        openings: newJobOpenings,
      });
      setEditingJob(null);
      setIsPostingJob(false);
    } else {
      handleCreateJob(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-800">
              {activeEmployerName || 'Client & Employer Portal'}
            </p>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
              Jobs, Applicants & Hired Team
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Post, edit, or close job vacancies, review incoming worker applications, and manage hired specialists on your roster.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-post-new-job"
              onClick={() => setIsPostingJob(true)}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Post Vacancy
            </button>
          </div>
        </div>

        {/* Target Vacancy Selector (shown when evaluating candidates or applicants) */}
        {(activeTab === 'ranked-pool' || activeTab === 'applications') && (
          <div className="mt-5 pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-600">
                Viewing Job:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-stone-50 text-stone-900 text-xs border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold cursor-pointer max-w-md"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.openings - job.filledCount} open)
                  </option>
                ))}
              </select>
            </div>

            {selectedJob && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span>{selectedJob.companyName}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedJob.location.city}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-800 font-semibold font-mono tabular-nums">
                  ₹{selectedJob.payRate}/{selectedJob.payType}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveTab('ranked-pool')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ranked-pool'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-700" />
            Ranked Candidate Pool
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'ranked-pool' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {rankedWorkers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-stone-500" />
            Applications
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'applications' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {currentJobApplications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('my-vacancies')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'my-vacancies'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-stone-500" />
            Vacancy Manager ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
            Employee Roster ({hiredApplications.length})
          </button>
        </div>

        {/* Verified Badges Only Toggle Filter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              verifiedOnlyFilter
                ? 'bg-emerald-800 text-white border-emerald-900'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Credentials Only</span>
            {verifiedOnlyFilter && <span className="bg-emerald-900 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded">ON</span>}
          </button>
        </div>
      </div>

      {/* TAB 1: RANKED CANDIDATE POOL */}
      {activeTab === 'ranked-pool' && (
        <div className="space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono text-stone-600 shadow-2xs">
            <span>
              Dynamic compatibility scores for <strong className="text-stone-900">{selectedJob?.title}</strong> factoring skills, experience, location, and verified multipliers.
            </span>
            <span className="font-semibold text-emerald-800">
              High Match Benchmark: ≥80%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rankedWorkers.map(({ worker, score, application, isHired, isShortlisted }, index) => {
              const hasBadges = (worker.verifiedBadges || []).length > 0;
              return (
                <div
                  key={worker.id}
                  className="rounded-2xl border border-stone-200 bg-white shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-stone-300 hover:shadow-xs"
                >
                  {/* Left: Worker profile summary */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-2xs"
                      />
                      <span className="absolute -top-2 -left-2 bg-stone-800 text-white text-[10px] font-mono font-extrabold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-stone-900">{worker.name}</h3>
                        <span className="bg-stone-100 text-stone-800 text-xs px-2 py-0.5 rounded-md font-mono font-semibold border border-stone-200">
                          {worker.trade}
                        </span>
                        {hasBadges && (
                          <span className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-semibold font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            {worker.verifiedBadges[0].code} Verified
                          </span>
                        )}
                        {isHired && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 font-mono">
                            <Check className="w-3 h-3" /> Hired on Project
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600">{worker.title}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-500 pt-1">
                        <span className="font-semibold text-stone-800">★ {worker.rating} ({worker.completedGigs} gigs)</span>
                        <span>·</span>
                        <span>{worker.experienceYears}y exp</span>
                        <span>·</span>
                        <span>₹{worker.dailyRate}/day</span>
                        <span>·</span>
                        <span className="text-stone-700 font-medium">{score.distanceKm} km away</span>
                        <span>·</span>
                        <span>{worker.availability}</span>
                      </div>

                      {/* Verified Badges Tags */}
                      {hasBadges && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">Licenses:</span>
                          {worker.verifiedBadges.map((badge) => (
                            <span 
                              key={badge.id}
                              className="text-[10px] font-mono bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-semibold"
                              title={`${badge.name} (Issued by ${badge.issuer})`}
                            >
                              {badge.code} (+{Math.round(((badge.tierMultiplier || 1.10) - 1.0) * 100)}%)
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Matched skills badges */}
                      <div className="flex flex-wrap items-center gap-1 pt-1.5">
                        <span className="text-[11px] font-mono font-semibold text-stone-500 mr-1">Skills:</span>
                        {score.matchedSkills.slice(0, 4).map((s) => (
                          <span key={s} className="bg-stone-100 text-stone-800 text-[11px] px-2 py-0.5 rounded-md border border-stone-200 font-mono font-medium">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center: Compatibility Breakdown mini-dashboard */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center gap-5 shrink-0 shadow-2xs">
                    <div className="text-center">
                      <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Match Score</span>
                      <div className={`text-2xl font-black font-mono ${
                        score.totalScore >= 80 ? 'text-emerald-800' : 'text-stone-700'
                      }`}>
                        {score.totalScore}%
                      </div>
                      {score.verifiedBadgeMultiplier && score.verifiedBadgeMultiplier > 1.0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-800 block">
                          {score.verifiedBadgeMultiplier}x Boost
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-semibold text-stone-500">
                        {score.recommendationTier}
                      </span>
                    </div>

                    <div className="w-px h-12 bg-stone-200"></div>

                    <div className="space-y-1 text-[11px] font-mono text-stone-600 min-w-[130px]">
                      <div className="flex justify-between">
                        <span>Skills (35%):</span>
                        <strong className="text-stone-900">{score.breakdown.skillMatchScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Exp (20%):</span>
                        <strong className="text-stone-900">{score.breakdown.experienceScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance (20%):</span>
                        <strong className="text-stone-900">{score.breakdown.geographicalScore}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Shift (15%):</span>
                        <strong className="text-stone-900">{score.breakdown.availabilityScore}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                    {isHired ? (
                      <button
                        onClick={() => onNavigateToTasks(worker.id)}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs w-full justify-center active:scale-95 transition-colors cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Manage Tasks
                      </button>
                    ) : (
                      <>
                        <button
                          id={`btn-hire-${worker.id}`}
                          onClick={() => onHireWorker(worker, selectedJob)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 w-full justify-center cursor-pointer active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Hire & Assign Task
                        </button>

                        <button
                          onClick={() => {
                            if (application) {
                              onUpdateApplicationStatus(application.id, 'shortlisted');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all w-full active:scale-95 cursor-pointer ${
                            isShortlisted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {isShortlisted ? '✓ Shortlisted' : 'Shortlist'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RECEIVED APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-2xs p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span>Applications for:</span>
            <span className="text-emerald-800 font-mono">{selectedJob?.title}</span>
          </h2>

          {currentJobApplications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
              <Users className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-mono font-semibold text-stone-700">No applications received yet for this vacancy</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                You can directly recruit and deploy workers from the Ranked Candidate Pool above!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {currentJobApplications.map((app) => (
                <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900">{app.workerName}</h4>
                      <span className="text-xs font-mono text-stone-500">({app.workerTrade})</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {app.compatibilityScore.totalScore}% Match
                      </span>
                    </div>
                    {app.coverNote && (
                      <p className="text-xs text-stone-700 mt-1.5 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        "{app.coverNote}"
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-stone-400 mt-1">
                      Applied on: {app.appliedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateApplicationStatus(app.id, e.target.value as any)}
                      className="text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="applied">Applied (New)</option>
                      <option value="screening">Screening</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="hired">Hired (Active Gig)</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    {app.status === 'hired' && (
                      <button
                        onClick={() => onNavigateToTasks(app.workerId)}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Tasks
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VACANCY CRUD MANAGER */}
      {activeTab === 'my-vacancies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                selectedJobId === job.id
                  ? 'border-emerald-800 bg-emerald-50/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
                      {job.companyName}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">{job.title}</h3>
                    <p className="text-xs text-stone-600 mt-0.5">{job.projectName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md border border-stone-200 bg-stone-100 font-semibold text-stone-800">
                      {job.trade}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                      job.status === 'open'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-300'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 mt-2 line-clamp-2">{job.description}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-stone-600">
                <div className="flex items-center gap-3">
                  <span>Slots: <strong className="text-stone-900">{job.filledCount}/{job.openings}</strong></span>
                  <span>Rate: <strong className="text-emerald-800">₹{job.payRate}/{job.payType}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditJob(job)}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 cursor-pointer"
                    title="Edit Vacancy"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onUpdateJob({
                        ...job,
                        status: job.status === 'open' ? 'closed' : 'open',
                      })
                    }
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 cursor-pointer"
                    title={job.status === 'open' ? 'Close Vacancy' : 'Reopen Vacancy'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 cursor-pointer"
                    title="Delete Vacancy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveTab('ranked-pool');
                    }}
                    className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-sans font-semibold cursor-pointer"
                  >
                    Matches →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: EMPLOYEE ROSTER & DEPLOYMENTS */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Active Site Employees & Deployed Specialists ({hiredApplications.length})
              </h2>
              <p className="text-xs text-stone-500">
                Manage hired personnel across active contractor projects and inspect deployment tasks.
              </p>
            </div>
          </div>

          {hiredApplications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl space-y-2">
              <UserCheck className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-mono font-semibold text-stone-700">No active hired employees yet</p>
              <p className="text-xs text-stone-500">
                Hire specialists from the Ranked Candidate Pool to deploy them to site projects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hiredApplications.map((app) => {
                const workerObj = workers.find((w) => w.id === app.workerId);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {workerObj && (
                        <img
                          src={workerObj.avatar}
                          alt={app.workerName}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900 truncate">{app.workerName}</h4>
                          <span className="text-[10px] font-mono bg-emerald-800 text-white px-2 py-0.5 rounded font-bold">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 truncate">
                          Role: {app.jobTitle} ({app.companyName})
                        </p>
                        <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                          {app.workerTrade} · Match {app.compatibilityScore.totalScore}% · Hired {app.hiredDate || app.appliedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => onNavigateToTasks(app.workerId)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        View Tasks →
                      </button>
                      <button
                        onClick={() => onUpdateApplicationStatus(app.id, 'shortlisted')}
                        className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"
                      >
                        Standby Bench
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Post or Edit Job Vacancy */}
      {isPostingJob && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingJob ? `Edit Vacancy: ${editingJob.title}` : 'Post New Blue-Collar Gig / Vacancy'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Define technical skill requirements and compensation to trigger matching algorithms.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsPostingJob(false);
                  setEditingJob(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJobForm} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={newJobProject}
                    onChange={(e) => setNewJobProject(e.target.value)}
                    placeholder="e.g. Metro Line Phase II"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Job Vacancy Title</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Master Pipefitter"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Trade Category</label>
                  <select
                    value={newJobTrade}
                    onChange={(e) => setNewJobTrade(e.target.value as TradeCategory)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
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

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Job Description</label>
                <textarea
                  rows={2}
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Describe scope of work, tools provided, and site conditions..."
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Required Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newJobSkills}
                    onChange={(e) => setNewJobSkills(e.target.value)}
                    placeholder="e.g. 3-Phase Wiring, Conduit Bending"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preferred Skills
                  </label>
                  <input
                    type="text"
                    value={newJobPrefSkills}
                    onChange={(e) => setNewJobPrefSkills(e.target.value)}
                    placeholder="e.g. PLC Troubleshooting"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Min Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={newJobExp}
                    onChange={(e) => setNewJobExp(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pay Rate (₹)</label>
                  <input
                    type="number"
                    value={newJobPay}
                    onChange={(e) => setNewJobPay(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pay Period</label>
                  <select
                    value={newJobPayType}
                    onChange={(e) => setNewJobPayType(e.target.value as any)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
                  >
                    <option value="daily">Per Day</option>
                    <option value="hourly">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Workforce Shift</label>
                  <select
                    value={newJobShift}
                    onChange={(e) => setNewJobShift(e.target.value as AvailabilityShift)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
                  >
                    <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                    <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                    <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                    <option value="Flexible / Any">Flexible / Any</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Urgency Level</label>
                  <select
                    value={newJobUrgency}
                    onChange={(e) => setNewJobUrgency(e.target.value as any)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="immediate">Immediate Start</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Site Address</label>
                  <input
                    type="text"
                    value={newJobSiteAddress}
                    onChange={(e) => setNewJobSiteAddress(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Open Positions</label>
                  <input
                    type="number"
                    min={1}
                    value={newJobOpenings}
                    onChange={(e) => setNewJobOpenings(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsPostingJob(false);
                    setEditingJob(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  {editingJob ? 'Save Vacancy Updates' : 'Publish Vacancy & Run Matching Engine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
