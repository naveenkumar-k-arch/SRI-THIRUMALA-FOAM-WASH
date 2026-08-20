import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroWashExperience } from './components/HeroWashExperience';
import { HeroFeatureCards } from './components/HeroFeatureCards';
import { HowItWorks } from './components/HowItWorks';
import { ServicesPricing } from './components/ServicesPricing';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { GallerySection } from './components/GallerySection';
import { CustomerReviews } from './components/CustomerReviews';
import { LocationContact } from './components/LocationContact';
import { Footer } from './components/Footer';
import { AccountModal } from './components/AccountModal';
import { FloatingBookingBar } from './components/FloatingBookingBar';
import { BookSlotPage } from './pages/BookSlotPage';
import type { VehicleCategory } from './types';

// ─── Inner App (has access to AuthContext) ───────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();

  // Page routing state ('home' | 'book')
  const [currentPage, setCurrentPage] = useState<'home' | 'book'>('home');

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
      const hash = window.location.hash.toLowerCase();
      if (hash === '#book' || hash === '#booking' || hash === '#book-slot') {
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
  }, [user]);

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

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/60 mx-auto">
            <img src="/logo.png" alt="Sri Thirumala" className="w-full h-full object-cover scale-110" />
          </div>
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-xs font-semibold tracking-wider">Loading...</p>
        </div>
      </div>
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
        <BookSlotPage
          onNavigateHome={handleNavigateHome}
          initialVehicleType={bookingPreset.vehicleType}
          initialServiceId={bookingPreset.serviceId}
          initialAddons={bookingPreset.addons}
        />
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
        <GallerySection onOpenBooking={handleNavigateToBook} />

        {/* Pricing & Package Selector */}
        <ServicesPricing onSelectService={handleSelectServiceFromHome} />

        {/* Before & After Slider */}
        <BeforeAfterSlider />

        {/* Customer Reviews */}
        <CustomerReviews />

        {/* Location & Contact */}
        <LocationContact onOpenBooking={handleNavigateToBook} />

      </main>

      {/* Footer */}
      <Footer onOpenBooking={handleNavigateToBook} />

      {/* Floating Booking Bar */}
      <FloatingBookingBar onOpenBooking={handleNavigateToBook} />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        initialTab={accountTab}
        onClose={() => { setIsAccountOpen(false); setPendingBooking(false); }}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}

// ─── Root App wrapped in AuthProvider ────────────────────────────────────────
export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
