import React from 'react';
import { SystemNotification } from '../types';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  ExternalLink,
  Plus
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onSimulateNewNotification: () => void;
  onNavigateTab: (tab: NonNullable<SystemNotification['linkTab']>) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications,
  onSimulateNewNotification,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-white border-b border-stone-200 text-stone-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-800 text-white shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Platform Notifications</h3>
              <p className="text-xs text-stone-500 font-mono">
                {notifications.filter((n) => !n.read).length} unread events
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action controls */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <button
            onClick={onSimulateNewNotification}
            className="px-2.5 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold rounded-md border border-stone-300 flex items-center gap-1 shadow-2xs font-mono"
            title="Simulate incoming job match or credential review update"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-800" />
            Simulate Event
          </button>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={onMarkAllAsRead}
              className="hover:text-emerald-800 flex items-center gap-1 font-semibold text-stone-700"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-800" />
              Mark read
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={onClearNotifications}
              className="hover:text-stone-900 flex items-center gap-1 font-semibold text-stone-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold">No notifications</p>
              <p className="text-xs text-stone-400 mt-1">
                You're all caught up! Click 'Simulate Event' to test incoming job or badge events.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const getIcon = () => {
                switch (n.type) {
                  case 'job_match':
                    return <Award className="w-4 h-4 text-emerald-800" />;
                  case 'application_update':
                    return <Briefcase className="w-4 h-4 text-emerald-700" />;
                  case 'task_assignment':
                    return <CheckCircle2 className="w-4 h-4 text-stone-700" />;
                  case 'milestone':
                    return <ShieldCheck className="w-4 h-4 text-emerald-800" />;
                  default:
                    return <ShieldCheck className="w-4 h-4 text-stone-700" />;
                }
              };

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    if (n.linkTab) {
                      onNavigateTab(n.linkTab);
                      onClose();
                    }
                  }}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-colors cursor-pointer space-y-1.5 ${
                    n.read ? 'bg-white hover:bg-stone-50' : 'bg-emerald-50/70 border border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-white border border-stone-200 shadow-2xs">
                        {getIcon()}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 leading-snug">
                        {n.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                      {n.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed pl-7">
                    {n.message}
                  </p>

                  {n.linkTab && (
                    <div className="pl-7 pt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-900 font-mono">
                      <span>Jump to {n.linkTab.toUpperCase()}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
