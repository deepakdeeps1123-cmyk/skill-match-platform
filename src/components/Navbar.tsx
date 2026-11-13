import React from 'react';
import {
  HardHat,
  Building2,
  Bell,
  ShieldCheck,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { AuthUser } from '../types';

export type AppTab =
  | 'worker-jobs'
  | 'worker-skills'
  | 'worker-competition'
  | 'worker-applications'
  | 'worker-tasks'
  | 'worker-account'
  | 'employer-vacancies'
  | 'employer-skill-match'
  | 'employer-ranking'
  | 'employer-tasks'
  | 'employer-analytics'
  | 'employer-account';

const SECTION_TITLES: Record<AppTab, string> = {
  'worker-jobs': 'Job Recommendations',
  'worker-skills': 'Skill Match & Gaps',
  'worker-competition': 'Competency & Badges',
  'worker-applications': 'My Applications',
  'worker-tasks': 'My Work Tasks',
  'worker-account': 'Profile & Account',
  'employer-vacancies': 'Vacancies & Hired Team',
  'employer-skill-match': 'Candidate Skill Match',
  'employer-ranking': 'Compatibility Scoring & Ranking',
  'employer-tasks': 'Workforce Tasks',
  'employer-analytics': 'Hiring Analytics',
  'employer-account': 'Company Account',
};

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  unreadCount,
  currentUser,
  onLogout,
  onOpenMobileSidebar,
}) => {
  const isEmployer = currentUser.role === 'employer';
  const defaultHomeTab: AppTab = isEmployer ? 'employer-vacancies' : 'worker-jobs';
  const accountTab: AppTab = isEmployer ? 'employer-account' : 'worker-account';

  const mobileTabs: { id: AppTab; label: string }[] = isEmployer
    ? [
        { id: 'employer-vacancies', label: 'Vacancies & Team' },
        { id: 'employer-skill-match', label: 'Skill Match' },
        { id: 'employer-ranking', label: 'Score & Rank' },
        { id: 'employer-tasks', label: 'Tasks' },
        { id: 'employer-analytics', label: 'Analytics' },
      ]
    : [
        { id: 'worker-jobs', label: 'Recommended Jobs' },
        { id: 'worker-skills', label: 'Skill Match' },
        { id: 'worker-competition', label: 'Competition & Badges' },
        { id: 'worker-applications', label: 'Applications' },
        { id: 'worker-tasks', label: 'My Tasks' },
      ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-800">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Zone: Mobile Menu + Brand + Role Portal Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setActiveTab(defaultHomeTab)}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              {isEmployer ? (
                <Building2 className="w-4 h-4 text-emerald-100" />
              ) : (
                <HardHat className="w-4 h-4 text-emerald-100" />
              )}
            </div>
            <span className="font-bold text-base tracking-tight text-stone-900 whitespace-nowrap">
              SkillMatch
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 min-w-0 pl-2 border-l border-stone-200">
            <button
              onClick={() => setActiveTab(defaultHomeTab)}
              className="hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap font-medium text-emerald-800"
            >
              {isEmployer ? 'Employer Portal' : 'Worker Portal'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="font-semibold text-stone-900 truncate">
              {SECTION_TITLES[activeTab]}
            </span>
          </div>
        </div>

        {/* Right Zone: Notifications + Signed-in Account + Sign Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-open-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-800 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-account"
            onClick={() => setActiveTab(accountTab)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === accountTab
                ? 'bg-emerald-800 text-white border-emerald-900'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <ShieldCheck
              className={`w-4 h-4 shrink-0 ${
                activeTab === accountTab ? 'text-emerald-100' : 'text-emerald-800'
              }`}
            />
            <span className="hidden sm:inline truncate max-w-[140px]">
              {isEmployer ? currentUser.companyName || currentUser.name : currentUser.name}
            </span>
            <span className="sm:hidden">Account</span>
          </button>

          <button
            id="btn-signout"
            onClick={onLogout}
            title="Sign Out"
            aria-label="Sign out"
            className="px-2.5 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Quick Navigation Strip (Role-Isolated) */}
      <div className="lg:hidden border-t border-stone-200 px-3 py-1.5 flex overflow-x-auto gap-1.5 text-xs bg-stone-50">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
