import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClientProfile } from '../types/auth';

// 1. Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with specific firestoreDatabaseId (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 3. Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Test Connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully connected to live Firebase Firestore database!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
    } else {
      console.log('Firebase connection initialized.');
    }
    return false;
  }
}

// 5. Firestore Collection References
export const PROFILES_COLLECTION = 'client_profiles';
export const ADMIN_COLLECTION = 'admin_config';

/**
 * Seed Firestore with initial profiles if collection is empty
 */
export async function seedFirestoreIfEmpty(initialProfiles: ClientProfile[]): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    if (snap.empty && initialProfiles.length > 0) {
      console.log(`Seeding ${initialProfiles.length} profiles to online Firestore database...`);
      const batch = writeBatch(db);
      initialProfiles.forEach(p => {
        const ref = doc(db, PROFILES_COLLECTION, p.profileId);
        batch.set(ref, p);
      });
      await batch.commit();
      console.log('Firestore online database seeded successfully with all client profiles.');
    }
  } catch (err) {
    console.warn('Could not auto-seed Firestore (will retry on mutation):', err);
  }
}

/**
 * Fetch all client profiles directly from Firestore online database
 */
export async function getOnlineFirestoreProfiles(): Promise<ClientProfile[]> {
  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    const profiles: ClientProfile[] = [];
    snap.forEach(docSnap => {
      profiles.push(docSnap.data() as ClientProfile);
    });
    return profiles;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, PROFILES_COLLECTION);
    return [];
  }
}

/**
 * Save or Update a client profile in Firestore online database
 */
export async function saveProfileToFirestore(profile: ClientProfile): Promise<void> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, profile.profileId);
    await setDoc(ref, profile, { merge: true });
    console.log(`Saved/Updated profile ${profile.profileId} (${profile.businessName}) to online Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PROFILES_COLLECTION}/${profile.profileId}`);
  }
}

/**
 * Delete a client profile from Firestore online database
 */
export async function deleteProfileFromFirestore(profileId: string): Promise<void> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, profileId);
    await deleteDoc(ref);
    console.log(`Deleted profile ${profileId} from online Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PROFILES_COLLECTION}/${profileId}`);
  }
}

/**
 * Direct Firebase Firestore Authentication for Client Login
 */
export async function authenticateWithFirestore(
  email: string, 
  password: string
): Promise<{ 
  success: boolean; 
  profile?: ClientProfile; 
  status?: 'active' | 'inactive' | 'invalid'; 
  error?: string 
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    let matchedProfile: ClientProfile | null = null;
    let foundEmail = false;

    snap.forEach(docSnap => {
      const p = docSnap.data() as ClientProfile;
      if (p.email && p.email.trim().toLowerCase() === cleanEmail) {
        foundEmail = true;
        if (p.password === cleanPass) {
          matchedProfile = p;
        }
      }
    });

    if (matchedProfile) {
      const p = matchedProfile as ClientProfile;
      if (p.status === 'inactive') {
        return {
          success: false,
          status: 'inactive',
          profile: p,
          error: 'Your account is currently inactive. Please contact support.'
        };
      }
      return {
        success: true,
        status: 'active',
        profile: p
      };
    }

    if (foundEmail) {
      return {
        success: false,
        status: 'invalid',
        error: 'Incorrect password for this account. Please check case sensitivity.'
      };
    }
  } catch (err) {
    console.warn('Direct Firestore authentication notice:', err);
  }

  return {
    success: false,
    status: 'invalid',
    error: 'No registered client profile found for this email address.'
  };
}

/**
 * Real-time listener for Firestore profiles across all connected devices
 */
export function subscribeToOnlineFirestoreProfiles(
  onUpdate: (profiles: ClientProfile[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, PROFILES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ClientProfile[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ClientProfile);
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      console.warn('Firestore realtime snapshot listener notice:', error);
      if (onError) onError(error);
    }
  );
}
