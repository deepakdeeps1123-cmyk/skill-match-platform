import React from 'react';
import {
  Trophy,
  Briefcase,
  CheckCircle2,
  Sliders,
  Sparkles,
  Kanban,
  BarChart3,
  FileText,
  UserCircle2,
  Building2,
  X,
} from 'lucide-react';
import { AppTab } from './Navbar';
import { AuthUser, WorkerProfile } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeWorker: WorkerProfile;
  currentUser: AuthUser;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  groupLabel: string;
  items: {
    id: AppTab;
    label: string;
    helper: string;
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeWorker,
  currentUser,
  mobileOpen,
  onCloseMobile,
}) => {
  const isEmployer = currentUser.role === 'employer';

  const workerNavGroups: NavGroup[] = [
    {
      groupLabel: 'Jobs & Matching',
      items: [
        {
          id: 'worker-jobs',
          label: 'Job Recommendations',
          helper: 'Best-fit open roles',
          icon: <Sparkles className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'worker-skills',
          label: 'Skill Match & Gaps',
          helper: 'Required vs your skills',
          icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'worker-applications',
          label: 'My Applications',
          helper: 'Track hiring status',
          icon: <FileText className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupLabel: 'Profile & Work',
      items: [
        {
          id: 'worker-competition',
          label: 'Competition & Badges',
          helper: 'Peer rank & certifications',
          icon: <Trophy className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'worker-tasks',
          label: 'My Work Tasks',
          helper: 'Assigned checklists',
          icon: <Kanban className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'worker-account',
          label: 'Profile & Account',
          helper: 'Account details',
          icon: <UserCircle2 className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const employerNavGroups: NavGroup[] = [
    {
      groupLabel: 'Hiring & Candidates',
      items: [
        {
          id: 'employer-vacancies',
          label: 'Vacancies & Hired Team',
          helper: 'Post jobs & manage staff',
          icon: <Briefcase className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'employer-skill-match',
          label: 'Candidate Skill Match',
          helper: 'Required vs candidate skills',
          icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'employer-ranking',
          label: 'Scoring & Ranking',
          helper: 'Weight criteria & shortlist',
          icon: <Sliders className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupLabel: 'Operations & Account',
      items: [
        {
          id: 'employer-tasks',
          label: 'Workforce Tasks',
          helper: 'Assign & track site work',
          icon: <Kanban className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'employer-analytics',
          label: 'Hiring Analytics',
          helper: 'Trade & pay metrics',
          icon: <BarChart3 className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'employer-account',
          label: 'Company Account',
          helper: 'Organization details',
          icon: <Building2 className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const navGroups = isEmployer ? employerNavGroups : workerNavGroups;

  const renderSidebarBody = () => (
    <div className="flex flex-col h-full bg-white border-r border-stone-200">
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navGroups.map((group) => (
          <div key={group.groupLabel} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              {group.groupLabel}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span
                      className={`mt-0.5 ${
                        isActive ? 'text-emerald-100' : 'text-stone-500'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-xs truncate ${
                          isActive ? 'font-bold text-white' : 'font-semibold text-stone-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`block text-[11px] truncate ${
                          isActive ? 'text-emerald-100/90' : 'text-stone-500'
                        }`}
                      >
                        {item.helper}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Role-Locked Account Card */}
      <div className="p-3.5 border-t border-stone-200 bg-stone-50 text-xs space-y-1">
        {isEmployer ? (
          <>
            <p className="text-[11px] text-emerald-800 font-semibold">Employer Account</p>
            <p className="font-bold text-stone-900 truncate">
              {currentUser.companyName || currentUser.name}
            </p>
            <p className="text-[11px] text-stone-600 truncate">
              {currentUser.name} · {currentUser.email}
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] text-emerald-800 font-semibold">Worker Account</p>
            <p className="font-bold text-stone-900 truncate">{activeWorker.name}</p>
            <p className="text-[11px] text-stone-600 truncate">
              {activeWorker.trade} · ₹{activeWorker.dailyRate}/day
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">{renderSidebarBody()}</div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-stone-900/40 backdrop-blur-xs flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-stone-200 flex items-center justify-between">
              <span className="font-bold text-sm text-stone-900">
                {isEmployer ? 'Employer Menu' : 'Worker Menu'}
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{renderSidebarBody()}</div>
          </div>
        </div>
      )}
    </>
  );
};
