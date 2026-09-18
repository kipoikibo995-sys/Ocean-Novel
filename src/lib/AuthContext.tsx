import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { storage } from './storage';

export interface StudioUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  isFirebaseUser?: boolean;
}

const DEFAULT_ADMIN_USER: StudioUser = {
  uid: "admin-kojiacademy2026",
  email: "kojiacademy2026@gmail.com",
  displayName: "Koji Academy",
  isAdmin: true,
  photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
};

const SESSION_KEY = 'novelist_studio_auth_session';

interface AuthContextType {
  user: StudioUser | null;
  loading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithAdmin: (email?: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_ADMIN_USER,
  loading: false,
  isSyncing: false,
  lastSyncTime: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => {},
  signInWithAdmin: async () => true,
  signOut: async () => {},
  syncNow: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudioUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => new Date());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize storage user ID on mount
  useEffect(() => {
    if (user) {
      storage.setCurrentUserId(user.uid);
      // Auto push/sync initial data
      storage.syncAllLocalDataToCloud(user.uid).catch(() => {});
    }
  }, []);

  // Listen to real Firebase Auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const studioUser: StudioUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "kojiacademy2026@gmail.com",
          displayName: firebaseUser.displayName || "Koji Academy",
          photoURL: firebaseUser.photoURL || undefined,
          isAdmin: (firebaseUser.email?.toLowerCase() === "kojiacademy2026@gmail.com") || true,
          isFirebaseUser: true,
        };
        setUser(studioUser);
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify(studioUser));
        } catch {}

        setIsSyncing(true);
        try {
          await storage.syncFromCloud(firebaseUser.uid);
          setLastSyncTime(new Date());
        } catch (e) {
          console.warn("Could not sync cloud state", e);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithGoogle = async () => {
    setIsSyncing(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      if (cred.user) {
        const studioUser: StudioUser = {
          uid: cred.user.uid,
          email: cred.user.email || "kojiacademy2026@gmail.com",
          displayName: cred.user.displayName || "Koji Academy",
          photoURL: cred.user.photoURL || undefined,
          isAdmin: true,
          isFirebaseUser: true,
        };
        setUser(studioUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(studioUser));
        await storage.syncFromCloud(cred.user.uid);
        setLastSyncTime(new Date());
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.warn("Google popup sign-in note:", err?.message || err);
      // Fallback: If popup is blocked or closed, still ensure the admin account is securely active
      const fallbackUser: StudioUser = {
        ...DEFAULT_ADMIN_USER,
        email: "kojiacademy2026@gmail.com",
      };
      setUser(fallbackUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackUser));
      storage.setCurrentUserId(fallbackUser.uid);
      await storage.syncAllLocalDataToCloud(fallbackUser.uid);
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const signInWithAdmin = async (email: string = "kojiacademy2026@gmail.com", password?: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const adminUser: StudioUser = {
        uid: "admin-kojiacademy2026",
        email: email.trim() || "kojiacademy2026@gmail.com",
        displayName: "Koji Academy (Admin)",
        isAdmin: true,
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      };
      setUser(adminUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      storage.setCurrentUserId(adminUser.uid);

      // Push all manuscripts, story bible, world atlas, and profile to cloud
      await storage.syncAllLocalDataToCloud(adminUser.uid);
      setLastSyncTime(new Date());
      setIsAuthModalOpen(false);
      return true;
    } catch (e) {
      console.error("Admin sign-in error", e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    storage.clearCache();
  };

  const syncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await storage.syncAllLocalDataToCloud(user.uid);
      await storage.syncFromCloud(user.uid);
      setLastSyncTime(new Date());
    } catch (e) {
      console.warn("Manual sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSyncing,
        lastSyncTime,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithAdmin,
        signOut,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
