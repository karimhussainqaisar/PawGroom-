import { AuthDatabase, ClientProfile, AdminUser } from '../types/auth';
import { DEFAULT_REGISTERED_PROFILES } from './registeredProfiles';

export const AUTH_STORAGE_KEY = 'paw_grooming_auth_db_v2';
export const SESSION_STORAGE_KEY = 'paw_grooming_auth_session_v2';

export const INITIAL_ADMIN: AdminUser = {
  id: 'adm_01',
  name: 'Paw SuperAdmin',
  email: 'admin@parkgrooming.com',
  password: 'admin123',
  role: 'super_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  lastLogin: '2026-08-19'
};

export const INITIAL_PROFILES: ClientProfile[] = DEFAULT_REGISTERED_PROFILES;

export const INITIAL_AUTH_DATABASE: AuthDatabase = {
  admin: INITIAL_ADMIN,
  profiles: INITIAL_PROFILES,
  version: '1.4.0',
  lastUpdated: new Date().toISOString()
};

// Helper: load auth database from localStorage
export function loadAuthDatabase(): AuthDatabase {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profiles && Array.isArray(parsed.profiles)) {
        // Merge with code defaults in case new profiles were introduced
        const profileMap = new Map<string, ClientProfile>();
        DEFAULT_REGISTERED_PROFILES.forEach(p => profileMap.set(p.profileId, p));
        parsed.profiles.forEach((p: ClientProfile) => profileMap.set(p.profileId, p));
        return {
          ...parsed,
          profiles: Array.from(profileMap.values())
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved auth database:', err);
  }
  // If not saved, persist initial and return
  saveAuthDatabase(INITIAL_AUTH_DATABASE);
  return INITIAL_AUTH_DATABASE;
}

// Helper: save auth database to localStorage
export function saveAuthDatabase(db: AuthDatabase): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save auth database to localStorage:', err);
  }
}

// Helper: Generate next unique Profile ID
export function generateNextProfileId(profiles: ClientProfile[]): string {
  const existingNumbers = profiles
    .map(p => {
      const match = p.profileId.match(/^PG(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNum = maxNum + 1;
  return `PG${String(nextNum).padStart(3, '0')}`;
}

// Helper: Generate secure suggested password
export function generateSuggestedPassword(): string {
  const words = ['Paws', 'Bark', 'Groom', 'Studio', 'Shampoo', 'Fluffy', 'Happy', 'Puppy'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${randomWord}@${randomNum}`;
}
