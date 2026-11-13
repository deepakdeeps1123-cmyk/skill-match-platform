import React from 'react';
import { AuthUser, WorkerProfile } from '../types';
import {
  ShieldCheck,
  HardHat,
  Building2,
  Mail,
  Phone,
  MapPin,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

interface AccountSettingsViewProps {
  currentUser: AuthUser;
  activeWorker?: WorkerProfile;
  onLogout: () => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  currentUser,
  activeWorker,
  onLogout,
}) => {
  const isEmployer = currentUser.role === 'employer';

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
              {isEmployer ? (
                <Building2 className="w-6 h-6 text-emerald-100" />
              ) : (
                <HardHat className="w-6 h-6 text-emerald-100" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  {isEmployer ? currentUser.companyName || currentUser.name : currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  {isEmployer ? 'Employer Account' : 'Worker Account'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isEmployer
                  ? `Managed by ${currentUser.name}`
                  : `${activeWorker?.trade || 'Skilled Specialist'} · ${activeWorker?.title || 'Verified Trade Profile'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-emerald-800" />
              Email Address
            </span>
            <p className="font-semibold text-stone-900">{currentUser.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-stone-500 flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-800" />
              Contact Number
            </span>
            <p className="font-semibold text-stone-900">{currentUser.phone || 'Not provided'}</p>
          </div>

          {!isEmployer && activeWorker && (
            <>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  Location & Radius
                </span>
                <p className="font-semibold text-stone-900">
                  {activeWorker.location.city}, {activeWorker.location.state} ({activeWorker.location.maxTravelDistanceKm} km)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                  Verified Badges & Rate
                </span>
                <p className="font-semibold text-stone-900 font-mono tabular-nums">
                  {(activeWorker.verifiedBadges || []).filter((b) => b.status === 'verified').length} Verified · ₹{activeWorker.dailyRate}/day
                </p>
              </div>
            </>
          )}
        </div>

        {/* Portal Access Scope */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <p className="text-xs font-bold text-emerald-900">
            {isEmployer ? 'Employer Portal Access' : 'Worker Portal Access'}
          </p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            {isEmployer
              ? 'Your session is scoped exclusively to the Employer Portal: publishing vacancies, matching and ranking candidates, hiring staff, and tracking workforce tasks.'
              : 'Your session is scoped exclusively to the Worker Portal: viewing personalized job recommendations, checking skill gaps, benchmarking peer competition, managing verified badges, and tracking your assigned tasks.'}
          </p>
        </div>
      </div>
    </div>
  );
};
