import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBCFT7NhsCCwrBUzhQ_fw2Wxp7b-KkElo4",
  authDomain: "foam-wash-ae062.firebaseapp.com",
  projectId: "foam-wash-ae062",
  storageBucket: "foam-wash-ae062.firebasestorage.app",
  messagingSenderId: "680799048016",
  appId: "1:680799048016:web:183551a7184569ab635c55",
  measurementId: "G-1VPPS4C477"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
