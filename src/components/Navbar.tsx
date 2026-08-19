import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAccount: (tab: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenAccount }) => {
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
    { name: 'Gallery', href: '#gallery' },
    { name: 'Fleet Care', href: '#fleet' },
    { name: 'Contact', href: '#contact' },
    { name: 'Book a Slot', href: '#booking', isAction: true }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Circular Logo & Name */}
        <a href="#hero" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg shadow-red-600/30 bg-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Sri Thirumala Foam Wash Official Logo" 
              className="w-full h-full object-cover object-center scale-110"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-white font-extrabold text-xs sm:text-base tracking-wider uppercase leading-none font-['Outfit']">
              SRI THIRUMALA
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold text-[9px] sm:text-xs tracking-widest uppercase leading-tight font-['Outfit'] mt-0.5">
              FOAM WASH
            </span>
          </div>
        </a>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                if (link.isAction) {
                  e.preventDefault();
                  onOpenBooking();
                } else {
                  setActiveTab(link.name);
                }
              }}
              className={`relative py-1 transition-colors ${
                activeTab === link.name && !link.isAction
                  ? 'text-orange-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
              {activeTab === link.name && !link.isAction && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-[0_0_8px_#dc2626]"></span>
              )}
            </a>
          ))}
        </nav>

        {/* Right Account Button & Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 transition-all text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
            >
              <User className="w-4 h-4 text-orange-400" />
              <span>Account</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu floating above all layers */}
            {isAccountOpen && (
              <div className="absolute right-0 mt-2.5 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <button
                  onClick={() => {
                    setIsAccountOpen(false);
                    onOpenAccount('login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-orange-400" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setIsAccountOpen(false);
                    onOpenAccount('signup');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-orange-400" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#030712] border-b border-white/10 px-4 py-4 space-y-3 text-left">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (link.isAction) {
                  e.preventDefault();
                  onOpenBooking();
                }
              }}
              className="block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-sm"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
