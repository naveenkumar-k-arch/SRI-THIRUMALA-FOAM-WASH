import React, { useState, useEffect } from 'react';
import {
  X, LogIn, UserPlus, Mail, Lock, User, Phone,
  CheckCircle2, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AccountModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  onClose: () => void;
  onAuthSuccess?: () => void; // Called after successful login/signup (e.g. to navigate to booking)
}

// ── Google SVG Icon ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── Firebase error code → human message ──────────────────────────────────────
const firebaseErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this website.';
    case 'auth/unauthorized-domain':
      return 'Please add "sri-thirumala-foam-wash.vercel.app" to Firebase Authorized Domains in Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is disabled in Firebase Console. Please enable Google provider.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'Sign-in failed. Please try again or use Email / Password.';
  }
};

// ── Password strength ────────────────────────────────────────────────────────
const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  if (password.length === 0) return { level: 0, label: '', color: '' };
  if (password.length < 6) return { level: 1, label: 'Too short', color: 'bg-red-500' };
  if (password.length < 8) return { level: 2, label: 'Weak', color: 'bg-orange-400' };
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score === 0) return { level: 2, label: 'Weak', color: 'bg-orange-400' };
  if (score === 1) return { level: 3, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 2) return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { level: 5, label: 'Very Strong', color: 'bg-emerald-600' };
};

// ── Component ────────────────────────────────────────────────────────────────
export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess
}) => {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successState, setSuccessState] = useState<'signup' | 'login' | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const clearForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('');
    setError(''); setLoading(false); setGoogleLoading(false);
    setSuccessState(null); setResetSent(false); setForgotMode(false);
    setShowPassword(false);
  };

  // Sync tab when prop changes
  useEffect(() => {
    setActiveTab(initialTab);
    clearForm();
  }, [initialTab, isOpen]);

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError('');
    setForgotMode(false);
    setResetSent(false);
  };

  // ── Email / Password Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (activeTab === 'signup') {
        if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
        if (!phone.trim()) { setError('Please enter your phone number.'); setLoading(false); return; }
        await signUpWithEmail(email, password, name.trim(), phone.trim());
        setSuccessState('signup');
      } else {
        await signInWithEmail(email, password);
        setSuccessState('login');
      }
      setTimeout(() => {
        clearForm();
        onClose();
        onAuthSuccess?.();
      }, 650);
    } catch (err: any) {
      const msg = err?.code ? firebaseErrorMessage(err.code) : (err?.message || 'Something went wrong. Please try again.');
      setError(msg);
      setLoading(false);
    }
  };

  // ── Google Sign In ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessState('login');
      setTimeout(() => {
        clearForm();
        onClose();
        onAuthSuccess?.();
      }, 650);
    } catch (err: any) {
      const msg = err?.code ? firebaseErrorMessage(err.code) : (err?.message || 'Google sign-in failed. Please try again.');
      setError(msg);
      setGoogleLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Please enter your email address first.'); return; }
    setLoading(true); setError('');
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(firebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  if (!isOpen) return null;

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (successState) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left">
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 font-['Outfit']">
              {successState === 'signup' ? '🎉 Account Created!' : '👋 Welcome Back!'}
            </h4>
            <p className="text-sm text-slate-500">
              {successState === 'signup'
                ? 'Your account is ready. Taking you to the wash booking page...'
                : 'You are signed in. Redirecting now...'}
            </p>
            <div className="w-8 h-8 mx-auto">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Modal ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center font-bold shadow-md">
              {activeTab === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold font-['Outfit']">
                {forgotMode ? 'Reset Password' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <p className="text-[11px] text-slate-400">Sri Thirumala Foam Wash</p>
            </div>
          </div>
          <button
            onClick={() => { clearForm(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tab Switcher ── */}
        {!forgotMode && (
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-3 text-xs font-bold text-center transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-red-600 border-b-2 border-red-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-3 text-xs font-bold text-center transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-red-600 border-b-2 border-red-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">

          {/* ── Note for login: must signup first ── */}
          {activeTab === 'login' && !forgotMode && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>New here? Please <button onClick={() => handleTabSwitch('signup')} className="font-bold underline cursor-pointer">create an account first</button> before signing in.</span>
            </div>
          )}

          {/* ── Forgot Password Mode ── */}
          {forgotMode ? (
            <div className="space-y-4">
              {resetSent ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 font-['Outfit']">Reset Email Sent!</h4>
                  <p className="text-xs text-slate-500">Check your inbox at <strong>{email}</strong> for a password reset link.</p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">Enter your registered email and we'll send a reset link.</p>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                  )}
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send Reset Email
                  </button>
                  <button
                    onClick={() => { setForgotMode(false); setError(''); }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-700 cursor-pointer font-semibold"
                  >
                    ← Back to Sign In
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* ── Google Sign In Button ── */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-semibold">or with email</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* ── Email/Password Form ── */}
              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Name (signup only) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Phone (signup only) */}
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">Password <span className="text-red-500">*</span></label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar (signup only) */}
                  {activeTab === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.level ? strength.color : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold">{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading
                    ? (activeTab === 'signup' ? 'Creating account...' : 'Signing in...')
                    : (activeTab === 'login' ? 'Sign In' : 'Create My Account')}
                </button>

                {/* Switch tab hint */}
                <p className="text-center text-xs text-slate-500 pt-1">
                  {activeTab === 'login' ? (
                    <>Don't have an account?{' '}
                      <button type="button" onClick={() => handleTabSwitch('signup')} className="text-red-600 font-bold hover:underline cursor-pointer">
                        Sign up free
                      </button>
                    </>
                  ) : (
                    <>Already have an account?{' '}
                      <button type="button" onClick={() => handleTabSwitch('login')} className="text-red-600 font-bold hover:underline cursor-pointer">
                        Sign in
                      </button>
                    </>
                  )}
                </p>

                {/* Staff / Admin Portal Link */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <a
                    href="#srit-mgmt-panel"
                    onClick={() => onClose()}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-600 font-medium transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Staff / Admin Portal Access &rarr;</span>
                  </a>
                </div>

              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
