import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_CONFIG } from '../config/adminConfig';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const { user, isAdmin, signInWithEmail, signUpWithEmail, signOut, loading: authLoading } = useAuth();

  const [email, setEmail] = useState(ADMIN_CONFIG.adminEmail || '');
  const [password, setPassword] = useState(ADMIN_CONFIG.adminPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isInitMode, setIsInitMode] = useState(false);

  // If already logged in and verified as admin, proceed to dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      onLoginSuccess();
    }
  }, [user, isAdmin, authLoading, onLoginSuccess]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both administrative email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isInitMode) {
        // Initialize / Register designated admin account
        await signUpWithEmail(cleanEmail, password, 'Super Admin', '9999999999', 'admin');
        setSuccessMsg('Admin credentials created and verified! Redirecting...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      } else {
        // Sign in existing admin
        await signInWithEmail(cleanEmail, password);
        setSuccessMsg('Administrative authentication successful! Entering console...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      }
    } catch (err: any) {
      const code = err?.code || '';
      console.error('Admin authentication error:', err);

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid administrative credentials or account not initialized yet. If this is the first time setup, toggle First-Time Setup below.');
      } else if (code === 'auth/wrong-password') {
        setErrorMsg('Incorrect password. Please verify the strong security key.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('This admin account is already registered. Please sign in normally.');
        setIsInitMode(false);
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please check network connectivity.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutAndReset = async () => {
    await signOut();
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top subtle bar */}
      <div className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Sri Thirumala</span>
            <span className="ml-2 text-[10px] uppercase font-semibold bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full">
              Restricted Console
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60"
        >
          Exit to Site
        </button>
      </div>

      {/* Main Form Center Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Top header within card */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-inner mb-2">
              <KeyRound className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isInitMode ? 'Provision Admin Account' : 'System Administration'}
            </h1>
            <p className="text-xs text-slate-400">
              {isInitMode
                ? 'Create the primary super-admin credentials in the system.'
                : 'Enter authorized administrative credentials to access management console.'}
            </p>
          </div>

          {/* Current session notice if user is logged in as non-admin */}
          {user && !isAdmin && (
            <div className="mb-6 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="flex-1">
                <p className="font-semibold">Logged in as {user.email}</p>
                <p className="text-[11px] text-amber-400/80 mt-0.5">
                  This user account lacks administrative privileges. Please log in with the designated admin account.
                </p>
                <button
                  type="button"
                  onClick={handleSignOutAndReset}
                  className="mt-2 text-xs font-semibold text-amber-200 underline hover:text-white"
                >
                  Sign Out Current Account
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@srithirumalafoamwash.com"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Admin Security Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isInitMode ? 'Register & Initialize Admin' : 'Authorize & Enter Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* First-time Setup Toggle */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                setIsInitMode(!isInitMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-slate-400 hover:text-amber-400 transition underline underline-offset-2"
            >
              {isInitMode
                ? '← Switch to Standard Admin Sign In'
                : 'Need to create/provision this admin account for the first time?'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 py-4 px-6 text-center text-[11px] text-slate-600 border-t border-slate-900 bg-slate-950/60">
        Internal Management Console • Sri Thirumala Foam Wash • All administrative actions logged
      </div>
    </div>
  );
};
