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

export type AuthViewMode = 'client_login' | 'admin_login' | 'admin_dashboard' | 'app';

interface LoginResult {
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

  // Function to sync with global server-side persistent database
  const refreshServerDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/db');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.profiles)) {
          setAuthDatabase(data);
          saveAuthDatabase(data);
        }
      }
    } catch (err) {
      console.warn('Could not sync with server auth API, using local replica:', err);
    }
  }, []);

  // Sync on mount and periodically every 15 seconds so changes on any device reflect everywhere
  useEffect(() => {
    refreshServerDatabase();
    const interval = setInterval(refreshServerDatabase, 15000);
    return () => clearInterval(interval);
  }, [refreshServerDatabase]);

  // Sync auth database changes to localStorage
  useEffect(() => {
    saveAuthDatabase(authDatabase);
  }, [authDatabase]);

  // Synchronize session when profiles change
  useEffect(() => {
    if (session && session.userType === 'client' && session.profile) {
      const updatedProfile = authDatabase.profiles.find(p => p.profileId === session.profile?.profileId);
      if (updatedProfile) {
        if (updatedProfile.status === 'inactive') {
          // If deactivated by admin while logged in, trigger inactive state
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

  const loginClient = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. First attempt direct Server API verification (worldwide sync)
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const data = await res.json();

      if (res.ok && data.success && data.profile) {
        const newSession: AuthSession = {
          userType: 'client',
          profile: data.profile,
          token: data.token || `token_${data.profile.profileId}_${Date.now()}`,
          loginTime: new Date().toISOString(),
          rememberMe
        };
        persistSession(newSession, rememberMe);
        setAuthView('app');
        return { success: true, status: 'active', profile: data.profile };
      }

      if (res.status === 403 && data.status === 'inactive') {
        setInactiveProfileDetails(data.profile || null);
        setInactiveModalOpen(true);
        return {
          success: false,
          status: 'inactive',
          error: data.error || 'Your account is currently inactive. Please contact support.',
          profile: data.profile
        };
      }

      if (res.status === 401) {
        return {
          success: false,
          status: 'invalid',
          error: data.error || 'Invalid email or password.'
        };
      }
    } catch (apiErr) {
      console.warn('Server auth call failed, checking local database:', apiErr);
    }

    // 2. Fallback to current synchronized state in case server is booting
    const matchedProfile = authDatabase.profiles.find(
      p => p.email.toLowerCase() === cleanEmail && p.password === cleanPassword
    );

    if (!matchedProfile) {
      return {
        success: false,
        status: 'invalid',
        error: 'Invalid email or password.'
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

    const newSession: AuthSession = {
      userType: 'client',
      profile: matchedProfile,
      token: `token_${matchedProfile.profileId}_${Date.now()}`,
      loginTime: new Date().toISOString(),
      rememberMe
    };

    persistSession(newSession, rememberMe);
    setAuthView('app');

    return {
      success: true,
      status: 'active',
      profile: matchedProfile
    };
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

      const data = await res.json();
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
    const profile = authDatabase.profiles.find(p => p.profileId === profileId);
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

    // 1. Immediately update local state for instantaneous UX
    setAuthDatabase(prev => ({
      ...prev,
      profiles: [newProfile, ...prev.profiles.filter(p => p.profileId !== profileId)],
      lastUpdated: new Date().toISOString()
    }));

    // 2. Persist to server backend database for worldwide access
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
      console.error('Server save error, saved locally:', err);
    }

    return newProfile;
  };

  const updateClientProfile = async (profileId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
    // 1. Local update
    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.profileId === profileId) {
          const updated = { ...p, ...updates };
          if (updates.businessName && updated.customSettings) {
            updated.customSettings.salonName = updates.businessName;
          }
          return updated;
        }
        return p;
      }),
      lastUpdated: new Date().toISOString()
    }));

    // 2. Server update
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

  const toggleProfileStatus = async (profileId: string): Promise<boolean> => {
    // 1. Local toggle
    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.profileId === profileId) {
          const nextStatus: AccountStatus = p.status === 'active' ? 'inactive' : 'active';
          return { ...p, status: nextStatus };
        }
        return p;
      }),
      lastUpdated: new Date().toISOString()
    }));

    // 2. Server toggle
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

  const deleteClientProfile = async (profileId: string): Promise<boolean> => {
    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.filter(p => p.profileId !== profileId),
      lastUpdated: new Date().toISOString()
    }));

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
        const result = await res.json();
        if (result.database) {
          setAuthDatabase(result.database);
          saveAuthDatabase(result.database);
          return;
        }
      }
    } catch (e) {
      console.warn('Server reset error:', e);
    }

    setAuthDatabase(INITIAL_AUTH_DATABASE);
    saveAuthDatabase(INITIAL_AUTH_DATABASE);
  };

  const isAuthenticated = !!session;
  const isAdmin = session?.userType === 'admin';
  const currentProfile = session?.profile || null;
  const currentAdmin = session?.admin || null;

  return (
    <AuthContext.Provider
      value={{
        authDatabase,
        session,
        isAuthenticated,
        isAdmin,
        currentProfile,
        currentAdmin,
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
