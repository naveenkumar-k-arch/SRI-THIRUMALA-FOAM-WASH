import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, IdTokenResult } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { isConfiguredSuperAdminEmail } from '../config/adminConfig';
import type { UserRole, JWTMeta } from '../types';

// ─── Firestore User Profile Shape ───────────────────────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  createdAt: any;
  provider: 'email' | 'google';
  role: UserRole;
  lastLogin?: any;
}

// ─── Context Type ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  jwtMeta: JWTMeta | null;
  loading: boolean;
  refreshToken: (forceRefresh?: boolean) => Promise<string | null>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    phone: string,
    explicitRole?: UserRole
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jwtMeta, setJwtMeta] = useState<JWTMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract and update signed JWT ID Token metadata in memory (ZERO LocalStorage)
  const extractJwtMeta = useCallback(async (u: User, forceRefresh = false): Promise<JWTMeta | null> => {
    try {
      const idTokenResult: IdTokenResult = await u.getIdTokenResult(forceRefresh);
      const token = await u.getIdToken(forceRefresh);

      const meta: JWTMeta = {
        token,
        issuedAt: idTokenResult.issuedAtTime ? new Date(idTokenResult.issuedAtTime) : null,
        expirationTime: idTokenResult.expirationTime ? new Date(idTokenResult.expirationTime) : null,
        authTime: idTokenResult.authTime ? new Date(idTokenResult.authTime) : null,
        claims: idTokenResult.claims || {}
      };

      setJwtMeta(meta);
      return meta;
    } catch (err) {
      console.error('Error extracting JWT ID token:', err);
      return null;
    }
  }, []);

  // Live Database Verification against Firestore `users/{uid}`
  const fetchUserProfile = useCallback(async (u: User) => {
    try {
      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);
      const isSuperAdminUser = isConfiguredSuperAdminEmail(u.email);

      // Extract fresh cryptographically signed JWT token
      await extractJwtMeta(u, false);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        
        // If designated super admin, guarantee SUPER_ADMIN role in database
        if (isSuperAdminUser && data.role !== 'SUPER_ADMIN') {
          await setDoc(ref, { role: 'SUPER_ADMIN', lastLogin: serverTimestamp() }, { merge: true });
          data.role = 'SUPER_ADMIN';
        } else {
          // Update last login timestamp in Firestore
          await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
        }

        setUserProfile(data);
      } else {
        // Provision Firestore DB profile if not exists
        const initialRole: UserRole = isSuperAdminUser ? 'SUPER_ADMIN' : 'USER';
        const newProfile: UserProfile = {
          uid: u.uid,
          name: u.displayName || (isSuperAdminUser ? 'Super Administrator' : 'User'),
          email: u.email || '',
          phone: u.phoneNumber || '',
          photoURL: u.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: (u.providerData?.[0]?.providerId?.includes('google') ? 'google' : 'email') as 'email' | 'google',
          role: initialRole
        };
        await setDoc(ref, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error verifying user role from Firestore DB:', err);
    }
  }, [extractJwtMeta]);

  // Listen for auth state changes across memory sessions
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchUserProfile(u);
      } else {
        setUserProfile(null);
        setJwtMeta(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchUserProfile]);

  // Periodic JWT token heartbeat (rotates token before expiration)
  useEffect(() => {
    if (!user) return;
    // Rotate JWT every 45 minutes
    const interval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await extractJwtMeta(auth.currentUser, true);
        }
      } catch (err) {
        console.error('JWT rotation heartbeat error:', err);
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, extractJwtMeta]);

  // Force token refresh on demand
  const refreshToken = async (forceRefresh = true): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      const meta = await extractJwtMeta(auth.currentUser, forceRefresh);
      return meta?.token || null;
    } catch (err) {
      console.error('Forced token refresh failed:', err);
      return null;
    }
  };

  // Derive verified RBAC status strictly from verified DB profile or designated Super Admin
  const isSuperAdmin = Boolean(
    userProfile?.role === 'SUPER_ADMIN' ||
    (isConfiguredSuperAdminEmail(user?.email) && user !== null)
  );

  const isAdmin = Boolean(
    isSuperAdmin ||
    userProfile?.role === 'ADMIN'
  );

  const userRole: UserRole = isSuperAdmin
    ? 'SUPER_ADMIN'
    : userProfile?.role === 'ADMIN'
    ? 'ADMIN'
    : 'USER';

  // ── Sign Up with Email & Password ─────────────────────────────────────────
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    explicitRole?: UserRole
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    const isSuper = isConfiguredSuperAdminEmail(email);
    const assignedRole: UserRole = explicitRole || (isSuper ? 'SUPER_ADMIN' : 'USER');

    const profile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      photoURL: '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      provider: 'email',
      role: assignedRole
    };

    await setDoc(doc(db, 'users', cred.user.uid), profile);
    await extractJwtMeta(cred.user, true);
    setUserProfile(profile);
  };

  // ── Sign In with Email & Password ─────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await extractJwtMeta(cred.user, true);
    await fetchUserProfile(cred.user);
  };

  // ── Sign In with Google ───────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    const isSuper = isConfiguredSuperAdminEmail(cred.user.email);
    await extractJwtMeta(cred.user, true);

    if (!snap.exists()) {
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: cred.user.displayName || (isSuper ? 'Super Administrator' : ''),
        email: cred.user.email || '',
        phone: '',
        photoURL: cred.user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        provider: 'google',
        role: isSuper ? 'SUPER_ADMIN' : 'USER'
      };
      await setDoc(ref, profile);
      setUserProfile(profile);
    } else {
      const data = snap.data() as UserProfile;
      if (isSuper && data.role !== 'SUPER_ADMIN') {
        await setDoc(ref, { role: 'SUPER_ADMIN', lastLogin: serverTimestamp() }, { merge: true });
        data.role = 'SUPER_ADMIN';
      } else {
        await setDoc(ref, { lastLogin: serverTimestamp() }, { merge: true });
      }
      setUserProfile(data);
    }
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
    setJwtMeta(null);
  };

  // ── Password Reset Email ──────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userRole,
        isSuperAdmin,
        isAdmin,
        jwtMeta,
        loading,
        refreshToken,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
