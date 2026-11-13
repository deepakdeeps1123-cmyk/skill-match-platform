import React, { useState, useEffect } from 'react';
import {
  WorkerProfile,
  JobVacancy,
  JobApplication,
  ProjectTask,
  SystemNotification,
  MatchingWeights,
  TaskStatus,
  AuthUser,
  EmployerProfile,
} from './types';
import {
  INITIAL_WORKERS,
  INITIAL_JOBS,
  INITIAL_TASKS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { DEFAULT_WEIGHTS, computeCompatibilityScore } from './services/matchingEngine';
import {
  getCurrentSessionUser,
  setCurrentSessionUser,
  getEmployersList,
} from './services/authService';
import { Navbar, AppTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WorkerPortal } from './components/WorkerPortal';
import { MatchingAndRankingHub } from './components/MatchingAndRankingHub';
import { EmployerPortal } from './components/EmployerPortal';
import { ProjectTaskBoard } from './components/ProjectTaskBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AccountSettingsView } from './components/AccountSettingsView';
import { LoginPage } from './components/LoginPage';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CheckCircle2 } from 'lucide-react';

const WORKER_TABS: AppTab[] = [
  'worker-jobs',
  'worker-skills',
  'worker-competition',
  'worker-applications',
  'worker-tasks',
  'worker-account',
];

const EMPLOYER_TABS: AppTab[] = [
  'employer-vacancies',
  'employer-skill-match',
  'employer-ranking',
  'employer-tasks',
  'employer-analytics',
  'employer-account',
];

const WORKERS_STORAGE_KEY = 'skillmatch_workers_v1';
const JOBS_STORAGE_KEY = 'skillmatch_jobs_v1';

function loadInitialWorkers(): WorkerProfile[] {
  try {
    const raw = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkerProfile[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_WORKERS;
}

function loadInitialJobs(): JobVacancy[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as JobVacancy[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_JOBS;
}

function normalizeTabForRole(tab: AppTab, role: 'worker' | 'employer'): AppTab {
  if (role === 'employer') {
    return EMPLOYER_TABS.includes(tab) ? tab : 'employer-vacancies';
  }
  return WORKER_TABS.includes(tab) ? tab : 'worker-jobs';
}

export default function App() {
  const [workers, setWorkers] = useState<WorkerProfile[]>(loadInitialWorkers);
  const [jobs, setJobs] = useState<JobVacancy[]>(loadInitialJobs);
  const [employers, setEmployers] = useState<EmployerProfile[]>(() => getEmployersList());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const session = getCurrentSessionUser();
    if (session && (session.role === 'worker' || session.role === 'employer')) {
      return session;
    }
    return null;
  });

  const [activeWorker, setActiveWorker] = useState<WorkerProfile>(() => {
    const initialWorkers = loadInitialWorkers();
    const session = getCurrentSessionUser();
    if (session?.role === 'worker' && session.linkedWorkerId) {
      const matched = initialWorkers.find((w) => w.id === session.linkedWorkerId);
      if (matched) return matched;
    }
    return initialWorkers[0];
  });

  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);
  const [activeTab, setActiveTabState] = useState<AppTab>(() => {
    const session = getCurrentSessionUser();
    return session?.role === 'employer' ? 'employer-vacancies' : 'worker-jobs';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedTaskWorkerFilter, setSelectedTaskWorkerFilter] = useState<string | undefined>(
    undefined
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const navigateTo = (tab: AppTab) => {
    if (!currentUser) return;
    const role = currentUser.role === 'employer' ? 'employer' : 'worker';
    setActiveTabState(normalizeTabForRole(tab, role));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(workers));
    } catch {
      // ignore storage quota
    }
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // ignore storage quota
    }
  }, [jobs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const triggerNotification = (
    title: string,
    message: string,
    type: SystemNotification['type'],
    linkTab?: SystemNotification['linkTab']
  ) => {
    const newNotif: SystemNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      linkTab,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAuthSuccess = (
    user: AuthUser,
    newWorker?: WorkerProfile,
    newEmployer?: EmployerProfile
  ) => {
    setCurrentUser(user);
    setCurrentSessionUser(user);

    if (newWorker) {
      setWorkers((prev) => [newWorker, ...prev]);
      setActiveWorker(newWorker);
      setActiveTabState('worker-jobs');
      triggerNotification(
        'Welcome to SkillMatch',
        `${newWorker.name} (${newWorker.trade}) registered and ready for job matching.`,
        'alert',
        'worker'
      );
      showToast(`Signed in to Worker Portal as ${newWorker.name}.`);
    } else if (newEmployer) {
      setEmployers((prev) => [newEmployer, ...prev]);
      setActiveTabState('employer-vacancies');
      triggerNotification(
        'Employer Account Active',
        `${newEmployer.companyName} ready to publish vacancies and rank candidates.`,
        'alert',
        'employer'
      );
      showToast(`Signed in to Employer Portal for ${newEmployer.companyName}.`);
    } else if (user.role === 'employer') {
      setActiveTabState('employer-vacancies');
      showToast(`Signed in to Employer Portal (${user.companyName || user.name}).`);
    } else {
      if (user.linkedWorkerId) {
        const matched = workers.find((w) => w.id === user.linkedWorkerId);
        if (matched) setActiveWorker(matched);
      }
      setActiveTabState('worker-jobs');
      showToast(`Signed in to Worker Portal (${user.name}).`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSessionUser(null);
    setSelectedTaskWorkerFilter(undefined);
    showToast('Signed out of active session.');
  };

  const handleUpdateWorker = (updated: WorkerProfile) => {
    setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    if (activeWorker.id === updated.id) {
      setActiveWorker(updated);
    }
    showToast(`Profile updated for ${updated.name}. Matching scores recalculated.`);
    triggerNotification(
      'Worker Profile Updated',
      `${updated.name} updated trade skills. Compatibility scores refreshed across ${jobs.length} vacancies.`,
      'alert',
      'matching'
    );
  };

  const handleAddSkillToWorker = (workerId: string, skill: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    if (target.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      showToast(`${target.name} already has "${skill}".`);
      return;
    }
    const updated: WorkerProfile = {
      ...target,
      skills: [...target.skills, skill],
    };
    handleUpdateWorker(updated);
  };

  const handleApplyJob = (job: JobVacancy, note: string) => {
    const score = computeCompatibilityScore(activeWorker, job, weights);
    const newApp: JobApplication = {
      id: 'app-' + Date.now(),
      jobId: job.id,
      workerId: activeWorker.id,
      jobTitle: job.title,
      companyName: job.companyName,
      workerName: activeWorker.name,
      workerTrade: activeWorker.trade,
      appliedDate: '2026-09-21',
      status: 'applied',
      compatibilityScore: score,
      coverNote: note,
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(`Application submitted for "${job.title}".`);

    triggerNotification(
      'Job Application Submitted',
      `${activeWorker.name} applied for "${job.title}" at ${job.companyName} (${score.totalScore}% compatibility score).`,
      'application_update',
      'employer'
    );
  };

  const handleAddJob = (newJobData: Omit<JobVacancy, 'id' | 'postedDate' | 'filledCount'>) => {
    const newJob: JobVacancy = {
      ...newJobData,
      id: 'job-' + Date.now(),
      postedDate: '2026-09-21',
      filledCount: 0,
    };

    setJobs((prev) => [newJob, ...prev]);
    showToast(`New vacancy "${newJob.title}" published.`);

    triggerNotification(
      'New Vacancy Published',
      `${newJob.companyName} posted "${newJob.title}" looking for ${newJob.trade} specialists.`,
      'job_match',
      'worker'
    );
  };

  const handleUpdateJob = (updatedJob: JobVacancy) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`Vacancy "${updatedJob.title}" updated.`);
    triggerNotification(
      'Vacancy Record Updated',
      `${updatedJob.companyName} updated "${updatedJob.title}".`,
      'alert',
      'matching'
    );
  };

  const handleDeleteJob = (jobId: string) => {
    const removed = jobs.find((j) => j.id === jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (removed) {
      showToast(`Vacancy "${removed.title}" deleted.`);
    }
  };

  const handleUpdateApplicationStatus = (appId: string, status: JobApplication['status']) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status } : app))
    );
    const app = applications.find((a) => a.id === appId);
    if (app) {
      showToast(`Application for ${app.workerName} updated to ${status.toUpperCase()}.`);
      triggerNotification(
        'Application Status Changed',
        `${app.companyName} updated ${app.workerName}'s application for "${app.jobTitle}" to ${status.toUpperCase()}.`,
        'application_update',
        'worker'
      );
    }
  };

  const handleHireWorker = (worker: WorkerProfile, job: JobVacancy) => {
    const existingApp = applications.find(
      (a) => a.jobId === job.id && a.workerId === worker.id
    );

    const assignedTaskId = 'task-hire-' + Date.now();

    if (existingApp) {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === existingApp.id
            ? { ...a, status: 'hired', hiredDate: '2026-09-21', assignedTaskId }
            : a
        )
      );
    } else {
      const score = computeCompatibilityScore(worker, job, weights);
      const newApp: JobApplication = {
        id: 'app-' + Date.now(),
        jobId: job.id,
        workerId: worker.id,
        jobTitle: job.title,
        companyName: job.companyName,
        workerName: worker.name,
        workerTrade: worker.trade,
        appliedDate: '2026-09-21',
        status: 'hired',
        compatibilityScore: score,
        hiredDate: '2026-09-21',
        assignedTaskId,
      };
      setApplications((prev) => [newApp, ...prev]);
    }

    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id ? { ...j, filledCount: Math.min(j.openings, j.filledCount + 1) } : j
      )
    );

    const newTask: ProjectTask = {
      id: assignedTaskId,
      projectId: job.id,
      projectName: job.projectName,
      title: `${job.trade} Package: Site Mobilization for ${job.title}`,
      description: `Report to ${job.location.siteAddress} for site induction, receive PPE, and start ${job.trade} work.`,
      trade: job.trade,
      status: 'in_progress',
      priority: 'urgent',
      assignedWorkerId: worker.id,
      assignedWorkerName: worker.name,
      assignedWorkerAvatar: worker.avatar,
      dueDate: '2026-09-24',
      estimatedHours: 16,
      loggedHours: 2,
      checklists: [
        { id: 'c-ind-1', title: 'Site safety induction and pass issuance', completed: true },
        { id: 'c-ind-2', title: 'Verify tooling calibration and personal PPE', completed: false },
        { id: 'c-ind-3', title: 'Begin Phase 1 field engineering tasks', completed: false },
      ],
      location: job.location.siteAddress,
      safetyRequirement: 'Zero-tolerance PPE compliance, safety briefing mandatory',
      lastUpdated: 'Just now',
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Hired ${worker.name}. Added to Employee Roster & site tasks.`);

    triggerNotification(
      'Worker Hired & Assigned',
      `${worker.name} was hired for "${job.title}" and added to the Employee Roster.`,
      'task_assignment',
      'tasks'
    );
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, lastUpdated: 'Just now' } : t))
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      showToast(`Task "${task.title}" moved to ${newStatus.replace('_', ' ').toUpperCase()}.`);
      if (newStatus === 'review') {
        triggerNotification(
          'Task Awaiting Safety Inspection',
          `${task.assignedWorkerName || 'Worker'} completed milestones on "${task.title}".`,
          'alert',
          'tasks'
        );
      } else if (newStatus === 'completed') {
        triggerNotification(
          'Task Completed & Verified',
          `"${task.title}" has been verified completed.`,
          'milestone',
          'tasks'
        );
      }
    }
  };

  const handleToggleChecklist = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const updatedChecklists = task.checklists.map((chk) =>
          chk.id === checklistId ? { ...chk, completed: !chk.completed } : chk
        );
        const newlyCompleted = updatedChecklists.filter((c) => c.completed).length;
        const total = updatedChecklists.length;
        return {
          ...task,
          checklists: updatedChecklists,
          loggedHours: Math.min(task.estimatedHours, task.loggedHours + 1),
          status:
            newlyCompleted === total
              ? 'review'
              : task.status === 'todo'
              ? 'in_progress'
              : task.status,
          lastUpdated: 'Just now',
        };
      })
    );
  };

  const handleAddTask = (newTaskData: Omit<ProjectTask, 'id' | 'lastUpdated'>) => {
    const newTask: ProjectTask = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      lastUpdated: 'Just now',
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" added to board.`);
    triggerNotification(
      'New Task Created',
      `Task "${newTask.title}" assigned to ${newTask.assignedWorkerName || 'Team'}.`,
      'task_assignment',
      'tasks'
    );
  };

  const handleSimulateLiveProgress = () => {
    const candidate = tasks.find((t) => t.status === 'in_progress' || t.status === 'todo');
    if (candidate) {
      const incompleteCheck = candidate.checklists.find((c) => !c.completed);
      if (incompleteCheck) {
        handleToggleChecklist(candidate.id, incompleteCheck.id);
        showToast(`Updated: ${candidate.assignedWorkerName} checked off "${incompleteCheck.title}".`);
      } else {
        handleUpdateTaskStatus(candidate.id, 'review');
      }
    } else {
      showToast('All active task checklists are complete.');
    }
  };

  const handleSimulateNewNotification = () => {
    const randomTrades = ['Heavy Equipment', 'Industrial Electrician', 'Master Welder'];
    const selectedT = randomTrades[Math.floor(Math.random() * randomTrades.length)];
    triggerNotification(
      `New Job Match Alert (${selectedT})`,
      `Skyline Builders posted a requirement for ${selectedT} at ₹2,800/day (96% compatibility).`,
      'job_match',
      currentUser?.role === 'employer' ? 'employer' : 'worker'
    );
    showToast('New match notification added.');
  };

  // Show dual-portal Login Page immediately when not signed in
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user, newWorker, newEmployer) => {
          handleAuthSuccess(user, newWorker, newEmployer);
        }}
      />
    );
  }

  const portalRole: 'worker' | 'employer' =
    currentUser.role === 'employer' ? 'employer' : 'worker';
  const safeTab = normalizeTabForRole(activeTab, portalRole);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleNotificationNavigate = (
    linkTab: NonNullable<SystemNotification['linkTab']>
  ) => {
    if (portalRole === 'employer') {
      if (linkTab === 'matching') navigateTo('employer-skill-match');
      else if (linkTab === 'tasks') navigateTo('employer-tasks');
      else if (linkTab === 'analytics') navigateTo('employer-analytics');
      else navigateTo('employer-vacancies');
    } else {
      if (linkTab === 'matching') navigateTo('worker-skills');
      else if (linkTab === 'tasks') navigateTo('worker-tasks');
      else navigateTo('worker-jobs');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-800 selection:text-white">
      {/* Top Bar */}
      <Navbar
        activeTab={safeTab}
        setActiveTab={navigateTo}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNotifCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Role-Isolated Sidebar + Content Shell */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={safeTab}
          onSelectTab={navigateTo}
          activeWorker={activeWorker}
          currentUser={currentUser}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* ================= WORKER PORTAL ONLY ================= */}
          {portalRole === 'worker' && (
            <>
              {(safeTab === 'worker-jobs' ||
                safeTab === 'worker-competition' ||
                safeTab === 'worker-applications') && (
                <WorkerPortal
                  worker={activeWorker}
                  allWorkers={workers}
                  onUpdateWorker={handleUpdateWorker}
                  jobs={jobs}
                  applications={applications}
                  onApplyJob={handleApplyJob}
                  onNavigateToTasks={() => navigateTo('worker-tasks')}
                  weights={weights}
                  initialTab={
                    safeTab === 'worker-competition'
                      ? 'competition'
                      : safeTab === 'worker-applications'
                      ? 'applications'
                      : 'matches'
                  }
                />
              )}

              {safeTab === 'worker-skills' && (
                <MatchingAndRankingHub
                  portalRole="worker"
                  workers={workers}
                  jobs={jobs}
                  activeWorker={activeWorker}
                  weights={weights}
                  onUpdateWeights={(newWeights) => {
                    setWeights(newWeights);
                    showToast('Scoring weights updated.');
                  }}
                  onHireWorker={handleHireWorker}
                  onAddSkillToWorker={handleAddSkillToWorker}
                  initialSubModule="skill-matching"
                />
              )}

              {safeTab === 'worker-tasks' && (
                <ProjectTaskBoard
                  portalRole="worker"
                  tasks={tasks.filter((t) => t.assignedWorkerId === activeWorker.id)}
                  workers={workers}
                  jobs={jobs}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onToggleChecklist={handleToggleChecklist}
                  onAddTask={handleAddTask}
                  onSimulateProgress={handleSimulateLiveProgress}
                  selectedWorkerFilter={activeWorker.id}
                />
              )}

              {safeTab === 'worker-account' && (
                <AccountSettingsView
                  currentUser={currentUser}
                  activeWorker={activeWorker}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}

          {/* ================= EMPLOYER PORTAL ONLY ================= */}
          {portalRole === 'employer' && (
            <>
              {safeTab === 'employer-vacancies' && (
                <EmployerPortal
                  jobs={jobs}
                  workers={workers}
                  applications={applications}
                  onAddJob={handleAddJob}
                  onUpdateJob={handleUpdateJob}
                  onDeleteJob={handleDeleteJob}
                  onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  onHireWorker={handleHireWorker}
                  onNavigateToTasks={(workerId) => {
                    setSelectedTaskWorkerFilter(workerId);
                    navigateTo('employer-tasks');
                  }}
                  weights={weights}
                  activeEmployerName={
                    currentUser.companyName || currentUser.name || employers[0]?.companyName
                  }
                  initialTab="my-vacancies"
                />
              )}

              {(safeTab === 'employer-skill-match' || safeTab === 'employer-ranking') && (
                <MatchingAndRankingHub
                  portalRole="employer"
                  workers={workers}
                  jobs={jobs}
                  activeWorker={activeWorker}
                  weights={weights}
                  onUpdateWeights={(newWeights) => {
                    setWeights(newWeights);
                    showToast('Scoring weights updated across candidate rankings.');
                  }}
                  onHireWorker={handleHireWorker}
                  initialSubModule={
                    safeTab === 'employer-ranking' ? 'scoring-ranking' : 'skill-matching'
                  }
                />
              )}

              {safeTab === 'employer-tasks' && (
                <ProjectTaskBoard
                  portalRole="employer"
                  tasks={tasks}
                  workers={workers}
                  jobs={jobs}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onToggleChecklist={handleToggleChecklist}
                  onAddTask={handleAddTask}
                  onSimulateProgress={handleSimulateLiveProgress}
                  selectedWorkerFilter={selectedTaskWorkerFilter}
                  onClearWorkerFilter={() => setSelectedTaskWorkerFilter(undefined)}
                />
              )}

              {safeTab === 'employer-analytics' && (
                <AnalyticsDashboard
                  workers={workers}
                  jobs={jobs}
                  applications={applications}
                  tasks={tasks}
                />
              )}

              {safeTab === 'employer-account' && (
                <AccountSettingsView currentUser={currentUser} onLogout={handleLogout} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          showToast('All notifications marked as read.');
        }}
        onClearNotifications={() => {
          setNotifications([]);
          showToast('Notifications cleared.');
        }}
        onSimulateNewNotification={handleSimulateNewNotification}
        onNavigateTab={(tab) => {
          handleNotificationNavigate(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-stone-900 text-xs px-4 py-3 rounded-xl shadow-lg border border-stone-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-stone-200 text-stone-500 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 SkillMatch Workforce Platform</span>
          <span className="text-emerald-800 font-medium">
            {portalRole === 'employer' ? 'Employer Portal' : 'Worker Portal'}
          </span>
        </div>
      </footer>
    </div>
  );
}
