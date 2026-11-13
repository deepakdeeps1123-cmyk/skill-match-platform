import React, { useState } from 'react';
import {
  WorkerProfile,
  JobVacancy,
  MatchingWeights,
} from '../types';
import {
  computeCompatibilityScore,
  analyzeSkillMatch,
  DEFAULT_WEIGHTS,
} from '../services/matchingEngine';
import {
  Target,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  RefreshCw,
  ArrowUpDown,
  MapPin,
  Briefcase,
  Layers,
  UserCheck,
  Plus,
} from 'lucide-react';

interface MatchingAndRankingHubProps {
  portalRole: 'worker' | 'employer';
  workers: WorkerProfile[];
  jobs: JobVacancy[];
  activeWorker: WorkerProfile;
  weights: MatchingWeights;
  onUpdateWeights: (newWeights: MatchingWeights) => void;
  onHireWorker: (worker: WorkerProfile, job: JobVacancy) => void;
  onAddSkillToWorker?: (workerId: string, skill: string) => void;
  initialSubModule?: 'skill-matching' | 'scoring-ranking';
}

export const MatchingAndRankingHub: React.FC<MatchingAndRankingHubProps> = ({
  portalRole,
  workers,
  jobs,
  activeWorker,
  weights,
  onUpdateWeights,
  onHireWorker,
  onAddSkillToWorker,
  initialSubModule,
}) => {
  const isEmployer = portalRole === 'employer';
  const [subModule, setSubModule] = useState<'skill-matching' | 'scoring-ranking'>(
    isEmployer ? initialSubModule || 'skill-matching' : 'skill-matching'
  );
  React.useEffect(() => {
    if (!isEmployer) {
      setSubModule('skill-matching');
    } else if (initialSubModule) {
      setSubModule(initialSubModule);
    }
  }, [initialSubModule, isEmployer]);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    activeWorker?.id || workers[0]?.id || ''
  );
  const [applyMultiplier, setApplyMultiplier] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'totalScore' | 'skillScore' | 'distance'>(
    'totalScore'
  );

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedWorker = isEmployer
    ? workers.find((w) => w.id === selectedWorkerId) || activeWorker || workers[0]
    : activeWorker;

  const skillAnalysis =
    selectedJob && selectedWorker
      ? analyzeSkillMatch(selectedWorker, selectedJob)
      : null;

  const currentCompat =
    selectedJob && selectedWorker
      ? computeCompatibilityScore(selectedWorker, selectedJob, weights, applyMultiplier)
      : null;

  // Ranked Leaderboard for selectedJob
  const rankedCandidates = selectedJob
    ? workers
        .map((w) => ({
          worker: w,
          score: computeCompatibilityScore(w, selectedJob, weights, applyMultiplier),
          skills: analyzeSkillMatch(w, selectedJob),
        }))
        .sort((a, b) => {
          if (sortBy === 'skillScore') {
            return b.score.breakdown.skillMatchScore - a.score.breakdown.skillMatchScore;
          }
          if (sortBy === 'distance') {
            return a.score.distanceKm - b.score.distanceKm;
          }
          return b.score.totalScore - a.score.totalScore;
        })
    : [];

  const totalWeightPct = Math.round(
    (weights.skillsWeight +
      weights.experienceWeight +
      weights.geographicalWeight +
      weights.availabilityWeight +
      weights.compensationWeight) *
      100
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-emerald-800 font-semibold">
              {isEmployer
                ? 'Candidate Evaluation · Skill Matrix & Weighted Ranking'
                : 'Personal Skill Analysis · Required Skills vs. Your Profile'}
            </p>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
              {isEmployer
                ? subModule === 'scoring-ranking'
                  ? 'Compatibility Scoring & Candidate Ranking'
                  : 'Candidate Skill Match Check'
                : 'Skill Match & Gap Analysis'}
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {isEmployer
                ? 'Compare candidate qualifications against your required vacancy skills and adjust scoring weights to rank the top applicants.'
                : 'Select any open job to check which required skills you already hold, identify missing skills, and update your profile.'}
            </p>
          </div>
        </div>

        {/* Sub-view Switcher (Employer only) + Vacancy Selector */}
        <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {isEmployer ? (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start">
              <button
                id="btn-module-skill-matching"
                onClick={() => setSubModule('skill-matching')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  subModule === 'skill-matching'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                Candidate Skill Match
              </button>

              <button
                id="btn-module-scoring-ranking"
                onClick={() => setSubModule('scoring-ranking')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  subModule === 'scoring-ranking'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-800" />
                Compatibility Scoring & Ranking
              </button>
            </div>
          ) : (
            <div className="text-xs font-medium text-stone-600">
              Checking skills for <span className="font-bold text-stone-900">{activeWorker.name}</span> ({activeWorker.trade})
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-stone-500 uppercase">
                Target Vacancy:
              </span>
              <select
                value={selectedJob?.id || ''}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer max-w-xs"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.trade})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODULE 5: SKILL REQUIRED MATCHING MODULE                          */}
      {/* ================================================================= */}
      {subModule === 'skill-matching' && selectedJob && selectedWorker && skillAnalysis && currentCompat && (
        <div className="space-y-6">
          {/* Worker Picker Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200"
              />
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500">
                  {isEmployer ? 'Select Candidate to Check' : 'Your Active Profile'}
                </span>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {isEmployer ? (
                    <select
                      value={selectedWorker.id}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-bold text-stone-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {w.trade} ({w.skills.length} skills)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-stone-900">
                      {selectedWorker.name} — {selectedWorker.trade} ({selectedWorker.skills.length} skills)
                    </span>
                  )}
                  <span className="text-xs font-mono text-stone-500">
                    {selectedWorker.experienceYears}y exp · {selectedWorker.location.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">
                  Required Skill Coverage
                </span>
                <span className="text-2xl font-black font-mono text-emerald-800">
                  {skillAnalysis.requiredCoveragePct}%
                </span>
              </div>
              <div className="w-px h-10 bg-stone-200" />
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">
                  Overall Skill Fit
                </span>
                <span className="text-2xl font-black font-mono text-stone-900">
                  {skillAnalysis.overallSkillFitPct}%
                </span>
              </div>
            </div>
          </div>

          {/* 3-Column Skill Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Mandatory / Required Skills */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Required Skills Matrix</h3>
                  <p className="text-[11px] text-stone-500">
                    85% weight of Technical Skill Score
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {skillAnalysis.requiredMatched.length}/{skillAnalysis.requiredTotal} Met
                </span>
              </div>

              <div className="space-y-2">
                {selectedJob.requiredSkills.map((reqSkill) => {
                  const isMatched = skillAnalysis.requiredMatched.includes(reqSkill);
                  return (
                    <div
                      key={reqSkill}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono ${
                        isMatched
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-stone-100 border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-stone-500 shrink-0" />
                        )}
                        <span className="font-semibold">{reqSkill}</span>
                      </div>

                      {isMatched ? (
                        <span className="text-[10px] font-bold uppercase text-emerald-800">
                          Matched
                        </span>
                      ) : !isEmployer && onAddSkillToWorker ? (
                        <button
                          onClick={() => onAddSkillToWorker(selectedWorker.id, reqSkill)}
                          className="px-2 py-0.5 bg-white hover:bg-emerald-800 hover:text-white border border-stone-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Add this verified skill to your profile"
                        >
                          <Plus className="w-3 h-3" /> Add Skill
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-stone-500">
                          Missing
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Preferred Skills & Credential Alignment */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Preferred Skills & Credentials</h3>
                  <p className="text-[11px] text-stone-500">
                    15% bonus skill score + badge multipliers
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                  {skillAnalysis.preferredMatched.length}/{skillAnalysis.preferredTotal} Bonus
                </span>
              </div>

              <div className="space-y-2">
                {selectedJob.preferredSkills.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No optional preferred skills listed.</p>
                ) : (
                  selectedJob.preferredSkills.map((prefSkill) => {
                    const isMatched = skillAnalysis.preferredMatched.includes(prefSkill);
                    return (
                      <div
                        key={prefSkill}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                          isMatched
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        <span className="font-medium">{prefSkill}</span>
                        <span className="text-[10px] font-bold uppercase">
                          {isMatched ? '✓ Bonus Met' : 'Optional'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Credential & Trade Alignment Checks */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <h4 className="text-[11px] font-mono uppercase font-bold text-stone-500">
                  Board Accreditation & Trade Verification
                </h4>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-700">Primary Trade Alignment ({selectedJob.trade})</span>
                  <span className={`font-bold ${skillAnalysis.hasTradeMatch ? 'text-emerald-800' : 'text-stone-500'}`}>
                    {skillAnalysis.hasTradeMatch ? '✓ Exact Trade' : 'Cross-Trade'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-700">Direct Trade Verified Badge</span>
                  <span className={`font-bold ${skillAnalysis.hasDirectTradeBadge ? 'text-emerald-800' : 'text-stone-500'}`}>
                    {skillAnalysis.hasDirectTradeBadge ? '✓ Verified License' : 'Not Held'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-700">Safety / OSHA Compliance Badge</span>
                  <span className={`font-bold ${skillAnalysis.hasSafetyBadge ? 'text-emerald-800' : 'text-stone-500'}`}>
                    {skillAnalysis.hasSafetyBadge ? '✓ OSHA Compliant' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Skill Gap Remediation & Action Summary */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">How to Improve Match Score</h3>
                    <p className="text-[11px] text-stone-500">
                      Simple steps to reach a higher compatibility score
                    </p>
                  </div>
                  <Award className="w-4 h-4 text-emerald-800" />
                </div>

                {skillAnalysis.upskillSuggestions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-800" />
                      100% Skill & Credential Readiness
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      {selectedWorker.name} meets every required and preferred competency for "{selectedJob.title}" and holds active trade/safety credentials.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {skillAnalysis.upskillSuggestions.map((tip, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resulting Compatibility Card */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-600">Resulting Compatibility:</span>
                  <span className="text-lg font-black text-emerald-800">
                    {currentCompat.totalScore}% ({currentCompat.recommendationTier})
                  </span>
                </div>
                {isEmployer ? (
                  <button
                    onClick={() => onHireWorker(selectedWorker, selectedJob)}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve & Deploy {selectedWorker.name}
                  </button>
                ) : (
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Add any missing skills above to boost your compatibility score before applying from Job Recommendations.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPATIBILITY SCORING & RANKING (EMPLOYER ONLY) */}
      {isEmployer && subModule === 'scoring-ranking' && selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Live Weight & Multiplier Controls */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-5 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-800" />
                  Scoring Criteria Weights
                </h2>
                <p className="text-[11px] text-stone-500">
                  Adjust algorithm coefficients in real time
                </p>
              </div>
              <button
                onClick={() => onUpdateWeights(DEFAULT_WEIGHTS)}
                className="text-[11px] font-mono font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'skillsWeight', label: 'Technical Skills Overlap' },
                { key: 'experienceWeight', label: 'Field Experience Tenure' },
                { key: 'geographicalWeight', label: 'Geo Proximity (Haversine km)' },
                { key: 'availabilityWeight', label: 'Shift & Immediate Availability' },
                { key: 'compensationWeight', label: 'Daily Rate Parity' },
              ].map((item) => {
                const k = item.key as keyof MatchingWeights;
                const valPct = Math.round(weights[k] * 100);
                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-700 font-medium">{item.label}</span>
                      <span className="font-bold text-emerald-800">{valPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.7"
                      step="0.05"
                      value={weights[k]}
                      onChange={(e) =>
                        onUpdateWeights({
                          ...weights,
                          [k]: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-800 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-600">Total Weight Sum:</span>
                <span className="font-bold text-stone-900">{totalWeightPct}% (auto-normalized)</span>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Verified Badge Tier Multiplier
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800">
                    Boosts certified profiles up to 1.30x
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={applyMultiplier}
                  onChange={(e) => setApplyMultiplier(e.target.checked)}
                  className="w-4 h-4 accent-emerald-800 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Right Panel: Live Candidate Compatibility Leaderboard */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Ranked Compatibility Leaderboard — {selectedJob.title}
                </h2>
                <p className="text-xs text-stone-500">
                  {selectedJob.companyName} · {selectedJob.location.city} · Target ₹{selectedJob.payRate}/{selectedJob.payType}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-semibold text-stone-800 cursor-pointer"
                >
                  <option value="totalScore">Rank by Final Compatibility</option>
                  <option value="skillScore">Rank by Skill Match %</option>
                  <option value="distance">Rank by Nearest Distance</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {rankedCandidates.map(({ worker, score, skills }, idx) => (
                <div
                  key={worker.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    idx === 0
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                      : 'bg-stone-50/50 border-stone-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 text-white font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900">{worker.name}</span>
                        <span className="text-[10px] font-mono bg-stone-100 border border-stone-200 px-2 py-0.5 rounded font-semibold text-stone-700">
                          {worker.trade}
                        </span>
                        {score.verifiedBadgesCount ? (
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {score.verifiedBadgesCount} Verified ({score.verifiedBadgeMultiplier}x)
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {score.distanceKm} km
                        </span>
                        <span>Skills: {skills.requiredMatched.length}/{skills.requiredTotal} req</span>
                        <span>Exp: {worker.experienceYears}y</span>
                        <span>₹{worker.dailyRate}/day</span>
                      </div>

                      {/* Mini 5-bar breakdown */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1 max-w-md">
                        {[
                          { label: 'SKL', val: score.breakdown.skillMatchScore },
                          { label: 'EXP', val: score.breakdown.experienceScore },
                          { label: 'GEO', val: score.breakdown.geographicalScore },
                          { label: 'SHF', val: score.breakdown.availabilityScore },
                          { label: 'PAY', val: score.breakdown.compensationScore },
                        ].map((b) => (
                          <div key={b.label} className="bg-white border border-stone-200 rounded px-1.5 py-0.5 text-center font-mono text-[10px]">
                            <span className="text-stone-400 block text-[9px]">{b.label}</span>
                            <span className="font-bold text-stone-800">{b.val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Score Summary */}
                  <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-200">
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-stone-500">
                        Base {score.baseScore}% {applyMultiplier && score.verifiedBadgeMultiplier && score.verifiedBadgeMultiplier > 1 ? `× ${score.verifiedBadgeMultiplier}` : ''}
                      </div>
                      <div className={`text-2xl font-black ${score.totalScore >= 80 ? 'text-emerald-800' : 'text-stone-800'}`}>
                        {score.totalScore}%
                      </div>
                      <div className="text-[10px] font-bold text-emerald-800">
                        {score.recommendationTier}
                      </div>
                    </div>

                    <button
                      onClick={() => onHireWorker(worker, selectedJob)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      Hire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
