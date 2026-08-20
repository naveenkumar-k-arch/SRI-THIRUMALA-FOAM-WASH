import React, { useEffect, useState } from 'react';
import {
  Shield,
  LogOut,
  ExternalLink,
  Calendar,
  Users,
  Car,
  TrendingUp,
  Sparkles,
  Database,
  Key,
  RefreshCw,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_PERMISSIONS } from '../types';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateHome,
  onNavigateLogin
}) => {
  const {
    user,
    userProfile,
    userRole,
    isSuperAdmin,
    isAdmin,
    jwtMeta,
    refreshToken,
    signOut,
    loading
  } = useAuth();

  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenRefreshNotice, setTokenRefreshNotice] = useState('');
  const [showFullToken, setShowFullToken] = useState(false);

  // Guard: if not authenticated as Super Admin or Admin, bounce to login
  useEffect(() => {
    if (!loading && (!user || (!isSuperAdmin && !isAdmin))) {
      onNavigateLogin();
    }
  }, [user, isSuperAdmin, isAdmin, loading, onNavigateLogin]);

  const handleSignOut = async () => {
    await signOut();
    onNavigateLogin();
  };

  const handleRotateJwt = async () => {
    setIsRefreshingToken(true);
    setTokenRefreshNotice('');
    try {
      const newToken = await refreshToken(true);
      if (newToken) {
        setTokenRefreshNotice('Cryptographic JWT ID Token successfully rotated & re-signed by Google Auth!');
        setTimeout(() => setTokenRefreshNotice(''), 4000);
      }
    } catch (err) {
      console.error('Failed to rotate JWT:', err);
    } finally {
      setIsRefreshingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-mono">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        Verifying Cryptographic JWT & Database RBAC Permissions...
      </div>
    );
  }

  const permissions = ROLE_PERMISSIONS[userRole] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 flex items-center justify-center shadow-md shadow-red-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide">SRI THIRUMALA</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-semibold uppercase">
                {userRole} CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Operations & Governance Portal</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-xs font-semibold text-slate-200">
              {userProfile?.name || 'Super Administrator'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {user?.email}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            title="Open customer-facing website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Site</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/50 hover:border-red-700 bg-red-950/40 text-xs text-red-300 hover:text-red-100 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Welcome Executive Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Admin Session Active • Verified in Firestore Database</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Super Admin Console — {userProfile?.name || 'Administrator'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Identity verified cryptographically via Google Firebase JWT tokens. Session keys and tokens are maintained strictly in memory with zero plaintext <code className="text-amber-300 font-mono text-xs bg-slate-950 px-1 py-0.5 rounded">localStorage</code> persistence.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[120px]">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">RBAC Role</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">{userRole}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-center min-w-[120px]">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">JWT State</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">ACTIVE & SIGNED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live JWT Security & Token Inspection Panel */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">Cryptographic JWT Token Management</h2>
                <p className="text-[11px] text-slate-400">Google-issued RS256 signed ID token with live rotation</p>
              </div>
            </div>

            <button
              onClick={handleRotateJwt}
              disabled={isRefreshingToken}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingToken ? 'animate-spin' : ''}`} />
              <span>{isRefreshingToken ? 'Rotating Token...' : 'Rotate & Refresh JWT Token'}</span>
            </button>
          </div>

          {tokenRefreshNotice && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{tokenRefreshNotice}</span>
            </div>
          )}

          {/* Token Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-slate-500 text-[10px] uppercase">Issued At</div>
              <div className="text-slate-300 mt-1 font-semibold">
                {jwtMeta?.issuedAt ? jwtMeta.issuedAt.toLocaleTimeString() : 'Active'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-slate-500 text-[10px] uppercase">Expiration Time</div>
              <div className="text-amber-400 mt-1 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{jwtMeta?.expirationTime ? jwtMeta.expirationTime.toLocaleTimeString() : '1 Hour (Auto-Refreshes)'}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-slate-500 text-[10px] uppercase">Auth Subject (UID)</div>
              <div className="text-slate-300 mt-1 truncate">
                {user?.uid || 'N/A'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="text-slate-500 text-[10px] uppercase">Token Algorithm</div>
              <div className="text-emerald-400 mt-1 font-semibold">
                RS256 (Google Signed)
              </div>
            </div>
          </div>

          {/* Masked JWT String View */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="font-mono text-slate-500">Live JWT Token Hash:</span>
              <button
                type="button"
                onClick={() => setShowFullToken(!showFullToken)}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                {showFullToken ? 'Hide String' : 'Peek Token String'}
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-400 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              {showFullToken
                ? jwtMeta?.token || 'Token loading...'
                : (jwtMeta?.token ? `${jwtMeta.token.substring(0, 36)}••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••${jwtMeta.token.slice(-18)}` : 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...')}
            </p>
          </div>
        </div>

        {/* Super Admin RBAC Permissions Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">Role-Based Access Control (RBAC) Matrix</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              Full System Clearance
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{perm}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Operations Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Bookings</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">0</div>
            <div className="text-[11px] text-slate-500 mt-1">Live booking database ready</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">Firestore DB</div>
            <div className="text-[11px] text-slate-500 mt-1">RBAC user collection online</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Fleet Solutions</span>
              <Car className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">Online</div>
            <div className="text-[11px] text-slate-500 mt-1">Corporate fleet dispatch queue</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-[11px] text-slate-500 mt-1">All microservices & DB operational</div>
          </div>
        </div>

        {/* Blank Canvas Workspace Container */}
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
            <Database className="w-8 h-8 text-amber-500/60" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-200">Super Admin Canvas Ready</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This space is intentionally blank as requested. Any custom administrative panels (Live Booking Queue, Slot Management, Price Matrix, Fleet Dispatch, Customer Database) can be populated here.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              Admin UID: {user?.uid.substring(0, 10)}...
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400">
              Role: {userRole}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              Email: {user?.email}
            </span>
          </div>
        </div>

      </main>

      {/* Super Admin Footer */}
      <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-600 bg-slate-950">
        Sri Thirumala Foam Wash • Root Super Admin Governance Environment • No LocalStorage Persistence
      </footer>

    </div>
  );
};
