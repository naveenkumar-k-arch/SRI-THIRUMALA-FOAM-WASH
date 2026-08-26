import React, { useState, useEffect, useRef } from 'react';
import {
  LogIn,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Calendar,
  ShieldCheck,
  Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAccount: (tab: 'login' | 'signup') => void;
  onOpenTracker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenAccount, onOpenTracker }) => {
  const { user, userProfile, signOut } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const accountRef = useRef<HTMLDivElement>(null);

  // Close account dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: '3D Studio', href: '#simulator-3d' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Track Wash', href: '#tracker', isTracker: true },
    { name: 'Contact', href: '#contact' },
    { name: 'Book a Slot', href: '#booking', isAction: true }
  ];

  // User avatar: use photo URL (Google) or initials
  const userInitial = (userProfile?.name || user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm transition-all duration-300 w-full font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

        {/* Brand Logo & Name */}
        <a href="#hero" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Sri Thirumala Foam Wash Official Logo"
              className="w-full h-full object-cover object-center scale-110"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-slate-900 font-black text-xs sm:text-base tracking-wider uppercase leading-none font-['Outfit']">
              SRI THIRUMALA
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-bold text-[9px] sm:text-xs tracking-widest uppercase leading-tight font-['Outfit'] mt-0.5">
              FOAM WASH
            </span>
          </div>
        </a>

        {/* Center Desktop Navigation Links (Bright Clean Light Style) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-semibold">
          {navLinks.map((link) => {
            if (link.isAction) {
              return (
                <button
                  key={link.name}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenBooking();
                  }}
                  className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </button>
              );
            }

            if (link.isTracker) {
              return (
                <button
                  key={link.name}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenTracker();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{link.name}</span>
                </button>
              );
            }

            const isActive = activeTab === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveTab(link.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right Actions: Account Dropdown & Mobile Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Account Dropdown */}
          <div className="relative" ref={accountRef}>
            {user ? (
              /* ── Logged In: User Profile Button ── */
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
              >
                {userProfile?.photoURL || user.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user.photoURL || ''}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {userInitial}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              /* ── Not Logged In: Account Button ── */
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
              >
                <User className="w-4 h-4 text-orange-600" />
                <span>Account</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`} />
              </button>
            )}

            {/* Dropdown Menu (Clean Bright Light) */}
            {isAccountOpen && (
              <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                {user ? (
                  /* ── Logged-in dropdown ── */
                  <>
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
                    </div>

                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          onOpenTracker();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer font-bold"
                      >
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>Live Wash Tracker 🚗</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          onOpenBooking();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer font-semibold"
                      >
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>Book a Wash</span>
                      </button>

                      <button
                        onClick={async () => {
                          setIsAccountOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 p-1">
                      <a
                        href="#srit-mgmt-panel"
                        onClick={() => setIsAccountOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Staff / Admin Portal</span>
                      </a>
                    </div>
                  </>
                ) : (
                  /* ── Logged-out dropdown ── */
                  <>
                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          onOpenTracker();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer font-bold"
                      >
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>Track My Wash 🔍</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          onOpenAccount('login');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer font-semibold"
                      >
                        <LogIn className="w-4 h-4 text-orange-600" />
                        <span>Login to Account</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsAccountOpen(false);
                          onOpenAccount('signup');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer font-semibold"
                      >
                        <UserPlus className="w-4 h-4 text-orange-600" />
                        <span>Sign Up New Account</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 p-1">
                      <a
                        href="#srit-mgmt-panel"
                        onClick={() => setIsAccountOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Staff / Admin Portal</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200 shadow-xs"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer (Clean Bright Light Style) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 py-4 space-y-2 text-left shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (link.isAction) {
                  e.preventDefault();
                  onOpenBooking();
                } else if (link.isTracker) {
                  e.preventDefault();
                  onOpenTracker();
                }
              }}
              className={`block py-2.5 px-3.5 rounded-xl font-bold text-xs transition ${
                link.isTracker
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : link.isAction
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.isTracker ? '🔍 Track Wash' : link.name}
            </a>
          ))}

          <div className="border-t border-slate-100 pt-2 space-y-2">
            {/* Mobile: Admin Portal link */}
            <a
              href="#srit-mgmt-panel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold text-xs border border-amber-200"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Staff / Admin Portal</span>
            </a>

            {/* Mobile: sign out if logged in */}
            {user && (
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-2 py-2.5 px-3.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs border border-rose-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({displayName})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
