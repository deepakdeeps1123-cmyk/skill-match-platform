import React, { useState, useEffect } from 'react';
import {
  AuthUser,
  WorkerProfile,
  EmployerProfile,
  TradeCategory,
} from '../types';
import {
  authenticateUser,
  registerNewAccount,
  getRegisteredUsers,
  quickSwitchDemoAccount,
} from '../services/authService';
import {
  HardHat,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  initialRole?: 'worker' | 'employer';
  onLoginSuccess: (
    user: AuthUser,
    newWorker?: WorkerProfile,
    newEmployer?: EmployerProfile
  ) => void;
}

const TRADE_OPTIONS: TradeCategory[] = [
  'Electrical',
  'Welding & Fabrication',
  'HVAC & Refrigeration',
  'Plumbing',
  'Heavy Equipment & Operations',
  'Carpentry & Framing',
  'Masonry & Concrete',
  'Logistics & Warehousing',
  'Automotive & Mechanical',
  'Painting & Finishing',
];

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  initialRole = 'worker',
  onLoginSuccess,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'signup'>(initialMode);
  const [portalRole, setPortalRole] = useState<'worker' | 'employer'>(initialRole);

  useEffect(() => {
    setAuthTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setPortalRole(initialRole);
  }, [initialRole]);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Signup Form State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 98400 12345');
  const [city, setCity] = useState('Chennai');
  const [trade, setTrade] = useState<TradeCategory>('Electrical');
  const [dailyRate, setDailyRate] = useState(2200);
  const [companyName, setCompanyName] = useState('');

  const registeredUsers = getRegisteredUsers();
  const demoWorker = registeredUsers.find((u) => u.role === 'worker');
  const demoEmployer = registeredUsers.find((u) => u.role === 'employer');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);
    const res = await authenticateUser(email, password);
    setIsLoading(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Incorrect email or password.');
      return;
    }

    if (res.user.role !== portalRole) {
      const accountLabel = res.user.role === 'employer' ? 'Employer' : 'Worker';
      const selectedLabel = portalRole === 'employer' ? 'Employer' : 'Worker';
      setErrorMsg(
        `This account is registered as a ${accountLabel}. Please switch to the ${accountLabel} Portal tab above instead of ${selectedLabel} Portal.`
      );
      return;
    }

    onLoginSuccess(res.user);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please enter the same password twice.');
      return;
    }

    setIsLoading(true);

    if (portalRole === 'worker') {
      const res = await registerNewAccount({
        role: 'worker',
        name: fullName,
        email: signupEmail,
        password: signupPassword,
        phone,
        trade,
        title: `${trade} Specialist`,
        experienceYears: 3,
        dailyRate,
        hourlyRate: Math.round(dailyRate / 8),
        city,
        state: 'Tamil Nadu',
        maxTravelDistanceKm: 25,
        availability: 'Morning (6 AM - 2 PM)',
        skills: [trade],
        bio: `${trade} specialist registered on SkillMatch.`,
      });
      setIsLoading(false);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Could not create worker account.');
        return;
      }
      onLoginSuccess(res.user, res.workerProfile);
    } else {
      const res = await registerNewAccount({
        role: 'employer',
        name: fullName,
        companyName: companyName || `${fullName} Projects`,
        email: signupEmail,
        password: signupPassword,
        phone,
        industry: 'Construction & Engineering',
        city,
        state: 'Tamil Nadu',
      });
      setIsLoading(false);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Could not create employer account.');
        return;
      }
      onLoginSuccess(res.user, undefined, res.employerProfile);
    }
  };

  const handleDemoSignIn = (user: AuthUser | undefined) => {
    if (!user) return;
    const switched = quickSwitchDemoAccount(user.id);
    if (switched) {
      onLoginSuccess(switched);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Clean Minimal Top Bar */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <HardHat className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 block leading-none">
                SkillMatch
              </span>
              <span className="text-[11px] text-stone-500">
                Skilled Workforce & Hiring Platform
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-500">
            {authTab === 'login' ? (
              <span>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setAuthTab('signup');
                  }}
                  className="font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setAuthTab('login');
                  }}
                  className="font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Separated Dual-Portal Login Area */}
      <main className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Clear Portal Role Explanation & Quick Access */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
              <div>
                <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                  Choose Your Portal
                </h2>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Workers and Employers use separate, dedicated workspaces with tools built specifically for their role.
                </p>
              </div>

              <div className="space-y-3">
                {/* Worker Portal Card */}
                <div
                  onClick={() => {
                    setPortalRole('worker');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                    portalRole === 'worker'
                      ? 'bg-emerald-50/70 border-emerald-700'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-emerald-800" />
                      <span className="text-sm font-bold text-stone-900">Worker Portal</span>
                    </div>
                    {portalRole === 'worker' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Job recommendations, skill gap analysis, peer competition ranking, verified badges, and assigned tasks.
                  </p>
                  {demoWorker && (
                    <button
                      type="button"
                      id="btn-demo-worker-login"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoSignIn(demoWorker);
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      Sign In as Worker ({demoWorker.name})
                    </button>
                  )}
                </div>

                {/* Employer Portal Card */}
                <div
                  onClick={() => {
                    setPortalRole('employer');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                    portalRole === 'employer'
                      ? 'bg-emerald-50/70 border-emerald-700'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-800" />
                      <span className="text-sm font-bold text-stone-900">Employer Portal</span>
                    </div>
                    {portalRole === 'employer' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Vacancy management, candidate skill matching, compatibility scoring & ranking, hiring, and workforce tasks.
                  </p>
                  {demoEmployer && (
                    <button
                      type="button"
                      id="btn-demo-employer-login"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoSignIn(demoEmployer);
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      Sign In as Employer ({demoEmployer.companyName || demoEmployer.name})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login & Registration Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
            {/* Mode Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {authTab === 'login'
                    ? portalRole === 'worker'
                      ? 'Worker Sign In'
                      : 'Employer Sign In'
                    : portalRole === 'worker'
                    ? 'Register as Skilled Worker'
                    : 'Register as Employer'}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  {portalRole === 'worker'
                    ? 'Access your personal job matches, verified badges, and work tasks.'
                    : 'Manage your company vacancies, candidate scoring, and hired team.'}
                </p>
              </div>
            </div>

            {/* Auth Mode Tabs (Sign In / Create Account) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                id="login-tab-signin"
                onClick={() => {
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setAuthTab('login');
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                id="login-tab-signup"
                onClick={() => {
                  setErrorMsg(null);
                  setInfoMsg(null);
                  setAuthTab('signup');
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  authTab === 'signup'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>

            {/* Portal Selector inside Form */}
            <div>
              <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Selected Portal
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPortalRole('worker');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    portalRole === 'worker'
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  Worker Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalRole('employer');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    portalRole === 'employer'
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-900'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Employer Portal
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-stone-100 border border-stone-300 text-xs text-stone-900 font-medium">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                {infoMsg}
              </div>
            )}

            {/* LOGIN FORM */}
            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-stone-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      portalRole === 'worker'
                        ? 'e.g. arjun.nair@skillmatch.in'
                        : 'e.g. hr@metroepc.in'
                    }
                    className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-stone-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setInfoMsg(
                          portalRole === 'worker'
                            ? 'Demo worker password: worker123 (or click Sign In as Worker on the left).'
                            : 'Demo employer password: employer123 (or click Sign In as Employer on the left).'
                        )
                      }
                      className="text-[11px] font-medium text-emerald-800 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full text-sm px-3.5 py-2.5 pr-10 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-emerald-800 rounded cursor-pointer"
                  />
                  <span>Keep me signed in on this browser</span>
                </label>

                <button
                  type="submit"
                  id="btn-login-submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Signing In...'
                      : portalRole === 'worker'
                      ? 'Sign In to Worker Portal'
                      : 'Sign In to Employer Portal'}
                  </span>
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Karthik M"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {portalRole === 'worker' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Primary Trade
                      </label>
                      <select
                        value={trade}
                        onChange={(e) => setTrade(e.target.value as TradeCategory)}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        {TRADE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Daily Rate (₹)
                      </label>
                      <input
                        type="number"
                        min={500}
                        max={10000}
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Builders Ltd"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <input
                  type="hidden"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <button
                  type="submit"
                  id="btn-signup-submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'Creating Account...'
                      : portalRole === 'worker'
                      ? 'Create Worker Account'
                      : 'Create Employer Account'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
