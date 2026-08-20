import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AuthDatabase, 
  ClientProfile, 
  AdminUser, 
  AuthSession, 
  SubscriptionPlan, 
  AccountStatus,
  AdminNotification,
  NotificationType,
  NotificationPriority
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
  authenticateWithFirestore,
  subscribeToOnlineFirestoreNotifications,
  getOnlineFirestoreNotifications,
  saveNotificationToFirestore,
  deleteNotificationFromFirestore,
  markNotificationReadInFirestore,
  markNotificationDismissedInFirestore
} from '../lib/firebase';
import { 
  FULL_ACCESS_SCREENS, 
  FULL_ACCESS_FEATURES 
} from '../data/permissionPresets';

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

  // Account Deleted Auto-Logout Notice State
  deletedAccountNotice: boolean;
  setDeletedAccountNotice: (open: boolean) => void;

  // Push Notifications & Pop-ups System
  notifications: AdminNotification[];
  clientNotifications: AdminNotification[];
  activePopupsForCurrentProfile: AdminNotification[];
  activeBannersForCurrentProfile: AdminNotification[];
  unreadNotificationsCount: number;
  createAdminNotification: (notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'createdBy' | 'readBy' | 'dismissedBy'>) => Promise<AdminNotification>;
  deleteAdminNotification: (notificationId: string) => Promise<boolean>;
  toggleNotificationStatus: (notificationId: string) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  dismissPopupNotification: (notificationId: string) => Promise<void>;
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
  const [deletedAccountNotice, setDeletedAccountNotice] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Manual refresh from Firestore database
  const refreshServerDatabase = useCallback(async () => {
    try {
      const [onlineList, onlineNotifs] = await Promise.all([
        getOnlineFirestoreProfiles(),
        getOnlineFirestoreNotifications()
      ]);
      
      setAuthDatabase(prev => {
        const updated = {
          ...prev,
          profiles: onlineList,
          lastUpdated: new Date().toISOString()
        };
        saveAuthDatabase(updated);
        return updated;
      });

      if (onlineNotifs && onlineNotifs.length > 0) {
        setNotifications(onlineNotifs);
      }
    } catch (err) {
      console.warn('Direct Firestore fetch error:', err);
    }
  }, []);

  // 1. Subscribe to Real-Time Firebase Firestore Database (Profiles & Notifications)
  useEffect(() => {
    testConnection();

    // Direct Real-time Firestore Snapshot Listener for Profiles
    const unsubscribeProfiles = subscribeToOnlineFirestoreProfiles(
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
        console.warn('Firestore profiles subscription notice:', err);
      }
    );

    // Direct Real-time Firestore Snapshot Listener for Notifications & Pop-ups
    const unsubscribeNotifs = subscribeToOnlineFirestoreNotifications(
      (firestoreNotifs) => {
        setNotifications(firestoreNotifs);
      },
      (err) => {
        console.warn('Firestore notifications subscription notice:', err);
      }
    );

    // Initial load
    refreshServerDatabase();

    return () => {
      if (unsubscribeProfiles) unsubscribeProfiles();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, [refreshServerDatabase]);

  // 2. SIMULTANEOUS AUTO-LOGOUT: Synchronize active session when profiles in Firestore change
  useEffect(() => {
    if (session && session.userType === 'client' && session.profile) {
      const profileId = session.profile.profileId;
      // If we have profiles in database (or database is non-empty)
      if (authDatabase.profiles && authDatabase.profiles.length > 0) {
        const updatedProfile = authDatabase.profiles.find(p => p.profileId === profileId);
        
        if (updatedProfile) {
          if (updatedProfile.status === 'inactive') {
            setInactiveProfileDetails(updatedProfile);
            setInactiveModalOpen(true);
            logout();
          } else {
            // Keep active session in sync with any profile edits if there are changes
            setSession(prev => {
              if (!prev || JSON.stringify(prev.profile) === JSON.stringify(updatedProfile)) {
                return prev;
              }
              return { ...prev, profile: updatedProfile };
            });
          }
        } else {
          // PROFILE WAS DELETED FROM DATABASE!
          // Immediately perform simultaneous logout and display notice!
          console.warn(`Profile ${profileId} no longer exists in Firestore. Triggering simultaneous logout.`);
          setDeletedAccountNotice(true);
          logout();
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

    // Check local snapshot as fallback
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
   * Create Client Profile: Saved to Firebase Firestore
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
      permissions: profileData.permissions || {
        isTrialMode: false,
        trialTierName: profileData.plan ? `${profileData.plan} Tier` : 'Standard',
        trialMessage: '',
        screens: { ...FULL_ACCESS_SCREENS },
        features: { ...FULL_ACCESS_FEATURES }
      },
      customSettings: profileData.customSettings || {
        salonName: profileData.businessName,
        name: `${profileData.businessName} Studio`,
        email: profileData.email,
        phone: profileData.phoneNumber || '(555) 000-0000',
        colorTheme: 'terracotta'
      }
    };

    // Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: [newProfile, ...prev.profiles.filter(p => p.profileId !== profileId)],
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // Persist to Firebase Firestore
    await saveProfileToFirestore(newProfile);

    return newProfile;
  };

  /**
   * Update Client Profile: Saved to Firebase Firestore
   */
  const updateClientProfile = async (profileId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!existing) {
      console.error(`Cannot find profile ${profileId} to update.`);
      return false;
    }

    const updatedProfile: ClientProfile = {
      ...existing,
      ...updates,
      permissions: updates.permissions !== undefined 
        ? {
            isTrialMode: updates.permissions.isTrialMode ?? false,
            trialTierName: updates.permissions.trialTierName || (existing.permissions?.trialTierName || 'Standard'),
            trialMessage: updates.permissions.trialMessage !== undefined ? updates.permissions.trialMessage : (existing.permissions?.trialMessage || ''),
            screens: {
              ...FULL_ACCESS_SCREENS,
              ...(existing.permissions?.screens || {}),
              ...(updates.permissions.screens || {})
            },
            features: {
              ...FULL_ACCESS_FEATURES,
              ...(existing.permissions?.features || {}),
              ...(updates.permissions.features || {})
            }
          }
        : existing.permissions,
      customSettings: {
        ...(existing.customSettings || {}),
        ...(updates.customSettings || {}),
        salonName: updates.businessName || existing.customSettings?.salonName || existing.businessName,
        email: updates.email || existing.email || existing.customSettings?.email || '',
        phone: updates.phoneNumber || existing.phoneNumber || existing.customSettings?.phone || ''
      }
    };

    // Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setSession(prev => prev ? { ...prev, profile: updatedProfile } : null);
    }

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Toggle Profile Status: Saved to Firebase Firestore
   */
  const toggleProfileStatus = async (profileId: string): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!existing) return false;

    const nextStatus: AccountStatus = existing.status === 'active' ? 'inactive' : 'active';
    const toggledProfile: ClientProfile = {
      ...existing,
      status: nextStatus
    };

    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? toggledProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // If currently logged in as this client and set to inactive, trigger logout
    if (nextStatus === 'inactive' && session?.userType === 'client' && session.profile?.profileId === profileId) {
      setInactiveProfileDetails(toggledProfile);
      setInactiveModalOpen(true);
      logout();
    }

    await saveProfileToFirestore(toggledProfile);
    return true;
  };

  /**
   * Delete Client Profile: Directly removed from Firebase Firestore & Auto-Logout active session
   */
  const deleteClientProfile = async (profileId: string): Promise<boolean> => {
    // 1. If currently logged in as this client profile, immediately trigger auto-logout!
    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setDeletedAccountNotice(true);
      logout();
    }

    // 2. Local state delete
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.filter(p => p.profileId !== profileId),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 3. Remove from Firebase Firestore Online Database
    await deleteProfileFromFirestore(profileId);

    return true;
  };

  const resetAuthDatabase = async () => {
    await refreshServerDatabase();
  };

  // -------------------------------------------------------------
  // PUSH NOTIFICATIONS & POP-UPS SYSTEM METHODS
  // -------------------------------------------------------------

  const currentClientProfileId = session?.userType === 'client' ? session.profile?.profileId : null;

  // Filter notifications applicable for the currently logged in client profile
  const clientNotifications = useMemo(() => {
    if (!currentClientProfileId) return [];
    return notifications.filter(n => {
      if (!n.isActive) return false;
      if (n.targetType === 'all') return true;
      return n.targetProfileId === currentClientProfileId;
    });
  }, [notifications, currentClientProfileId]);

  // Active Popup Modals that have not yet been dismissed by this client
  const activePopupsForCurrentProfile = useMemo(() => {
    if (!currentClientProfileId) return [];
    return clientNotifications.filter(n => {
      if (n.type !== 'popup') return false;
      const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
      return !dismissed.includes(currentClientProfileId);
    });
  }, [clientNotifications, currentClientProfileId]);

  // Active Banners
  const activeBannersForCurrentProfile = useMemo(() => {
    if (!currentClientProfileId) return [];
    return clientNotifications.filter(n => {
      if (n.type !== 'banner') return false;
      const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
      return !dismissed.includes(currentClientProfileId);
    });
  }, [clientNotifications, currentClientProfileId]);

  // Unread Count
  const unreadNotificationsCount = useMemo(() => {
    if (!currentClientProfileId) return 0;
    return clientNotifications.filter(n => {
      const read = Array.isArray(n.readBy) ? n.readBy : [];
      return !read.includes(currentClientProfileId);
    }).length;
  }, [clientNotifications, currentClientProfileId]);

  /**
   * Create Admin Broadcast / Push Notification / Pop-up
   */
  const createAdminNotification = async (
    notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'createdBy' | 'readBy' | 'dismissedBy'>
  ): Promise<AdminNotification> => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AdminNotification = {
      ...notifData,
      id,
      createdAt: new Date().toISOString(),
      createdBy: authDatabase.admin.email || 'Admin',
      readBy: [],
      dismissedBy: [],
      isActive: notifData.isActive !== undefined ? notifData.isActive : true
    };

    setNotifications(prev => [newNotif, ...prev]);
    await saveNotificationToFirestore(newNotif);
    return newNotif;
  };

  /**
   * Delete Admin Notification from Firestore
   */
  const deleteAdminNotification = async (notificationId: string): Promise<boolean> => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    await deleteNotificationFromFirestore(notificationId);
    return true;
  };

  /**
   * Toggle Notification active status
   */
  const toggleNotificationStatus = async (notificationId: string): Promise<boolean> => {
    const existing = notifications.find(n => n.id === notificationId);
    if (!existing) return false;

    const updated: AdminNotification = {
      ...existing,
      isActive: !existing.isActive
    };

    setNotifications(prev => prev.map(n => n.id === notificationId ? updated : n));
    await saveNotificationToFirestore(updated);
    return true;
  };

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!currentClientProfileId) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        const readBy = Array.isArray(n.readBy) ? n.readBy : [];
        if (!readBy.includes(currentClientProfileId)) {
          return { ...n, readBy: [...readBy, currentClientProfileId] };
        }
      }
      return n;
    }));
    await markNotificationReadInFirestore(notificationId, currentClientProfileId);
  };

  /**
   * Dismiss a popup modal notification
   */
  const dismissPopupNotification = async (notificationId: string): Promise<void> => {
    if (!currentClientProfileId) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        const dismissedBy = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
        const readBy = Array.isArray(n.readBy) ? n.readBy : [];
        return {
          ...n,
          dismissedBy: dismissedBy.includes(currentClientProfileId) ? dismissedBy : [...dismissedBy, currentClientProfileId],
          readBy: readBy.includes(currentClientProfileId) ? readBy : [...readBy, currentClientProfileId]
        };
      }
      return n;
    }));
    await markNotificationDismissedInFirestore(notificationId, currentClientProfileId);
  };

  return (
    <AuthContext.Provider
      value={{
        authDatabase,
        session,
        isAuthenticated: !!session,
        isAdmin: session?.userType === 'admin',
        currentProfile: session?.userType === 'client' 
          ? (authDatabase.profiles.find(p => p.profileId === session.profile?.profileId) || session.profile || null) 
          : null,
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
        setInactiveProfileDetails,
        deletedAccountNotice,
        setDeletedAccountNotice,
        notifications,
        clientNotifications,
        activePopupsForCurrentProfile,
        activeBannersForCurrentProfile,
        unreadNotificationsCount,
        createAdminNotification,
        deleteAdminNotification,
        toggleNotificationStatus,
        markNotificationAsRead,
        dismissPopupNotification
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
