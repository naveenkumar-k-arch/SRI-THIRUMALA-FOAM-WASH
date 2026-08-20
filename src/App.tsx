import { useState, useEffect } from 'react';
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

export function App() {
  // Page routing state ('home' | 'book')
  const [currentPage, setCurrentPage] = useState<'home' | 'book'>('home');

  // Initial booking preset state passed when user selects a service directly
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

  // Listen to hash changes for direct URL navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#book' || hash === '#booking' || hash === '#book-slot') {
        setCurrentPage('book');
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateToBook = () => {
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
    setBookingPreset({ vehicleType, serviceId, addons });
    handleNavigateToBook();
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

  // If on the dedicated Book Slot Page
  if (currentPage === 'book') {
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
        />
      </div>
    );
  }

  // Home Page Landing Experience
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-hidden relative font-sans">
      
      {/* Sticky Header / Navbar */}
      <Navbar 
        onOpenBooking={handleNavigateToBook}
        onOpenAccount={handleOpenAccount}
      />

      {/* Main Content Sections */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        
        {/* Signature Scroll-Driven 3D Car Wash Video Experience */}
        <HeroWashExperience 
          onOpenBooking={handleNavigateToBook}
        />

        {/* Story-Driven About Sri Thirumala Foam Wash */}
        <HeroFeatureCards 
          onOpenBooking={handleNavigateToBook}
        />

        {/* 4-Step Doorstep Workflow ("Clean Car. Zero Hassle.") */}
        <HowItWorks 
          onOpenBooking={handleNavigateToBook}
        />

        {/* Real Work Transformation Showcase & Gallery */}
        <GallerySection 
          onOpenBooking={handleNavigateToBook}
        />

        {/* Transparent Pricing & Custom Package Selector */}
        <ServicesPricing 
          onSelectService={handleSelectServiceFromHome}
        />

        {/* Interactive Before & After Transformation Slider */}
        <BeforeAfterSlider />

        {/* Customer Reviews & Google Rating */}
        <CustomerReviews />

        {/* Hub Location, Operating Hours & Final Call to Action */}
        <LocationContact 
          onOpenBooking={handleNavigateToBook}
        />

      </main>

      {/* Footer */}
      <Footer 
        onOpenBooking={handleNavigateToBook}
      />

      {/* Floating Action Bar */}
      <FloatingBookingBar 
        onOpenBooking={handleNavigateToBook}
      />

      {/* Account Login / Signup Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        initialTab={accountTab}
        onClose={() => setIsAccountOpen(false)}
      />

    </div>
  );
}

export default App;
