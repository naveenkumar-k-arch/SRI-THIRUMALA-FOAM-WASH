import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroWashExperience } from './components/HeroWashExperience';
import { HeroFeatureCards } from './components/HeroFeatureCards';
import { HowItWorks } from './components/HowItWorks';
import { ServicesPricing } from './components/ServicesPricing';
import { LocationContact } from './components/LocationContact';
import { Footer } from './components/Footer';
import { FloatingBookingBar } from './components/FloatingBookingBar';
import { ADMIN_CONFIG } from './config/adminConfig';
import type { VehicleCategory } from './types';

// Code-split heavy interactive components for lightning-fast initial render (<50ms)
const GallerySection = lazy(() => import('./components/GallerySection').then((m) => ({ default: m.GallerySection })));
const BeforeAfterSlider = lazy(() => import('./components/BeforeAfterSlider').then((m) => ({ default: m.BeforeAfterSlider })));
const CustomerReviews = lazy(() => import('./components/CustomerReviews').then((m) => ({ default: m.CustomerReviews })));
const AccountModal = lazy(() => import('./components/AccountModal').then((m) => ({ default: m.AccountModal })));
const BookSlotPage = lazy(() => import('./pages/BookSlotPage').then((m) => ({ default: m.BookSlotPage })));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));

export function App() {
  const { user, isAdmin } = useAuth();

  // Page routing state ('home' | 'book' | 'admin-login' | 'admin-dashboard')
  const [currentPage, setCurrentPage] = useState<'home' | 'book' | 'admin-login' | 'admin-dashboard'>('home');

  // Booking preset (vehicle type / service / addons pre-selected from home)
  const [bookingPreset, setBookingPreset] = useState<{
    vehicleType: VehicleCategory;
    serviceId: string;
    addons: string[];
  }>({
    vehicleType: 'sedan',
    serviceId: '',
    addons: []
  });

  // Account modal states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'login' | 'signup'>('login');

  // Pending booking redirect: if user clicks "Book" while logged out,
  // we open login modal and navigate to booking after successful auth
  const [pendingBooking, setPendingBooking] = useState(false);

  // Listen to hash changes for direct URL navigation
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').trim();
      const adminSlug = ADMIN_CONFIG.endpoint.toLowerCase().replace(/^#\/?/, '').trim();
      const hasAdminSession = Boolean(
        (user && isAdmin) ||
        (typeof window !== 'undefined' && window.sessionStorage?.getItem('srit_admin_session') === 'true')
      );

      // Check for secret admin endpoint
      if (rawHash === adminSlug) {
        if (hasAdminSession) {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('admin-login');
        }
      } else if (rawHash === `${adminSlug}/dashboard` || rawHash === `${adminSlug}-dashboard`) {
        if (hasAdminSession) {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('admin-login');
        }
      } else if (rawHash === 'book' || rawHash === 'booking' || rawHash === 'book-slot') {
        if (user) {
          setCurrentPage('book');
        } else {
          // Not logged in — redirect hash back to hero and open login
          window.location.hash = '#hero';
          setPendingBooking(true);
          setAccountTab('login');
          setIsAccountOpen(true);
        }
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, isAdmin]);

  // ── Navigate to booking — guard: must be logged in ───────────────────────
  const handleNavigateToBook = () => {
    if (!user) {
      // Not logged in: open login modal, queue the booking navigation
      setPendingBooking(true);
      setAccountTab('login');
      setIsAccountOpen(true);
      return;
    }
    setBookingPreset({ vehicleType: 'sedan', serviceId: '', addons: [] });
    window.location.hash = '#book';
    setCurrentPage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceFromHome = (
    vehicleType: VehicleCategory,
    serviceId: string,
    addons: string[]
  ) => {
    if (!user) {
      setPendingBooking(true);
      setAccountTab('login');
      setIsAccountOpen(true);
      return;
    }
    setBookingPreset({ vehicleType, serviceId, addons });
    window.location.hash = '#book';
    setCurrentPage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    window.location.hash = '#hero';
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAccount = (tab: 'login' | 'signup') => {
    setAccountTab(tab);
    setIsAccountOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    window.location.hash = `#${ADMIN_CONFIG.endpoint}/dashboard`;
    setCurrentPage('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdminLogin = () => {
    window.location.hash = `#${ADMIN_CONFIG.endpoint}`;
    setCurrentPage('admin-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called by AccountModal after successful login/signup
  const handleAuthSuccess = () => {
    setIsAccountOpen(false);
    if (pendingBooking) {
      setPendingBooking(false);
      setBookingPreset({ vehicleType: 'sedan', serviceId: '', addons: [] });
      window.location.hash = '#book';
      setCurrentPage('book');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  // ── Admin Login Page (100% Hidden Endpoint) ────────────────────────────────
  if (currentPage === 'admin-login') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading Super Admin Portal...
          </div>
        }
      >
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onNavigateHome={handleNavigateHome}
        />
      </Suspense>
    );
  }

  // ── Admin Dashboard Page (100% Hidden Endpoint, Blank Canvas) ─────────────
  if (currentPage === 'admin-dashboard') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading Super Admin Console...
          </div>
        }
      >
        <AdminDashboardPage
          onNavigateHome={handleNavigateHome}
          onNavigateLogin={handleNavigateAdminLogin}
        />
      </Suspense>
    );
  }

  // ── Book Slot Page (auth-guarded) ──────────────────────────────────────────
  if (currentPage === 'book') {
    // Extra safety: if somehow reached book page without auth, redirect home
    if (!user) {
      handleNavigateHome();
      return null;
    }
    return (
      <div className="min-h-screen bg-[#030712]">
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-400 font-mono text-xs">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3" />
              Loading Booking Engine...
            </div>
          }
        >
          <BookSlotPage
            onNavigateHome={handleNavigateHome}
            initialVehicleType={bookingPreset.vehicleType}
            initialServiceId={bookingPreset.serviceId}
            initialAddons={bookingPreset.addons}
          />
        </Suspense>
        <AccountModal
          isOpen={isAccountOpen}
          initialTab={accountTab}
          onClose={() => setIsAccountOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // ── Home Page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-hidden relative font-sans">

      {/* Sticky Header / Navbar */}
      <Navbar
        onOpenBooking={handleNavigateToBook}
        onOpenAccount={handleOpenAccount}
      />

      {/* Main Content Sections */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">

        {/* Hero Wash Experience */}
        <HeroWashExperience onOpenBooking={handleNavigateToBook} />

        {/* About Sri Thirumala */}
        <HeroFeatureCards onOpenBooking={handleNavigateToBook} />

        {/* How It Works */}
        <HowItWorks onOpenBooking={handleNavigateToBook} />

        {/* Real Work Transformation Showcase & Gallery */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-xs font-mono">Loading Gallery Showcase...</div>}>
          <GallerySection onOpenBooking={handleNavigateToBook} />
        </Suspense>

        {/* Pricing & Package Selector */}
        <ServicesPricing onSelectService={handleSelectServiceFromHome} />

        {/* Before & After Slider */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-xs font-mono">Loading Transformation Preview...</div>}>
          <BeforeAfterSlider />
        </Suspense>

        {/* Customer Reviews */}
        <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400 text-xs font-mono">Loading Customer Reviews...</div>}>
          <CustomerReviews />
        </Suspense>

        {/* Location & Contact */}
        <LocationContact onOpenBooking={handleNavigateToBook} />

      </main>

      {/* Footer */}
      <Footer onOpenBooking={handleNavigateToBook} />

      {/* Floating Booking Bar */}
      <FloatingBookingBar onOpenBooking={handleNavigateToBook} />

      {/* Account Modal (Lazy Loaded only when opened) */}
      {isAccountOpen && (
        <Suspense fallback={null}>
          <AccountModal
            isOpen={isAccountOpen}
            initialTab={accountTab}
            onClose={() => { setIsAccountOpen(false); setPendingBooking(false); }}
            onAuthSuccess={handleAuthSuccess}
          />
        </Suspense>
      )}

    </div>
  );
}

export default App;
