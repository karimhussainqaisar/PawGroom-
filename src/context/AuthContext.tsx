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
import { 
  testConnection, 
  subscribeToOnlineFirestoreProfiles, 
  getOnlineFirestoreProfiles,
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

  // Manual refresh from Firestore database
  const refreshServerDatabase = useCallback(async () => {
    try {
      const onlineList = await getOnlineFirestoreProfiles();
      setAuthDatabase(prev => {
        const updated = {
          ...prev,
          profiles: onlineList,
          lastUpdated: new Date().toISOString()
        };
        saveAuthDatabase(updated);
        return updated;
      });
    } catch (err) {
      console.warn('Direct Firestore fetch error:', err);
    }
  }, []);

  // 1. Subscribe to Real-Time Firebase Firestore Database
  useEffect(() => {
    testConnection();

    // Direct Real-time Firestore Snapshot Listener
    // Any manual changes made in the Firebase Console or Admin Panel are pushed immediately!
    const unsubscribe = subscribeToOnlineFirestoreProfiles(
      (firestoreProfiles) => {
        setAuthDatabase(prev => {
          const updated = {
            ...prev,
            profiles: firestoreProfiles,
            lastUpdated: new Date().toISOString()
          };
          saveAuthDatabase(updated);
          return updated;
        });
      },
      (err) => {
        console.warn('Firestore subscription status:', err);
      }
    );

    // Initial load
    refreshServerDatabase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [refreshServerDatabase]);

  // Synchronize active session when profiles in Firestore change
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
   * Client Login: Authenticates directly against the live Firebase Firestore Database
   */
  const loginClient = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct Firebase Firestore Online Database Authentication
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
      } else if (firestoreResult.error) {
        return {
          success: false,
          status: 'invalid',
          error: firestoreResult.error
        };
      }
    } catch (firebaseErr) {
      console.warn('Direct Firestore authentication exception:', firebaseErr);
    }

    // 2. Check local synchronized Firestore snapshot cache as fallback
    const matchedProfile = authDatabase.profiles.find(
      p => p.email.toLowerCase() === cleanEmail && p.password === cleanPassword
    );

    if (!matchedProfile) {
      const emailExists = authDatabase.profiles.some(p => p.email.toLowerCase() === cleanEmail);
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
        error: 'No registered client profile found in Firebase database for this email address.'
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

  /**
   * Create Client Profile: Directly saved to Firebase Firestore Online Database
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

    // 2. Persist to Firebase Firestore Online Database
    await saveProfileToFirestore(newProfile);

    return newProfile;
  };

  /**
   * Update Client Profile: Directly saved to Firebase Firestore Online Database
   */
  const updateClientProfile = async (profileId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!existing) {
      console.error(`Cannot find profile ${profileId} to update in Firebase list.`);
      return false;
    }

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

    // 1. Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 2. If current session is this client, update session
    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setSession(prev => prev ? { ...prev, profile: updatedProfile } : null);
    }

    // 3. Persist to Firebase Firestore Online Database
    await saveProfileToFirestore(updatedProfile);

    return true;
  };

  /**
   * Toggle Profile Status: Directly saved to Firebase Firestore Online Database
   */
  const toggleProfileStatus = async (profileId: string): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
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
    await saveProfileToFirestore(toggledProfile);

    return true;
  };

  /**
   * Delete Client Profile: Directly removed from Firebase Firestore Online Database
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
    await deleteProfileFromFirestore(profileId);

    return true;
  };

  const resetAuthDatabase = async () => {
    // Refresh from live Firestore database
    await refreshServerDatabase();
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
