import React from 'react';
import {
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Briefcase,
  ArrowRight,
  MapPin,
  Award,
  Users,
  Trophy,
} from 'lucide-react';
import { JobVacancy, WorkerProfile } from '../types';
import { computeCompatibilityScore, DEFAULT_WEIGHTS } from '../services/matchingEngine';

interface PublicWebpageProps {
  onOpenLogin: () => void;
  onOpenSignup: (defaultRole?: 'worker' | 'employer') => void;
  jobs: JobVacancy[];
  workers: WorkerProfile[];
}

export const PublicWebpage: React.FC<PublicWebpageProps> = ({
  onOpenLogin,
  onOpenSignup,
  jobs,
  workers,
}) => {
  const sampleWorker = workers[0];
  const sampleJob = jobs[0];
  const sampleMatch =
    sampleWorker && sampleJob
      ? computeCompatibilityScore(sampleWorker, sampleJob, DEFAULT_WEIGHTS, true)
      : null;

  const openJobs = jobs.filter((j) => j.status === 'open').slice(0, 3);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-800 selection:text-white">
      {/* Zone-disciplined Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 text-stone-900 whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <HardHat className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillMatch</span>
          </a>

          {/* Zone 2: Clean Text Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => scrollToSection('platform-features')}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Platform
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How Matching Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('open-jobs')}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Roles
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('verified-badges')}
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Verified Badges
            </button>
          </nav>

          {/* Zone 3: Sign In & Registration Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-webpage-signin"
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              id="btn-webpage-signup"
              onClick={() => onOpenSignup('worker')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Copy */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <p className="text-xs font-semibold text-emerald-800">
                  Skill-Based Workforce & Freelance Matching Platform
                </p>
                <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight text-balance">
                  Connect verified skilled workers with the right jobs automatically
                </h1>
                <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                  SkillMatch evaluates real trade competencies, industry safety certifications, proximity, shift fit, and pay alignment so qualified workers stand out and employers hire with confidence.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenLogin()}
                    className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenSignup('worker')}
                    className="px-5 py-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Register New Account
                  </button>
                </div>
              </div>

              {/* Grounded Platform Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200 max-w-lg">
                <div>
                  <p className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                    {workers.length}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">Skilled Profiles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
                    {jobs.length}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">Active Vacancies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
                    5-Factor
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">Scoring Engine</p>
                </div>
              </div>
            </div>

            {/* Right Live Match Preview Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500">Live Match Preview</p>
                    <h2 className="text-base font-bold text-stone-900 mt-0.5">
                      {sampleJob?.title || 'Industrial Electrician'}
                    </h2>
                  </div>
                  {sampleMatch && (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
                        {sampleMatch.totalScore}%
                      </span>
                      <p className="text-[11px] text-stone-500">Compatibility</p>
                    </div>
                  )}
                </div>

                {sampleWorker && sampleMatch && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{sampleWorker.name}</p>
                        <p className="text-stone-500">
                          {sampleWorker.trade} · {sampleWorker.experienceYears} yrs exp · {sampleWorker.location.city}
                        </p>
                      </div>
                      <span className="text-emerald-800 font-semibold font-mono tabular-nums">
                        {sampleMatch.verifiedBadgeMultiplier}x Badge Boost
                      </span>
                    </div>

                    {/* 5 Criteria Breakdown Bars */}
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Required Skills', score: sampleMatch.breakdown.skillMatchScore },
                        { label: 'Work Experience', score: sampleMatch.breakdown.experienceScore },
                        { label: 'Site Proximity', score: sampleMatch.breakdown.geographicalScore },
                        { label: 'Shift Alignment', score: sampleMatch.breakdown.availabilityScore },
                        { label: 'Pay Parity', score: sampleMatch.breakdown.compensationScore },
                      ].map((row) => (
                        <div key={row.label} className="space-y-1">
                          <div className="flex justify-between text-stone-700">
                            <span>{row.label}</span>
                            <span className="font-mono font-semibold tabular-nums">
                              {row.score}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-800 rounded-full"
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  {sampleWorker?.verifiedBadges?.length || 0} verified licenses active
                </span>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Try interactive scoring →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Capabilities Section */}
        <section
          id="platform-features"
          className="bg-white border-y border-stone-200 py-14"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-emerald-800">
                Complete Platform Architecture
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Everything needed for skill-based hiring and work discovery
              </h2>
              <p className="text-sm text-stone-600">
                Seven focused modules cover worker onboarding, credential verification, peer benchmarking, employer management, and transparent job matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Users className="w-5 h-5 text-emerald-800" />,
                  title: 'Role-Based Accounts & Auth',
                  desc: 'Dedicated sign-up and login flows for Skilled Workers and Employers with persistent profile data.',
                },
                {
                  icon: <Trophy className="w-5 h-5 text-emerald-800" />,
                  title: 'Worker Competition Profile',
                  desc: 'Benchmark your pay rate, experience, and badge count against other specialists in your trade.',
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-emerald-800" />,
                  title: 'Required Skill Gap Check',
                  desc: 'Compare worker profiles against vacancy skill checklists and close gaps with one-click skill updates.',
                },
                {
                  icon: <Sliders className="w-5 h-5 text-emerald-800" />,
                  title: 'Weighted Scoring & Ranking',
                  desc: 'Customize weights for skills, distance, experience, shift, and pay to rank applicants fairly.',
                },
                {
                  icon: <Briefcase className="w-5 h-5 text-emerald-800" />,
                  title: 'Vacancy & Roster Control',
                  desc: 'Post, edit, or close job openings, review applicants, and deploy hired workers to site tasks.',
                },
                {
                  icon: <Award className="w-5 h-5 text-emerald-800" />,
                  title: 'Explainable Job Feeds',
                  desc: 'Personalized recommendations that explain exactly why each job fits, with distance filters and saved lists.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5"
                >
                  {item.icon}
                  <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Matching Works + Verified Badges */}
        <section
          id="how-it-works"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-emerald-800">Step 01</p>
              <h3 className="text-lg font-bold text-stone-900">Build a Verified Profile</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Workers list their trade, skills, location radius, and expected daily pay, and submit trade or OSHA safety licenses for review.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-emerald-800">Step 02</p>
              <h3 className="text-lg font-bold text-stone-900">Evaluate Skill & Score Fit</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every vacancy is scored against worker attributes across 5 transparent criteria, with tiered multipliers rewarding verified certifications.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-emerald-800">Step 03</p>
              <h3 className="text-lg font-bold text-stone-900">Apply, Hire & Track Tasks</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Workers apply directly to top recommendations, and employers hire ranked candidates into active site task checklists.
              </p>
            </div>
          </div>

          {/* Verified Badges Highlight */}
          <div
            id="verified-badges"
            className="bg-emerald-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Accredited Competency Recognition</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Verified Badges give certified workers higher visibility
              </h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Validated credentials such as Grade A Electrical Licenses, AWS D1.1 Welding, or OSHA-30 Safety apply tiered score multipliers (up to 1.30x) so qualified specialists rank at the top.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenSignup('worker')}
              className="px-5 py-3 bg-white text-emerald-900 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            >
              Register as a Worker
            </button>
          </div>
        </section>

        {/* Live Open Vacancies Preview */}
        <section
          id="open-jobs"
          className="bg-white border-t border-stone-200 py-14"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-emerald-800">Live Marketplace Preview</p>
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
                  Recent Open Vacancies
                </h2>
              </div>
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Sign in to see your personalized match %</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {openJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-stone-500">
                      {job.companyName} · {job.trade}
                    </p>
                    <h3 className="text-base font-bold text-stone-900">{job.title}</h3>
                    <p className="text-xs text-stone-600 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location.city}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 tabular-nums">
                      ₹{job.payRate}/{job.payType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-8 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <HardHat className="w-4 h-4 text-emerald-800" />
            <span>SkillMatch Platform</span>
            <span className="text-stone-400 font-normal">· © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenLogin}
              className="hover:text-stone-900 cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenSignup('worker')}
              className="hover:text-stone-900 cursor-pointer"
            >
              Worker Sign Up
            </button>
            <button
              type="button"
              onClick={() => onOpenSignup('employer')}
              className="hover:text-stone-900 cursor-pointer"
            >
              Employer Sign Up
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
