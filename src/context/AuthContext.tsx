import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AuthDatabase, 
  ClientProfile, 
  AdminUser, 
  AuthSession, 
  SubscriptionPlan, 
  AccountStatus 
} from '../types/auth';
import { 
  loadAuthDatabase, 
  saveAuthDatabase, 
  SESSION_STORAGE_KEY, 
  INITIAL_AUTH_DATABASE, 
  generateNextProfileId 
} from '../data/initialAuthData';
import { DEFAULT_REGISTERED_PROFILES } from '../data/registeredProfiles';
import { 
  testConnection, 
  seedFirestoreIfEmpty, 
  subscribeToOnlineFirestoreProfiles, 
  saveProfileToFirestore, 
  deleteProfileFromFirestore,
  authenticateWithFirestore 
} from '../lib/firebase';

export type AuthViewMode = 'client_login' | 'admin_login' | 'admin_dashboard' | 'app';

export interface LoginResult {
  success: boolean;
  error?: string;
  status?: 'active' | 'inactive' | 'invalid';
  profile?: ClientProfile;
}

interface AuthContextType {
  authDatabase: AuthDatabase;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentProfile: ClientProfile | null;
  currentAdmin: AdminUser | null;
  authView: AuthViewMode;
  setAuthView: (view: AuthViewMode) => void;
  
  // Login & Session Methods
  loginClient: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  impersonateClient: (profileId: string) => void;
  returnToAdmin: () => void;
  refreshServerDatabase: () => Promise<void>;
  
  // Profile Management Methods
  createClientProfile: (profile: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }) => Promise<ClientProfile>;
  updateClientProfile: (profileId: string, updates: Partial<ClientProfile>) => Promise<boolean>;
  toggleProfileStatus: (profileId: string) => Promise<boolean>;
  deleteClientProfile: (profileId: string) => Promise<boolean>;
  resetAuthDatabase: () => Promise<void>;
  
  // Inactive Account Modal State
  inactiveModalOpen: boolean;
  setInactiveModalOpen: (open: boolean) => void;
  inactiveProfileDetails: ClientProfile | null;
  setInactiveProfileDetails: (profile: ClientProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authDatabase, setAuthDatabase] = useState<AuthDatabase>(() => loadAuthDatabase());
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed: AuthSession = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [authView, setAuthView] = useState<AuthViewMode>(() => {
    if (session) {
      if (session.userType === 'admin') return 'admin_dashboard';
      if (session.userType === 'client') return 'app';
    }
    return 'client_login';
  });

  const [inactiveModalOpen, setInactiveModalOpen] = useState<boolean>(false);
  const [inactiveProfileDetails, setInactiveProfileDetails] = useState<ClientProfile | null>(null);

  // Helper: Merge fresh profiles with existing local list
  const mergeProfiles = (onlineProfiles: ClientProfile[], baseDb: AuthDatabase): AuthDatabase => {
    const map = new Map<string, ClientProfile>();
    // 1. Code base defaults
    DEFAULT_REGISTERED_PROFILES.forEach(p => map.set(p.profileId, p));
    // 2. Base DB
    baseDb.profiles.forEach(p => map.set(p.profileId, p));
    // 3. Online Database Profiles (highest authority)
    onlineProfiles.forEach(p => map.set(p.profileId, p));

    return {
      ...baseDb,
      profiles: Array.from(map.values()),
      lastUpdated: new Date().toISOString()
    };
  };

  // Function to sync with global server-side & static persistent database
  const refreshServerDatabase = useCallback(async () => {
    const timestamp = Date.now();
    try {
      // 1. Attempt API fetch with cache-busting
      const res = await fetch(`/api/auth/db?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.profiles)) {
          setAuthDatabase(prev => {
            const merged = mergeProfiles(data.profiles, prev);
            saveAuthDatabase(merged);
            return merged;
          });
          return;
        }
      }
    } catch (err) {
      // Server API unreachable, proceed to static JSON
    }

    try {
      // 2. Attempt direct static public JSON file fetch with cache-busting
      const staticRes = await fetch(`/auth_db.json?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        if (staticData && Array.isArray(staticData.profiles)) {
          setAuthDatabase(prev => {
            const merged = mergeProfiles(staticData.profiles, prev);
            saveAuthDatabase(merged);
            return merged;
          });
        }
      }
    } catch (err2) {
      console.warn('Using local auth database replica:', err2);
    }
  }, []);

  // 1. Initialize Firestore & Subscribe to Realtime Online Database
  useEffect(() => {
    // Validate connection and seed if empty
    testConnection();
    seedFirestoreIfEmpty(DEFAULT_REGISTERED_PROFILES);

    // Real-time listener for Firestore online database
    const unsubscribe = subscribeToOnlineFirestoreProfiles(
      (firestoreProfiles) => {
        if (firestoreProfiles && firestoreProfiles.length > 0) {
          setAuthDatabase(prev => {
            const merged = mergeProfiles(firestoreProfiles, prev);
            saveAuthDatabase(merged);
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Firestore subscription status:', err);
      }
    );

    // Initial server refresh & interval fallback
    refreshServerDatabase();
    const interval = setInterval(refreshServerDatabase, 6000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [refreshServerDatabase]);

  // Sync auth database changes to localStorage
  useEffect(() => {
    saveAuthDatabase(authDatabase);
  }, [authDatabase]);

  // Synchronize active session when profiles change
  useEffect(() => {
    if (session && session.userType === 'client' && session.profile) {
      const updatedProfile = authDatabase.profiles.find(p => p.profileId === session.profile?.profileId);
      if (updatedProfile) {
        if (updatedProfile.status === 'inactive') {
          setInactiveProfileDetails(updatedProfile);
          setInactiveModalOpen(true);
          logout();
        } else {
          setSession(prev => prev ? { ...prev, profile: updatedProfile } : null);
        }
      }
    }
  }, [authDatabase.profiles]);

  // Save session to storage
  const persistSession = (newSession: AuthSession | null, rememberMe: boolean = true) => {
    setSession(newSession);
    if (newSession) {
      const serialized = JSON.stringify(newSession);
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, serialized);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  /**
   * Client Login: Authenticates directly with Firebase Online Database, Server API & Master Registry
   */
  const loginClient = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct Firebase Firestore Online Database Authentication (PRIMARY)
    try {
      const firestoreResult = await authenticateWithFirestore(cleanEmail, cleanPassword);
      if (firestoreResult.success && firestoreResult.profile) {
        const newSession: AuthSession = {
          userType: 'client',
          profile: firestoreResult.profile,
          token: `firebase_token_${firestoreResult.profile.profileId}_${Date.now()}`,
          loginTime: new Date().toISOString(),
          rememberMe
        };
        persistSession(newSession, rememberMe);
        setAuthView('app');
        setAuthDatabase(prev => {
          const merged = mergeProfiles([firestoreResult.profile!], prev);
          saveAuthDatabase(merged);
          return merged;
        });
        return { success: true, status: 'active', profile: firestoreResult.profile };
      } else if (firestoreResult.status === 'inactive' && firestoreResult.profile) {
        setInactiveProfileDetails(firestoreResult.profile);
        setInactiveModalOpen(true);
        return {
          success: false,
          status: 'inactive',
          error: firestoreResult.error || 'Your account is currently inactive. Please contact support.',
          profile: firestoreResult.profile
        };
      }
    } catch (firebaseErr) {
      console.warn('Direct Firestore login check notice:', firebaseErr);
    }

    // 2. Direct Server API verification (SECONDARY)
    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const newSession: AuthSession = {
            userType: 'client',
            profile: data.profile,
            token: data.token || `token_${data.profile.profileId}_${Date.now()}`,
            loginTime: new Date().toISOString(),
            rememberMe
          };
          persistSession(newSession, rememberMe);
          setAuthView('app');
          setAuthDatabase(prev => {
            const merged = mergeProfiles([data.profile], prev);
            saveAuthDatabase(merged);
            return merged;
          });
          return { success: true, status: 'active', profile: data.profile };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403 && errData.status === 'inactive') {
          setInactiveProfileDetails(errData.profile || null);
          setInactiveModalOpen(true);
          return {
            success: false,
            status: 'inactive',
            error: errData.error || 'Your account is currently inactive. Please contact support.',
            profile: errData.profile
          };
        }
        if (res.status === 401) {
          return {
            success: false,
            status: 'invalid',
            error: errData.error || 'Invalid email or password. Please verify your credentials.'
          };
        }
      }
    } catch (apiErr) {
      console.warn('Server auth endpoint unreachable, checking synchronized pool:', apiErr);
    }

    // 3. Local Synchronized Pool Check (TERTIARY FALLBACK)
    const allProfiles = [
      ...authDatabase.profiles,
      ...DEFAULT_REGISTERED_PROFILES
    ];

    const matchedProfile = allProfiles.find(
      p => p.email.toLowerCase() === cleanEmail && p.password === cleanPassword
    );

    if (!matchedProfile) {
      const emailExists = allProfiles.some(p => p.email.toLowerCase() === cleanEmail);
      if (emailExists) {
        return {
          success: false,
          status: 'invalid',
          error: 'Incorrect password for this account. Please verify case-sensitivity.'
        };
      }

      return {
        success: false,
        status: 'invalid',
        error: 'No registered client profile found for this email address.'
      };
    }

    if (matchedProfile.status === 'inactive') {
      setInactiveProfileDetails(matchedProfile);
      setInactiveModalOpen(true);
      return {
        success: false,
        status: 'inactive',
        error: 'Your account is currently inactive. Please contact support.',
        profile: matchedProfile
      };
    }

    // Successful fallback match
    const newSession: AuthSession = {
      userType: 'client',
      profile: matchedProfile,
      token: `token_${matchedProfile.profileId}_${Date.now()}`,
      loginTime: new Date().toISOString(),
      rememberMe
    };

    persistSession(newSession, rememberMe);
    setAuthView('app');
    return { success: true, status: 'active', profile: matchedProfile };
  };

  const loginAdmin = async (email: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const newSession: AuthSession = {
          userType: 'admin',
          admin: data.admin || authDatabase.admin,
          token: data.token || `admin_token_${Date.now()}`,
          loginTime: new Date().toISOString(),
          rememberMe
        };
        persistSession(newSession, rememberMe);
        setAuthView('admin_dashboard');
        return { success: true };
      }
      if (data.error) {
        return { success: false, error: data.error };
      }
    } catch (e) {
      console.warn('Server admin login fallback:', e);
    }

    if (
      cleanEmail === authDatabase.admin.email.toLowerCase() &&
      cleanPassword === authDatabase.admin.password
    ) {
      const newSession: AuthSession = {
        userType: 'admin',
        admin: authDatabase.admin,
        token: `admin_token_${Date.now()}`,
        loginTime: new Date().toISOString(),
        rememberMe
      };

      persistSession(newSession, rememberMe);
      setAuthView('admin_dashboard');
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid admin credentials. Please check your admin email and password.'
    };
  };

  const logout = () => {
    persistSession(null);
    setAuthView('client_login');
  };

  // Impersonate / Preview Client Profile from Admin Dashboard
  const impersonateClient = (profileId: string) => {
    const profile = authDatabase.profiles.find(p => p.profileId === profileId) ||
      DEFAULT_REGISTERED_PROFILES.find(p => p.profileId === profileId);
    if (!profile) return;

    const newSession: AuthSession = {
      userType: 'client',
      profile,
      token: `impersonate_${profileId}_${Date.now()}`,
      loginTime: new Date().toISOString(),
      rememberMe: false
    };

    persistSession(newSession, false);
    setAuthView('app');
  };

  const returnToAdmin = () => {
    const newSession: AuthSession = {
      userType: 'admin',
      admin: authDatabase.admin,
      token: `admin_token_${Date.now()}`,
      loginTime: new Date().toISOString(),
      rememberMe: true
    };
    persistSession(newSession, true);
    setAuthView('admin_dashboard');
  };

  /**
   * Create Client Profile: Synchronously writes to Firebase Firestore Online Database + Server DB + Local Cache
   */
  const createClientProfile = async (
    profileData: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }
  ): Promise<ClientProfile> => {
    const profileId = profileData.profileId || generateNextProfileId(authDatabase.profiles);
    const today = new Date().toISOString().split('T')[0];

    const newProfile: ClientProfile = {
      ...profileData,
      profileId,
      createdAt: today,
      status: profileData.status || 'active',
      plan: profileData.plan || 'Premium',
      customSettings: profileData.customSettings || {
        salonName: profileData.businessName,
        name: `${profileData.businessName} Studio`,
        email: profileData.email,
        phone: profileData.phoneNumber || '(555) 000-0000',
        colorTheme: 'terracotta'
      }
    };

    // 1. Immediately update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: [newProfile, ...prev.profiles.filter(p => p.profileId !== profileId)],
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 2. Persist to Online Firebase Firestore Database (Direct Cloud write)
    try {
      await saveProfileToFirestore(newProfile);
    } catch (err) {
      console.warn('Firestore direct write notice:', err);
    }

    // 3. Persist to server backend database (which also updates all server code files)
    try {
      const res = await fetch('/api/auth/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.database) {
          setAuthDatabase(result.database);
          saveAuthDatabase(result.database);
        }
      }
    } catch (err) {
      console.error('Server save notice:', err);
    }

    return newProfile;
  };

  /**
   * Update Client Profile: Synchronously writes edits to Firebase Firestore Online Database + Server DB + Local Cache
   */
  const updateClientProfile = async (profileId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
    // 1. Find existing profile in state or defaults
    const existing = authDatabase.profiles.find(p => p.profileId === profileId) ||
      DEFAULT_REGISTERED_PROFILES.find(p => p.profileId === profileId);

    if (!existing) {
      console.error(`Cannot find profile ${profileId} to update.`);
      return false;
    }

    // 2. Create the fully merged profile object synchronously
    const updatedProfile: ClientProfile = {
      ...existing,
      ...updates,
      customSettings: {
        ...(existing.customSettings || {}),
        ...(updates.customSettings || {}),
        salonName: updates.businessName || existing.customSettings?.salonName || existing.businessName,
        email: updates.email || existing.email,
        phone: updates.phoneNumber || existing.phoneNumber
      }
    };

    // 3. Update local state immediately
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 4. If current session is this client, update session
    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setSession(prev => prev ? { ...prev, profile: updatedProfile } : null);
    }

    // 5. Persist to Online Firebase Firestore Database (Direct Cloud write)
    try {
      await saveProfileToFirestore(updatedProfile);
    } catch (err) {
      console.warn('Firestore update write notice:', err);
    }

    // 6. Persist to server backend database
    try {
      const res = await fetch(`/api/auth/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.database) {
          setAuthDatabase(result.database);
        }
      }
    } catch (e) {
      console.error('Server profile update error:', e);
    }

    return true;
  };

  /**
   * Toggle Profile Status: Writes to Firebase Firestore Online Database + Server DB
   */
  const toggleProfileStatus = async (profileId: string): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId) ||
      DEFAULT_REGISTERED_PROFILES.find(p => p.profileId === profileId);

    if (!existing) return false;

    const nextStatus: AccountStatus = existing.status === 'active' ? 'inactive' : 'active';
    const toggledProfile: ClientProfile = {
      ...existing,
      status: nextStatus
    };

    // 1. Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? toggledProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 2. Persist to Firebase Firestore Online Database
    try {
      await saveProfileToFirestore(toggledProfile);
    } catch (err) {
      console.warn('Firestore status toggle notice:', err);
    }

    // 3. Persist to server backend database
    try {
      const res = await fetch(`/api/auth/profiles/${profileId}/toggle-status`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const result = await res.json();
        if (result.database) {
          setAuthDatabase(result.database);
        }
      }
    } catch (e) {
      console.error('Server toggle error:', e);
    }

    return true;
  };

  /**
   * Delete Client Profile: Removes from Firebase Firestore Online Database + Server DB
   */
  const deleteClientProfile = async (profileId: string): Promise<boolean> => {
    // 1. Local delete
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.filter(p => p.profileId !== profileId),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 2. Delete from Firebase Firestore Online Database
    try {
      await deleteProfileFromFirestore(profileId);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }

    // 3. Delete from server backend database
    try {
      const res = await fetch(`/api/auth/profiles/${profileId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const result = await res.json();
        if (result.database) {
          setAuthDatabase(result.database);
        }
      }
    } catch (e) {
      console.error('Server delete error:', e);
    }

    return true;
  };

  const resetAuthDatabase = async () => {
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.database) {
          setAuthDatabase(data.database);
          saveAuthDatabase(data.database);
        }
      }
    } catch (e) {
      setAuthDatabase(INITIAL_AUTH_DATABASE);
      saveAuthDatabase(INITIAL_AUTH_DATABASE);
    }
    // Also re-seed Firestore
    seedFirestoreIfEmpty(DEFAULT_REGISTERED_PROFILES);
  };

  return (
    <AuthContext.Provider
      value={{
        authDatabase,
        session,
        isAuthenticated: !!session,
        isAdmin: session?.userType === 'admin',
        currentProfile: session?.userType === 'client' ? session.profile || null : null,
        currentAdmin: session?.userType === 'admin' ? session.admin || null : null,
        authView,
        setAuthView,
        loginClient,
        loginAdmin,
        logout,
        impersonateClient,
        returnToAdmin,
        refreshServerDatabase,
        createClientProfile,
        updateClientProfile,
        toggleProfileStatus,
        deleteClientProfile,
        resetAuthDatabase,
        inactiveModalOpen,
        setInactiveModalOpen,
        inactiveProfileDetails,
        setInactiveProfileDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
