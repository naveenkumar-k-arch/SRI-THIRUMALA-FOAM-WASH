import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
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

import { isConfiguredAdminEmail } from '../config/adminConfig';

// ─── Firestore User Profile Shape ───────────────────────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL: string;
  createdAt: any;
  provider: 'email' | 'google';
  role?: 'admin' | 'user';
}

// ─── Context Type ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, name: string, phone: string, role?: 'admin' | 'user') => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Fetch Firestore profile for a logged-in user
  const fetchUserProfile = async (u: User) => {
    try {
      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);
      const isEmailAdmin = isConfiguredAdminEmail(u.email);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // If the user matches the configured admin email but doesn't have the admin role in Firestore, update it
        if (isEmailAdmin && data.role !== 'admin') {
          await setDoc(ref, { role: 'admin' }, { merge: true });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // Create profile if missing
        const newProfile: UserProfile = {
          uid: u.uid,
          name: u.displayName || (isEmailAdmin ? 'Administrator' : 'User'),
          email: u.email || '',
          phone: u.phoneNumber || '',
          photoURL: u.photoURL || '',
          createdAt: serverTimestamp(),
          provider: (u.providerData?.[0]?.providerId?.includes('google') ? 'google' : 'email') as 'email' | 'google',
          role: isEmailAdmin ? 'admin' : 'user'
        };
        await setDoc(ref, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Listen for auth state changes (persists across reloads)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchUserProfile(u);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Compute whether the current logged-in user has admin privileges
  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    isConfiguredAdminEmail(user?.email)
  );

  // ── Sign Up with Email & Password ─────────────────────────────────────────
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    explicitRole?: 'admin' | 'user'
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name on Firebase Auth user
    await updateProfile(cred.user, { displayName: name });
    
    const assignedRole = explicitRole || (isConfiguredAdminEmail(email) ? 'admin' : 'user');

    // Save full profile to Firestore
    const profile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      photoURL: '',
      createdAt: serverTimestamp(),
      provider: 'email',
      role: assignedRole
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
  };

  // ── Sign In with Email & Password ─────────────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will trigger fetchUserProfile automatically
  };

  // ── Sign In with Google ───────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    const isEmailAdmin = isConfiguredAdminEmail(cred.user.email);

    if (!snap.exists()) {
      // First time Google sign-in → create Firestore profile
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: cred.user.displayName || (isEmailAdmin ? 'Administrator' : ''),
        email: cred.user.email || '',
        phone: '',
        photoURL: cred.user.photoURL || '',
        createdAt: serverTimestamp(),
        provider: 'google',
        role: isEmailAdmin ? 'admin' : 'user'
      };
      await setDoc(ref, profile);
      setUserProfile(profile);
    } else {
      const data = snap.data() as UserProfile;
      if (isEmailAdmin && data.role !== 'admin') {
        await setDoc(ref, { role: 'admin' }, { merge: true });
        data.role = 'admin';
      }
      setUserProfile(data);
    }
  };

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
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
        isAdmin,
        loading,
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
