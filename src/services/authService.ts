import { AuthUser, UserRole, WorkerProfile, EmployerProfile } from '../types';
import { INITIAL_WORKERS } from '../data/mockData';

const USERS_STORAGE_KEY = 'skillmatch_registered_users_v1';
const SESSION_STORAGE_KEY = 'skillmatch_active_session_v1';
const EMPLOYERS_STORAGE_KEY = 'skillmatch_employers_v1';

// Deterministic lightweight SHA-256 hash using SubtleCrypto with fallback
export async function hashPassword(plain: string): Promise<string> {
  const salted = `skillmatch_salt_2026::${plain}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(salted);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback deterministic digest if WebCrypto unavailable
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return `fb_${Math.abs(hash).toString(16)}`;
}

// Synchronous pre-computed fallback hash marker for initial seed accounts
function seedPasswordHash(plain: string): string {
  const salted = `skillmatch_salt_2026::${plain}`;
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return `seed_${Math.abs(hash).toString(16)}`;
}

export const INITIAL_EMPLOYERS: EmployerProfile[] = [
  {
    id: 'emp-1',
    name: 'Vikramaditya Rao',
    companyName: 'Metro Infrastructure & EPC Ltd',
    email: 'hr@metroepc.in',
    phone: '+91 98400 77881',
    industry: 'Transit & Civil Infrastructure',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstinOrRegId: '33AAACM1234F1Z5',
    verified: true,
  },
  {
    id: 'emp-2',
    name: 'Ananya Sundaram',
    companyName: 'Skyline Structural Builders',
    email: 'dispatch@skylinebuilders.in',
    phone: '+91 98400 88992',
    industry: 'Commercial High-Rise & Fabrication',
    city: 'Chennai',
    state: 'Tamil Nadu',
    gstinOrRegId: '33AABCS5678G1Z9',
    verified: true,
  },
];

function buildDefaultUsers(): AuthUser[] {
  const workerAccounts: AuthUser[] = INITIAL_WORKERS.map((w) => ({
    id: `usr-${w.id}`,
    name: w.name,
    email: w.email.toLowerCase(),
    role: 'worker' as UserRole,
    passwordHash: seedPasswordHash('worker123'),
    phone: w.phone,
    linkedWorkerId: w.id,
    createdAt: '2026-09-01T09:00:00.000Z',
  }));

  const employerAccounts: AuthUser[] = INITIAL_EMPLOYERS.map((e) => ({
    id: `usr-${e.id}`,
    name: e.name,
    email: e.email.toLowerCase(),
    role: 'employer' as UserRole,
    passwordHash: seedPasswordHash('employer123'),
    phone: e.phone,
    linkedEmployerId: e.id,
    companyName: e.companyName,
    createdAt: '2026-09-01T09:00:00.000Z',
  }));

  const adminAccount: AuthUser = {
    id: 'usr-admin-1',
    name: 'Platform Compliance Officer',
    email: 'admin@skillmatch.in',
    role: 'admin',
    passwordHash: seedPasswordHash('admin123'),
    phone: '+91 44 2250 1000',
    companyName: 'SkillMatch Verification Board',
    createdAt: '2026-09-01T09:00:00.000Z',
  };

  return [...workerAccounts, ...employerAccounts, adminAccount];
}

export function getRegisteredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const defaults = buildDefaultUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as AuthUser[];
    return parsed.length > 0 ? parsed : buildDefaultUsers();
  } catch {
    return buildDefaultUsers();
  }
}

export function saveRegisteredUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore storage quota failures
  }
}

export function getEmployersList(): EmployerProfile[] {
  try {
    const raw = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYERS));
      return INITIAL_EMPLOYERS;
    }
    return JSON.parse(raw) as EmployerProfile[];
  } catch {
    return INITIAL_EMPLOYERS;
  }
}

export function saveEmployersList(employers: EmployerProfile[]): void {
  try {
    localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(employers));
  } catch {
    // ignore
  }
}

export function getCurrentSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthUser | null;
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Please enter both email address and password.' };
  }

  const users = getRegisteredUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!found) {
    return { success: false, error: 'No registered account matches this email address.' };
  }

  const shaHash = await hashPassword(password);
  const seedHash = seedPasswordHash(password);

  if (found.passwordHash !== shaHash && found.passwordHash !== seedHash) {
    return { success: false, error: 'Invalid password. Try demo password (worker123 / employer123).' };
  }

  const updatedUser: AuthUser = {
    ...found,
    lastLoginAt: new Date().toISOString(),
  };

  const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
  saveRegisteredUsers(nextUsers);
  setCurrentSessionUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function quickSwitchDemoAccount(userId: string): AuthUser | null {
  const users = getRegisteredUsers();
  const found = users.find((u) => u.id === userId);
  if (!found) return null;
  const updatedUser: AuthUser = {
    ...found,
    lastLoginAt: new Date().toISOString(),
  };
  setCurrentSessionUser(updatedUser);
  return updatedUser;
}

export interface RegisterWorkerPayload {
  role: 'worker';
  name: string;
  email: string;
  password: string;
  phone: string;
  trade: WorkerProfile['trade'];
  title: string;
  experienceYears: number;
  dailyRate: number;
  hourlyRate: number;
  city: string;
  state: string;
  maxTravelDistanceKm: number;
  availability: WorkerProfile['availability'];
  skills: string[];
  bio: string;
}

export interface RegisterEmployerPayload {
  role: 'employer';
  name: string;
  companyName: string;
  email: string;
  password: string;
  phone: string;
  industry: string;
  city: string;
  state: string;
  gstinOrRegId?: string;
}

export async function registerNewAccount(
  payload: RegisterWorkerPayload | RegisterEmployerPayload
): Promise<{
  success: boolean;
  user?: AuthUser;
  workerProfile?: WorkerProfile;
  employerProfile?: EmployerProfile;
  error?: string;
}> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!normalizedEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }
  if (payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email is already registered.' };
  }

  const passwordHash = await hashPassword(payload.password);
  const nowIso = new Date().toISOString();

  if (payload.role === 'worker') {
    const workerId = `w-${Date.now()}`;
    const workerProfile: WorkerProfile = {
      id: workerId,
      name: payload.name.trim(),
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
      phone: payload.phone.trim(),
      email: normalizedEmail,
      trade: payload.trade,
      title: payload.title.trim() || `Certified ${payload.trade} Specialist`,
      experienceYears: payload.experienceYears,
      rating: 4.8,
      completedGigs: 0,
      hourlyRate: payload.hourlyRate,
      dailyRate: payload.dailyRate,
      location: {
        city: payload.city.trim() || 'Chennai',
        state: payload.state.trim() || 'Tamil Nadu',
        lat: 13.0827,
        lng: 80.2707,
        maxTravelDistanceKm: payload.maxTravelDistanceKm || 25,
      },
      skills: payload.skills.length > 0 ? payload.skills : [payload.trade],
      certifications: ['Newly Registered Specialist'],
      verifiedBadges: [],
      verificationTier: 'Standard',
      availability: payload.availability,
      isAvailableNow: true,
      bio:
        payload.bio.trim() ||
        `${payload.trade} trade specialist registered on SkillMatch platform.`,
      verified: false,
    };

    const newUser: AuthUser = {
      id: `usr-${workerId}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: 'worker',
      passwordHash,
      phone: payload.phone.trim(),
      linkedWorkerId: workerId,
      createdAt: nowIso,
      lastLoginAt: nowIso,
    };

    saveRegisteredUsers([newUser, ...users]);
    setCurrentSessionUser(newUser);
    return { success: true, user: newUser, workerProfile };
  } else {
    const employerId = `emp-${Date.now()}`;
    const employerProfile: EmployerProfile = {
      id: employerId,
      name: payload.name.trim(),
      companyName: payload.companyName.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      industry: payload.industry.trim() || 'Construction & Engineering',
      city: payload.city.trim() || 'Chennai',
      state: payload.state.trim() || 'Tamil Nadu',
      gstinOrRegId: payload.gstinOrRegId?.trim(),
      verified: true,
    };

    const employers = getEmployersList();
    saveEmployersList([employerProfile, ...employers]);

    const newUser: AuthUser = {
      id: `usr-${employerId}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: 'employer',
      passwordHash,
      phone: payload.phone.trim(),
      linkedEmployerId: employerId,
      companyName: payload.companyName.trim(),
      createdAt: nowIso,
      lastLoginAt: nowIso,
    };

    saveRegisteredUsers([newUser, ...users]);
    setCurrentSessionUser(newUser);
    return { success: true, user: newUser, employerProfile };
  }
}
