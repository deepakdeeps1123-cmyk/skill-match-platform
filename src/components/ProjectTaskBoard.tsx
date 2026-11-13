import React, { useState } from 'react';
import { 
  ProjectTask, 
  TaskStatus, 
  TaskPriority, 
  WorkerProfile, 
  JobVacancy, 
  TradeCategory 
} from '../types';
import { 
  Kanban, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  User, 
  Search, 
  RefreshCw,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';

interface ProjectTaskBoardProps {
  tasks: ProjectTask[];
  workers: WorkerProfile[];
  jobs: JobVacancy[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onAddTask: (newTask: Omit<ProjectTask, 'id' | 'lastUpdated'>) => void;
  onSimulateProgress: () => void;
  selectedWorkerFilter?: string;
  onClearWorkerFilter?: () => void;
  portalRole?: 'worker' | 'employer';
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badgeColor: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-t-stone-400', badgeColor: 'bg-stone-100 text-stone-700 border border-stone-200' },
  { id: 'todo', label: 'To Do', color: 'border-t-emerald-600', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
  { id: 'in_progress', label: 'Active Site', color: 'border-t-stone-700', badgeColor: 'bg-stone-200 text-stone-800 border border-stone-300' },
  { id: 'review', label: 'Safety & QA Review', color: 'border-t-emerald-800', badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
  { id: 'completed', label: 'Verified Complete', color: 'border-t-emerald-900', badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
];

export const ProjectTaskBoard: React.FC<ProjectTaskBoardProps> = ({
  tasks,
  workers,
  jobs,
  onUpdateTaskStatus,
  onToggleChecklist,
  onAddTask,
  onSimulateProgress,
  selectedWorkerFilter,
  onClearWorkerFilter,
  portalRole = 'employer',
}) => {
  const isWorkerPortal = portalRole === 'worker';
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProject, setTaskProject] = useState(jobs[0]?.title || 'Metro Station Electrical Package');
  const [taskTrade, setTaskTrade] = useState<TradeCategory>('Electrical');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskAssignedWorker, setTaskAssignedWorker] = useState(workers[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-25');
  const [taskEstHours, setTaskEstHours] = useState(12);
  const [taskLocation, setTaskLocation] = useState('Switchgear Room North');
  const [taskSafety, setTaskSafety] = useState('Insulated tools, full PPE required');

  const filteredTasks = tasks.filter((t) => {
    const matchesProject = projectFilter === 'all' || t.projectName.toLowerCase().includes(projectFilter.toLowerCase());
    const matchesTrade = tradeFilter === 'all' || t.trade === tradeFilter;
    const matchesWorker = !selectedWorkerFilter || t.assignedWorkerId === selectedWorkerFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assignedWorkerName && t.assignedWorkerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesProject && matchesTrade && matchesWorker && matchesSearch;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const totalLoggedHours = tasks.reduce((sum, t) => sum + t.loggedHours, 0);
  const totalEstHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedWorkerObj = workers.find((w) => w.id === taskAssignedWorker);

    onAddTask({
      projectId: 'job-custom',
      projectName: taskProject,
      title: taskTitle,
      description: taskDesc,
      trade: taskTrade,
      status: 'todo',
      priority: taskPriority,
      assignedWorkerId: assignedWorkerObj?.id,
      assignedWorkerName: assignedWorkerObj?.name,
      assignedWorkerAvatar: assignedWorkerObj?.avatar,
      dueDate: taskDueDate,
      estimatedHours: taskEstHours,
      loggedHours: 0,
      checklists: [
        { id: `c-${Date.now()}-1`, title: 'Safety pre-task hazard inspection', completed: false },
        { id: `c-${Date.now()}-2`, title: 'Verify site tools and material clearances', completed: false },
        { id: `c-${Date.now()}-3`, title: 'Execution of primary installation/assembly', completed: false },
      ],
      location: taskLocation,
      safetyRequirement: taskSafety,
    });

    setIsAddingTask(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-300 font-bold">
                Real-Time Collaborative Task Board
              </span>
              <span className="text-stone-400 text-xs">·</span>
              <span className="text-xs font-mono text-stone-500">
                Live Field Progress & Safety Inspections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1.5">
              {isWorkerPortal ? 'My Assigned Work Tasks' : 'Project Task Execution & Workforce Management'}
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              {isWorkerPortal
                ? 'Track your assigned site milestones, complete required safety checklists, and log progress.'
                : 'Coordinate hired trade specialists, track safety checklists, and monitor site milestones.'}
            </p>
          </div>

          {!isWorkerPortal && (
            <div className="flex items-center gap-3">
              {/* Simulation trigger */}
              <button
                id="btn-simulate-progress"
                onClick={onSimulateProgress}
                className="px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-mono font-semibold border border-stone-300 transition-all flex items-center gap-2 shadow-2xs active:scale-95 cursor-pointer"
                title="Simulates real-time worker checklist completion and status transitions"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-800" />
                Simulate Live Progress
              </button>

              <button
                id="btn-add-new-task"
                onClick={() => setIsAddingTask(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Project Task
              </button>
            </div>
          )}
        </div>

        {/* Real-time Progress Bar & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-200">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Overall Project Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-stone-900">{overallProgress}%</span>
              <span className="text-xs font-mono text-stone-500">({completedTasks}/{totalTasks} tasks)</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="h-1.5 bg-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Active On-Site Tasks</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-stone-900">{inProgressTasks}</span>
              <span className="text-xs font-mono text-stone-500">In Progress</span>
            </div>
            <span className="text-[10px] font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-300 font-medium mt-2 inline-block">
              {reviewTasks} pending QA inspection
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Hours Logged vs Est</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-emerald-800">{totalLoggedHours}h</span>
              <span className="text-xs font-mono text-stone-500">/ {totalEstHours}h planned</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium mt-2 inline-block">
              Burn rate on target
            </span>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Assigned Specialists</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-stone-800">
                {new Set(tasks.map((t) => t.assignedWorkerId).filter(Boolean)).size}
              </span>
              <span className="text-xs font-mono text-stone-500">Gig Workers</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium mt-2 inline-block">
              Zero safety incidents
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks, descriptions, workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-stone-50 text-stone-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
          >
            <option value="all">All Project Packages</option>
            <option value="Metro">Metro Station Packages</option>
            <option value="IT Park">IT Park Tower B</option>
            <option value="Cargo">Cargo Logistics</option>
          </select>

          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="text-xs font-mono border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
          >
            <option value="all">All Trades</option>
            <option value="Electrical">Electrical</option>
            <option value="Welding & Fabrication">Welding & Fabrication</option>
            <option value="Heavy Equipment & Operations">Heavy Equipment</option>
            <option value="Logistics & Warehousing">Logistics</option>
            <option value="Carpentry & Framing">Carpentry</option>
          </select>

          {selectedWorkerFilter && (
            <div className="flex items-center gap-1 bg-stone-100 text-stone-800 border border-stone-300 text-xs font-mono px-3 py-1.5 rounded-full">
              <span>Filtered by worker</span>
              <button
                onClick={onClearWorkerFilter}
                className="hover:text-stone-950 font-bold ml-1 cursor-pointer"
                title="Clear worker filter"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="text-xs font-mono text-stone-500">
          Showing <strong className="text-stone-900">{filteredTasks.length}</strong> of {totalTasks} tasks
        </div>
      </div>

      {/* 5-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 shadow-2xs flex flex-col min-h-[580px] ${column.color} border-t-4`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-800 tracking-tight">
                  {column.label}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${column.badgeColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1">
                {columnTasks.map((task) => {
                  const completedChecklists = task.checklists.filter((c) => c.completed).length;
                  const totalChecklists = task.checklists.length;
                  const checklistProgress = totalChecklists > 0 
                    ? Math.round((completedChecklists / totalChecklists) * 100) 
                    : 100;

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs hover:border-stone-300 hover:shadow-xs space-y-3 transition-all"
                    >
                      {/* Priority badge and Trade */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-stone-200 text-stone-900 border border-stone-400 font-black'
                            : task.priority === 'high'
                            ? 'bg-stone-100 text-stone-800 border border-stone-300 font-semibold'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                        }`}>
                          {task.priority}
                        </span>

                        <span className="text-[10px] font-mono font-semibold text-stone-500">
                          {task.trade}
                        </span>
                      </div>

                      {/* Title and Description */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 leading-snug">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                      </div>

                      {/* Safety Requirement Alert if present */}
                      {task.safetyRequirement && (
                        <div className="bg-stone-100 border border-stone-200 rounded-xl p-2 text-[10px] text-stone-800 flex items-start gap-1.5 font-mono">
                          <ShieldAlert className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{task.safetyRequirement}</span>
                        </div>
                      )}

                      {/* Interactive Checklists */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-stone-500">
                          <span>Milestones</span>
                          <span>{completedChecklists}/{totalChecklists}</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              checklistProgress === 100 ? 'bg-emerald-700' : 'bg-stone-600'
                            }`}
                            style={{ width: `${checklistProgress}%` }}
                          ></div>
                        </div>

                        <div className="space-y-1 pt-1">
                          {task.checklists.map((chk) => (
                            <label
                              key={chk.id}
                              className="flex items-start gap-2 text-[11px] text-stone-700 cursor-pointer hover:text-stone-900 group font-mono"
                            >
                              <input
                                type="checkbox"
                                checked={chk.completed}
                                onChange={() => onToggleChecklist(task.id, chk.id)}
                                className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5 cursor-pointer accent-emerald-800"
                              />
                              <span className={chk.completed ? 'line-through text-stone-400' : ''}>
                                {chk.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Worker Avatar & Hours */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        {task.assignedWorkerName ? (
                          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedWorkerName}`}>
                            {task.assignedWorkerAvatar ? (
                              <img
                                src={task.assignedWorkerAvatar}
                                alt={task.assignedWorkerName}
                                className="w-5 h-5 rounded-full object-cover border border-stone-200"
                              />
                            ) : (
                              <User className="w-4 h-4 text-stone-400" />
                            )}
                            <span className="font-semibold text-stone-800 text-[11px] truncate max-w-[90px]">
                              {task.assignedWorkerName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic font-mono text-[10px]">Unassigned</span>
                        )}

                        <div className="flex items-center gap-1 font-mono text-[10px] text-stone-500">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{task.loggedHours}h / {task.estimatedHours}h</span>
                        </div>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="text-[10px] font-mono font-semibold bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-stone-800 w-full focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer shadow-2xs"
                        >
                          <option value="backlog">Move to Backlog</option>
                          <option value="todo">Move to To Do</option>
                          <option value="in_progress">Move to In Progress</option>
                          <option value="review">Submit for QA Review</option>
                          <option value="completed">Mark Verified Complete</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl">
                    <p className="text-xs font-mono text-stone-400">No tasks in this lane</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Create New Task */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-stone-200 text-stone-900 p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-stone-900">Create New Collaborative Task</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Assign work packages to hired blue-collar specialists with safety mandates.
                </p>
              </div>
              <button
                onClick={() => setIsAddingTask(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Splicing 33kV Underground Feeder Cables"
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detail step-by-step engineering specifications..."
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Project Package</label>
                  <input
                    type="text"
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Trade Discipline</label>
                  <select
                    value={taskTrade}
                    onChange={(e) => setTaskTrade(e.target.value as TradeCategory)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white cursor-pointer"
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Assign Hired Worker</label>
                  <select
                    value={taskAssignedWorker}
                    onChange={(e) => setTaskAssignedWorker(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white cursor-pointer"
                  >
                    <option value="">-- Select Worker --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.trade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    value={taskEstHours}
                    onChange={(e) => setTaskEstHours(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Site Location</label>
                  <input
                    type="text"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Safety & Hazard Prevention Mandate
                </label>
                <input
                  type="text"
                  value={taskSafety}
                  onChange={(e) => setTaskSafety(e.target.value)}
                  placeholder="e.g. Arc-flash face shield, high voltage rubber mats"
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  Deploy Task to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
