import React, { useState } from 'react';
import {
  AuthUser,
  WorkerProfile,
  EmployerProfile,
  TradeCategory,
  AvailabilityShift,
} from '../types';
import {
  authenticateUser,
  registerNewAccount,
  getRegisteredUsers,
  quickSwitchDemoAccount,
} from '../services/authService';
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  LogOut,
  KeyRound,
  Building2,
  HardHat,
  CheckCircle2,
  Eye,
  EyeOff,
  Users,
  Lock,
  Plus,
  X,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface AuthPortalProps {
  currentUser: AuthUser | null;
  onAuthSuccess: (
    user: AuthUser,
    newWorker?: WorkerProfile,
    newEmployer?: EmployerProfile
  ) => void;
  onLogout: () => void;
  onNavigateTab: (
    tab: 'worker' | 'employer' | 'matching' | 'tasks' | 'analytics' | 'architecture' | 'auth'
  ) => void;
  workersCount: number;
  employersCount: number;
  initialMode?: 'login' | 'register' | 'directory';
}

const SUGGESTED_TRADE_SKILLS: Record<TradeCategory, string[]> = {
  Electrical: ['3-Phase Wiring', 'Conduit Bending', 'PLC Troubleshooting', 'Circuit Breaker Installation', 'Panel Commissioning'],
  'Welding & Fabrication': ['TIG Welding', 'MIG Welding', 'Structural Steel Fabrication', 'Blueprint Reading', 'Plasma Cutting'],
  'HVAC & Refrigeration': ['VRF Systems', 'Chiller Maintenance', 'Refrigerant Charging', 'Duct Fabrication', 'BMS Controls'],
  Plumbing: ['Industrial Pipefitting', 'Hydrostatic Testing', 'PEX & Copper Brazing', 'Pump Calibration', 'Drainage Systems'],
  'Heavy Equipment & Operations': ['Tower Crane Operation', 'Excavator Control', 'Rigging & Signaling', 'Load Chart Calculation'],
  'Carpentry & Framing': ['Formwork Shuttering', 'Timber Framing', 'Blueprint Layout', 'Scaffolding Erection'],
  'Masonry & Concrete': ['Reinforced Concrete Pouring', 'Laser Leveling', 'Block Masonry', 'Waterproofing'],
  'Logistics & Warehousing': ['Forklift Operation', 'Inventory RFID', 'Dock Staging', 'Heavy Rigging'],
  'Automotive & Mechanical': ['Diesel Engine Diagnostics', 'Hydraulic Repair', 'Preventive Maintenance'],
  'Painting & Finishing': ['Epoxy Industrial Coating', 'Airless Spraying', 'Surface Blasting'],
};

export const AuthPortal: React.FC<AuthPortalProps> = ({
  currentUser,
  onAuthSuccess,
  onLogout,
  onNavigateTab,
  workersCount,
  employersCount,
  initialMode,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'directory'>(
    initialMode || (currentUser ? 'directory' : 'login')
  );
  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [regRole, setRegRole] = useState<'worker' | 'employer'>('worker');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Worker / Employer Registration Form
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 98400 11223');
  const [city, setCity] = useState('Chennai');
  const [stateName, setStateName] = useState('Tamil Nadu');

  // Worker-specific registration fields
  const [trade, setTrade] = useState<TradeCategory>('Electrical');
  const [jobTitle, setJobTitle] = useState('Industrial Trade Specialist');
  const [experienceYears, setExperienceYears] = useState(4);
  const [dailyRate, setDailyRate] = useState(2200);
  const [hourlyRate, setHourlyRate] = useState(310);
  const [travelRadius, setTravelRadius] = useState(25);
  const [shift, setShift] = useState<AvailabilityShift>('Morning (6 AM - 2 PM)');
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['3-Phase Wiring', 'Conduit Bending']);
  const [bio, setBio] = useState('');

  // Employer-specific registration fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Infrastructure & Civil EPC');
  const [gstinId, setGstinId] = useState('');

  const registeredUsers = getRegisteredUsers();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    const result = await authenticateUser(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!result.success || !result.user) {
      setAuthError(result.error || 'Authentication failed.');
      return;
    }

    onAuthSuccess(result.user);
    setMode('directory');
  };

  const handleQuickLogin = (user: AuthUser) => {
    const switched = quickSwitchDemoAccount(user.id);
    if (switched) {
      setAuthError(null);
      onAuthSuccess(switched);
    }
  };

  const handleAddSkillTag = (skill?: string) => {
    const val = (skill || skillInput).trim();
    if (!val) return;
    if (!skillsList.includes(val)) {
      setSkillsList([...skillsList, val]);
    }
    if (!skill) setSkillInput('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    if (regRole === 'worker') {
      const res = await registerNewAccount({
        role: 'worker',
        name: fullName,
        email: regEmail,
        password: regPassword,
        phone,
        trade,
        title: jobTitle,
        experienceYears,
        dailyRate,
        hourlyRate,
        city,
        state: stateName,
        maxTravelDistanceKm: travelRadius,
        availability: shift,
        skills: skillsList,
        bio,
      });
      setIsSubmitting(false);
      if (!res.success || !res.user) {
        setAuthError(res.error || 'Worker registration failed.');
        return;
      }
      onAuthSuccess(res.user, res.workerProfile);
      setMode('directory');
      onNavigateTab('worker');
    } else {
      const res = await registerNewAccount({
        role: 'employer',
        name: fullName,
        companyName,
        email: regEmail,
        password: regPassword,
        phone,
        industry,
        city,
        state: stateName,
        gstinOrRegId: gstinId,
      });
      setIsSubmitting(false);
      if (!res.success || !res.user) {
        setAuthError(res.error || 'Employer registration failed.');
        return;
      }
      onAuthSuccess(res.user, undefined, res.employerProfile);
      setMode('directory');
      onNavigateTab('employer');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500 font-medium">
              Accounts · {registeredUsers.length} registered ({workersCount} workers · {employersCount} employers)
            </p>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
              Sign Up & Sign In
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Create a Worker or Client account, log in with your email and password, or switch demo users to explore the platform.
            </p>
          </div>

          {currentUser && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{currentUser.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-800 text-white font-mono text-[10px] uppercase font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-stone-600 font-mono text-[11px]">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMode('login');
                }}
                className="ml-2 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Sign out of current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-stone-200">
          <button
            id="btn-auth-mode-login"
            onClick={() => {
              setAuthError(null);
              setMode('login');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Authentication (Sign In)
          </button>

          <button
            id="btn-auth-mode-register"
            onClick={() => {
              setAuthError(null);
              setMode('register');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            User Registration (New Account)
          </button>

          <button
            id="btn-auth-mode-directory"
            onClick={() => {
              setAuthError(null);
              setMode('directory');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'directory'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Active Session & Account Directory ({registeredUsers.length})
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {authError && (
        <div className="bg-stone-100 border border-stone-400 text-stone-900 rounded-xl p-4 text-xs font-mono flex items-center justify-between">
          <span>
            <strong className="uppercase mr-2">Auth Notice:</strong>
            {authError}
          </span>
          <button
            onClick={() => setAuthError(null)}
            className="text-stone-600 hover:text-stone-900 font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 1: AUTHENTICATION MODULE (SIGN IN)                           */}
      {/* ================================================================= */}
      {mode === 'login' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Sign In to SkillMatch</h2>
                <p className="text-xs text-stone-500">
                  Enter your registered Worker or Employer email and password
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. ramesh.kumar@bluecraft.in or hr@metroepc.in"
                  className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs font-mono p-3 pr-10 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                >
                  Need an account? Register here →
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>

          {/* Demo Accounts Quick-Fill / Instant Login */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-base font-bold text-stone-900">1-Click Demo Accounts</h2>
                <p className="text-xs text-stone-500">
                  Switch instantly between Worker and Employer accounts for easy testing
                </p>
              </div>
              <span className="text-[10px] font-mono bg-stone-100 border border-stone-200 px-2 py-0.5 rounded font-bold text-stone-700">
                DEMO SWITCHER
              </span>
            </div>

            <div className="space-y-2.5">
              {registeredUsers.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/70 transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{user.name}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          user.role === 'employer'
                            ? 'bg-stone-200 text-stone-800 border-stone-300'
                            : user.role === 'admin'
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-600 mt-0.5">
                      {user.email} · Default pass:{' '}
                      <span className="text-stone-800 font-semibold">
                        {user.role === 'worker' ? 'worker123' : user.role === 'employer' ? 'employer123' : 'admin123'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(user.email);
                        setLoginPassword(
                          user.role === 'worker'
                            ? 'worker123'
                            : user.role === 'employer'
                            ? 'employer123'
                            : 'admin123'
                        );
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 2: USER REGISTRATION MODULE                                  */}
      {/* ================================================================= */}
      {mode === 'register' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Create New Platform Account
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Register as a Skilled Trade Worker to receive ranked job matches, or as an Employer to publish vacancies and hire verified specialists.
              </p>
            </div>

            {/* Account Role Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 self-start">
              <button
                type="button"
                onClick={() => setRegRole('worker')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  regRole === 'worker'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                Skilled Worker
              </button>
              <button
                type="button"
                onClick={() => setRegRole('employer')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  regRole === 'employer'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Employer / Contractor
              </button>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            {/* Section 1: Core Account Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                1. Identity & Security Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {regRole === 'worker' ? 'Full Name *' : 'HR / Contact Person Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={regRole === 'worker' ? 'e.g. Karthikeyan S' : 'e.g. Priya Venkatesh'}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.in"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create secure password"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Role-Specific Profile */}
            {regRole === 'worker' ? (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                  2. Worker Competency Profile Initialization
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Primary Trade Category *
                    </label>
                    <select
                      value={trade}
                      onChange={(e) => {
                        const nextTrade = e.target.value as TradeCategory;
                        setTrade(nextTrade);
                        setSkillsList(SUGGESTED_TRADE_SKILLS[nextTrade]?.slice(0, 3) || []);
                      }}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      {Object.keys(SUGGESTED_TRADE_SKILLS).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Availability Shift
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as AvailabilityShift)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                      <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                      <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                      <option value="Flexible / Any">Flexible / Any</option>
                      <option value="Weekend Only">Weekend Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Exp (Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={45}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Daily Rate (₹)</label>
                    <input
                      type="number"
                      min={500}
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      min={100}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Radius (km)</label>
                    <input
                      type="number"
                      min={5}
                      max={150}
                      value={travelRadius}
                      onChange={(e) => setTravelRadius(Number(e.target.value))}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                </div>

                {/* Skills Tag Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Technical Competencies & Trade Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillTag();
                        }
                      }}
                      placeholder="Type a skill (e.g. Conduit Bending) and press Add"
                      className="flex-1 text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillTag()}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Quick Suggest Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                    <span className="text-stone-500">Quick-add for {trade}:</span>
                    {(SUGGESTED_TRADE_SKILLS[trade] || []).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddSkillTag(sug)}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 rounded cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillsList.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-mono font-semibold"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => setSkillsList(skillsList.filter((item) => item !== s))}
                          className="text-emerald-700 hover:text-stone-900 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Field Experience Summary / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe projects completed, safety record, and specialized equipment handled..."
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                  2. Employer Organization & Contractor Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Company / Contractor Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Civil Engineering Pvt Ltd"
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Industry Sector
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Headquarters City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Registration / GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={gstinId}
                      onChange={(e) => setGstinId(e.target.value)}
                      placeholder="33AAACA1234B1Z2"
                      className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Already registered? Sign In
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting
                  ? 'Creating Account...'
                  : `Register ${regRole === 'worker' ? 'Worker Profile' : 'Employer Account'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 3: ACTIVE SESSION & REGISTERED ACCOUNTS DIRECTORY            */}
      {/* ================================================================= */}
      {mode === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Session Security Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-base font-bold text-stone-900">Active Authentication Session</h2>
            </div>

            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500">User ID:</span>
                    <span className="font-bold text-stone-900">{currentUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Authenticated As:</span>
                    <span className="font-bold text-stone-900">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Access Role (RBAC):</span>
                    <span className="font-bold text-emerald-800 uppercase">{currentUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Email:</span>
                    <span className="text-stone-800">{currentUser.email}</span>
                  </div>
                  {currentUser.companyName && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Organization:</span>
                      <span className="text-stone-800 font-semibold">{currentUser.companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">Session Integrity:</span>
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Token Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() =>
                      onNavigateTab(currentUser.role === 'employer' ? 'employer' : 'worker')
                    }
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Role Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateTab('matching')}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Matching Engine <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-stone-600">No active session. Please sign in or register.</p>
                <button
                  onClick={() => setMode('login')}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Go to Sign In
                </button>
              </div>
            )}
          </div>

          {/* All Registered Users Directory */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Registered Platform Accounts ({registeredUsers.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Switch active session between Workers, Employers, and Compliance Officers
                </p>
              </div>
              <button
                onClick={() => setMode('register')}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> New User
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {registeredUsers.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">{user.name}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-stone-300 font-bold text-stone-700">
                          {user.role}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-0.5">
                            <UserCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-stone-500 truncate mt-0.5">
                        {user.email} {user.companyName ? `· ${user.companyName}` : ''}
                      </p>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleQuickLogin(user)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-800 hover:text-white text-stone-800 border border-stone-300 hover:border-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Switch Session
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
