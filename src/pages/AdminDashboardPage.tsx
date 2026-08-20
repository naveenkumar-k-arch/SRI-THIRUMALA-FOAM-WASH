import React, { useEffect } from 'react';
import {
  Shield,
  LogOut,
  ExternalLink,
  Calendar,
  Users,
  Car,
  TrendingUp,
  Settings,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateHome,
  onNavigateLogin
}) => {
  const { user, userProfile, isAdmin, signOut, loading } = useAuth();

  // Guard: if not admin or not authenticated, redirect to login
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      onNavigateLogin();
    }
  }, [user, isAdmin, loading, onNavigateLogin]);

  const handleSignOut = async () => {
    await signOut();
    onNavigateLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        Verifying Administrative Session...
      </div>
    );
  }

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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-semibold">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Operations & Management Portal</p>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white transition"
            title="Open customer-facing website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Site</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/50 hover:border-red-700 bg-red-950/40 text-xs text-red-300 hover:text-red-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Super Admin Authenticated</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {userProfile?.name || 'Admin'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Administrative session is active and secure. This management dashboard is currently in blank setup state, ready for module integration.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center min-w-[110px]">
                <div className="text-xs text-slate-500">Privilege Level</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">ROOT ADMIN</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-center min-w-[110px]">
                <div className="text-xs text-slate-500">Security State</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">ENCRYPTED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Placeholder Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Bookings</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">0</div>
            <div className="text-[11px] text-slate-500 mt-1">Ready for live slots sync</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">Firestore</div>
            <div className="text-[11px] text-slate-500 mt-1">Direct database link ready</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Fleet Inquiries</span>
              <Car className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200">Ready</div>
            <div className="text-[11px] text-slate-500 mt-1">Fleet solutions queue</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <div className="text-[11px] text-slate-500 mt-1">All microservices online</div>
          </div>
        </div>

        {/* Blank Canvas Container for Future Modules */}
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
            <Database className="w-8 h-8 text-amber-500/60" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-200">Admin Dashboard Canvas</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This space is intentionally left blank as requested. Whenever you want to add custom panels (e.g. Booking Queue, Slot Availability, Price Matrix, Customer CRM), they will appear right here.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              User UID: {user?.uid.substring(0, 10)}...
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              Role: {userProfile?.role || 'admin'}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              Email: {user?.email}
            </span>
          </div>
        </div>

      </main>

      {/* Admin Footer */}
      <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-600 bg-slate-950">
        Sri Thirumala Foam Wash • Internal Administration Environment
      </footer>

    </div>
  );
};
