import { AuthDatabase, ClientProfile, AdminUser } from '../types/auth';

export const AUTH_STORAGE_KEY = 'park_grooming_auth_db_v1';
export const SESSION_STORAGE_KEY = 'park_grooming_auth_session_v1';

export const INITIAL_ADMIN: AdminUser = {
  id: 'adm_01',
  name: 'Park SuperAdmin',
  email: 'admin@parkgrooming.com',
  password: 'admin123',
  role: 'super_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  lastLogin: '2026-08-19'
};

export const INITIAL_PROFILES: ClientProfile[] = [
  {
    profileId: 'PG001',
    businessName: 'Happy Paws Grooming',
    ownerName: 'Sarah Jenkins',
    email: 'happy@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 234-5678',
    plan: 'Premium',
    createdAt: '2026-01-10',
    expiryDate: '2027-01-01',
    status: 'active',
    customSettings: {
      salonName: 'Happy Paws Grooming Studio',
      name: 'Happy Paws Pro Care',
      email: 'contact@happypawsgroom.com',
      phone: '(555) 234-5678',
      address: '142 Market St, Suite 2B, San Francisco, CA 94105',
      website: 'www.happypawsgroom.com',
      colorTheme: 'terracotta'
    }
  },
  {
    profileId: 'PG002',
    businessName: 'Luxury Pets Care',
    ownerName: 'Michael Vance',
    email: 'luxury@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 345-6789',
    plan: 'Enterprise',
    createdAt: '2026-02-01',
    expiryDate: '2027-02-01',
    status: 'active',
    customSettings: {
      salonName: 'Luxury Pets Care & Spa',
      name: 'Luxury Pets Haute Salon',
      email: 'vip@luxurypetscare.com',
      phone: '(555) 345-6789',
      address: '880 Ocean Blvd, Penthouse Suite, Santa Monica, CA 90401',
      website: 'www.luxurypetscare.com',
      colorTheme: 'emerald'
    }
  },
  {
    profileId: 'PG003',
    businessName: 'Pawfect Bark Studio',
    ownerName: 'Emily Davis',
    email: 'pawfect@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 456-7890',
    plan: 'Starter',
    createdAt: '2025-11-15',
    expiryDate: '2026-03-01',
    status: 'inactive',
    customSettings: {
      salonName: 'Pawfect Bark Studio',
      name: 'Pawfect Bark Spa',
      email: 'hello@pawfectbark.com',
      phone: '(555) 456-7890',
      address: '320 Pine Valley Rd, Austin, TX 78701',
      website: 'www.pawfectbark.com',
      colorTheme: 'blueberry'
    }
  }
];

export const INITIAL_AUTH_DATABASE: AuthDatabase = {
  admin: INITIAL_ADMIN,
  profiles: INITIAL_PROFILES,
  version: '1.0.0',
  lastUpdated: new Date().toISOString()
};

// Helper: load auth database from localStorage
export function loadAuthDatabase(): AuthDatabase {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profiles && Array.isArray(parsed.profiles)) {
        return parsed;
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
