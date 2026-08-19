import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MODULAR_SERVICES, 
  SERVICE_PACKAGES, 
  COMPANY_INFO 
} from '../data/carWashData';
import type { BookingRecord } from '../types';

interface BookSlotPageProps {
  onNavigateHome: () => void;
  initialVehicleType?: string;
  initialServiceId?: string;
  initialAddons?: string[];
}

export const BookSlotPage: React.FC<BookSlotPageProps> = ({ 
  onNavigateHome,
  initialServiceId = 'deep_interior_foam'
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showMobileSummary, setShowMobileSummary] = useState<boolean>(false);
  const [savedBookings, setSavedBookings] = useState<BookingRecord[]>([]);

  // Selected Services List (A la carte & customizable)
  const defaultServices = initialServiceId === 'express_foam' 
    ? ['water_wash', 'foam_wash', 'underbody_wash'] 
    : initialServiceId === 'signature_ceramic'
    ? ['water_wash', 'foam_wash', 'vacuum_clean', 'ceramic_gloss', 'leather_polish']
    : ['water_wash', 'foam_wash', 'vacuum_clean', 'interior_sanitization'];

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(defaultServices);

  // Form State: Any vehicle input
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupPincode, setPickupPincode] = useState<string>('562125');
  const [landmark, setLandmark] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(2.4);
  const [notes, setNotes] = useState<string>('');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState<string>('10:30 AM');

  // Booked slots tracking to detect conflicts
  const [bookedSlotsList, setBookedSlotsList] = useState<Record<string, string[]>>({
    [new Date().toISOString().split('T')[0]]: ['09:30 AM', '02:30 PM'],
  });

  // Load existing bookings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stfw_bookings');
      if (stored) {
        const parsed: BookingRecord[] = JSON.parse(stored);
        setSavedBookings(parsed);
        
        const mapped: Record<string, string[]> = {
          [new Date().toISOString().split('T')[0]]: ['09:30 AM', '02:30 PM']
        };
        parsed.forEach(b => {
          if (!mapped[b.date]) mapped[b.date] = [];
          if (!mapped[b.date].includes(b.inTime)) {
            mapped[b.date].push(b.inTime);
          }
        });
        setBookedSlotsList(mapped);
      }
    } catch {
      // safe fallback
    }
  }, [isSubmitted]);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, isSubmitted]);

  // Calculate Total Amount & Total Service Duration
  const selectedServicesObjects = MODULAR_SERVICES.filter(s => selectedServiceIds.includes(s.id));
  const grandTotal = selectedServicesObjects.reduce((sum, s) => sum + s.price, 0);
  const totalDurationMinutes = selectedServicesObjects.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Time formatting helper: Calculate Out-Time from In-Time + Duration
  const calculateOutTime = (inTimeStr: string, durationMins: number): string => {
    try {
      const parts = inTimeStr.trim().split(' ');
      if (parts.length < 2) return inTimeStr;
      
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const modifier = parts[1].toUpperCase();

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      // Add service duration + 15 mins valet buffer
      const totalMins = hours * 60 + minutes + durationMins + 15;
      
      let outHours = Math.floor(totalMins / 60) % 24;
      const outMinutes = totalMins % 60;
      const outModifier = outHours >= 12 ? 'PM' : 'AM';

      if (outHours > 12) outHours -= 12;
      if (outHours === 0) outHours = 12;

      const formattedMinutes = outMinutes < 10 ? `0${outMinutes}` : outMinutes;
      const formattedHours = outHours < 10 ? `0${outHours}` : outHours;

      return `${formattedHours}:${formattedMinutes} ${outModifier}`;
    } catch {
      return inTimeStr;
    }
  };

  const outTime = calculateOutTime(inTime, totalDurationMinutes);

  // Available in-time slots
  const allTimeSlots = [
    '07:30 AM',
    '08:30 AM',
    '09:30 AM',
    '10:30 AM',
    '11:30 AM',
    '12:30 PM',
    '01:30 PM',
    '02:30 PM',
    '03:30 PM',
    '04:30 PM',
    '05:30 PM',
    '06:30 PM',
    '07:30 PM'
  ];

  // Check if a specific slot is booked for selected date
  const isSlotBooked = (slotTime: string, selectedDate: string): boolean => {
    const bookedForDate = bookedSlotsList[selectedDate] || [];
    return bookedForDate.includes(slotTime);
  };

  // Toggle individual service
  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      if (selectedServiceIds.length === 1) {
        alert('⚠️ Please keep at least 1 wash service selected.');
        return;
      }
      setSelectedServiceIds(selectedServiceIds.filter(id => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Preset package bundles
  const applyPresetBundle = (packageId: string) => {
    const pkg = SERVICE_PACKAGES.find(p => p.id === packageId);
    if (pkg && pkg.serviceIds) {
      setSelectedServiceIds(pkg.serviceIds);
    }
  };

  // Select all services
  const selectAllServices = () => {
    setSelectedServiceIds(MODULAR_SERVICES.map(s => s.id));
  };

  // Quick Area chips with preset distance from Karpur Hub
  const popularAreasWithDistance = [
    { name: 'Karpur Main Rd', km: 0.8, emoji: '🏠' },
    { name: 'Sarjapur Hub', km: 5.2, emoji: '🌳' },
    { name: 'Attibele Circle', km: 4.5, emoji: '🏬' },
    { name: 'Anekal Town', km: 8.2, emoji: '🏙️' },
    { name: 'Chandapura', km: 6.8, emoji: '🛣️' },
    { name: 'Electronic City Ph 2', km: 12.5, emoji: '🏢' }
  ];

  const handleAreaSelect = (areaName: string, km: number) => {
    const separator = pickupAddress.trim() ? ', ' : '';
    if (!pickupAddress.includes(areaName)) {
      setPickupAddress(`${pickupAddress}${separator}${areaName}`);
    }
    setDistanceKm(km);
  };

  // Geolocation & Distance Calculation from Shop Coordinates
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        
        // Haversine Distance from Karpur Hub (12.8256° N, 77.7845° E)
        const shopLat = COMPANY_INFO.hubCoordinates.lat;
        const shopLng = COMPANY_INFO.hubCoordinates.lng;
        
        const R = 6371; // Earth radius km
        const dLat = (latitude - shopLat) * (Math.PI / 180);
        const dLon = (longitude - shopLng) * (Math.PI / 180);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(shopLat * (Math.PI / 180)) * Math.cos(latitude * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const computedDist = parseFloat((R * c).toFixed(1));
        
        const finalDist = computedDist < 0.5 ? 0.8 : computedDist;
        setDistanceKm(finalDist);

        setPickupAddress(prev => 
          prev ? `${prev} (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})` 
               : `Doorstep Location near Karpur (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        );
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve exact GPS coordinates. Please enter your address manually.');
      },
      { timeout: 10000 }
    );
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    // Step 1 Validation: Vehicle & Services
    if (currentStep === 1) {
      if (!vehicleModel.trim()) {
        alert('🚗 Please enter your vehicle model or name (e.g. Swift, City, Creta, Pulsar, Activa, Auto, etc.).');
        return;
      }
      if (!vehicleNumber.trim()) {
        alert('🔢 Please enter your vehicle registration number (e.g. KA 01 AB 1234).');
        return;
      }
      if (selectedServiceIds.length === 0) {
        alert('🫧 Please select at least 1 wash service.');
        return;
      }
    }

    // Step 2 Validation: Doorstep Address & Contact
    if (currentStep === 2) {
      if (!customerName.trim()) {
        alert('👤 Please enter your full name.');
        return;
      }
      if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
        alert('📱 Please enter a valid 10-digit contact / WhatsApp phone number.');
        return;
      }
      if (!pickupAddress.trim()) {
        alert('📍 Please enter your specific doorstep pickup address.');
        return;
      }
    }

    // Step 3 Validation: Slot conflict check
    if (currentStep === 3) {
      if (isSlotBooked(inTime, date)) {
        alert(`⚠️ The slot ${inTime} on ${date} is already booked by another customer! Please select an available open time slot.`);
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Final Confirmation
      if (isSlotBooked(inTime, date)) {
        alert(`⚠️ The slot ${inTime} on ${date} is no longer available! Please choose another open time slot.`);
        setCurrentStep(3);
        return;
      }

      const generatedId = `STFW-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingId(generatedId);
      setIsSubmitted(true);

      const serviceNamesList = selectedServicesObjects.map(s => s.name);

      const newBooking: BookingRecord = {
        id: generatedId,
        createdAt: new Date().toLocaleString(),
        vehicleCategory: vehicleModel,
        vehicleModel: vehicleModel,
        vehicleNumber: vehicleNumber.toUpperCase(),
        serviceId: selectedServiceIds.join(','),
        serviceName: serviceNamesList.join(', '),
        selectedServices: selectedServiceIds,
        serviceNames: serviceNamesList,
        addons: [],
        addonNames: [],
        totalPrice: grandTotal,
        totalDurationMinutes: totalDurationMinutes,
        pickupAddress: pickupAddress,
        pickupPincode: pickupPincode,
        distanceKm: distanceKm,
        date: date,
        inTime: inTime,
        outTime: outTime,
        timeSlot: `${inTime} – ${outTime}`,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        notes: `${landmark ? `Landmark: ${landmark}. ` : ''}${notes}`,
        status: 'Confirmed'
      };

      // Save to localStorage
      try {
        const updated = [newBooking, ...savedBookings];
        setSavedBookings(updated);
        localStorage.setItem('stfw_bookings', JSON.stringify(updated));

        // Update booked slots state and storage
        const currentBooked = { ...bookedSlotsList };
        if (!currentBooked[date]) currentBooked[date] = [];
        currentBooked[date].push(inTime);
        setBookedSlotsList(currentBooked);
      } catch {
        // safe fallback
      }

      // Trigger Confetti
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
          colors: ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de']
        });
      } catch {
        // safe fallback
      }
    }
  };

  // Formatted WhatsApp Dispatch message
  const whatsappBookingMessage = encodeURIComponent(
`*🚗 SRI THIRUMALA FOAM WASH - NEW DOORSTEP BOOKING 🫧*
----------------------------------------
*🎫 Booking ID:* ${bookingId}
*👤 Customer:* ${customerName}
*📱 Phone:* ${customerPhone}
*🚙 Vehicle:* ${vehicleModel} (${vehicleNumber.toUpperCase()})
*🧼 Services Selected:*
${selectedServicesObjects.map(s => `• ${s.name} (₹${s.price})`).join('\n')}
*⏱️ Estimated Duration:* ${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m
*📥 In-Time (Pickup):* ${date} @ ${inTime}
*📤 Out-Time (Return):* ${date} @ ${outTime}
*📍 Doorstep Address:* ${pickupAddress} (${pickupPincode})
${landmark ? `*🏢 Landmark:* ${landmark}\n` : ''}*🗺️ Distance from Hub:* ${distanceKm} km
*💰 Total Amount Payable:* ₹${grandTotal} (Pay after vehicle delivery)
----------------------------------------
Please dispatch valet pickup driver.`
  );

  // Service 3D Emoji Icon Selector
  const getServiceEmoji = (srvId: string) => {
    switch (srvId) {
      case 'water_wash': return '💦';
      case 'foam_wash': return '🫧';
      case 'vacuum_clean': return '🌪️';
      case 'engine_steam': return '🔥';
      case 'underbody_wash': return '🚿';
      case 'interior_sanitization': return '❄️';
      case 'ceramic_gloss': return '💎';
      case 'leather_polish': return '✨';
      case 'windshield_coat': return '🪟';
      case 'rat_repellent': return '🐭';
      default: return '🧼';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#fffbf5] to-[#f0f9ff] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black pb-28 lg:pb-8 relative overflow-x-hidden font-sans">
      
      {/* Radiant Floating Color Orbs */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-gradient-to-br from-amber-300/40 via-orange-400/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-gradient-to-bl from-pink-300/40 via-red-300/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-gradient-to-tr from-cyan-300/30 via-emerald-300/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b-2 border-dashed border-amber-400/60 py-3 px-3 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-white hover:bg-orange-50 text-slate-800 border-2 border-b-4 border-slate-200 hover:border-orange-400 active:border-b-2 active:translate-y-0.5 transition-all text-xs sm:text-sm font-black cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500 flex-shrink-0 stroke-[3]" />
            <span className="hidden xs:inline">🏡 Back to Home</span>
            <span className="xs:hidden">🏡 Home</span>
          </button>

          {/* Circular Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-b-4 border-amber-400 shadow-[0_6px_16px_rgba(245,158,11,0.3)] bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 flex items-center justify-center flex-shrink-0 rotate-[-2deg] hover:rotate-0 transition-transform">
              <img 
                src="/logo.png" 
                alt="Sri Thirumala Foam Wash" 
                className="w-full h-full object-cover rounded-xl scale-110" 
              />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-slate-900 font-black text-sm uppercase tracking-wider block leading-none font-['Outfit']">
                SRI THIRUMALA
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-black text-[11px] uppercase tracking-widest leading-none font-['Outfit']">
                FOAM WASH • VALET ⚡
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedBookings.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-black border-2 border-b-4 border-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer"
                title="View My Bookings"
              >
                <span className="text-sm">🎫</span>
                <span>My Passes ({savedBookings.length})</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-700 bg-emerald-100 px-3.5 py-1.5 rounded-2xl border-2 border-emerald-300 font-black shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-800">🚀 Hub Valet Online</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 w-full flex-1">
        
        {/* Colorful Hero Title with 3D Badges */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider mb-2.5 shadow-[0_6px_16px_rgba(245,158,11,0.35)] border-2 border-white transform hover:scale-105 transition-transform">
            <span className="text-sm">✨</span>
            <span>EXPRESS DOORSTEP VEHICLE SPA & FOAM WASH</span>
            <span className="text-sm">🚀</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] leading-tight drop-shadow-sm">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500">Doorstep Slot</span> 🫧
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-bold max-w-xl mx-auto">
            🚗 Any Vehicle • 🧼 Custom Wash Services • ⏱️ Exact In/Out Timings • 💰 Pay on Delivery
          </p>
        </div>

        {/* 3D Stitched 4-Step Progression Stepper */}
        {!isSubmitted && (
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 p-2 rounded-3xl bg-white border-2 border-dashed border-amber-400 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-black">
              
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 px-1 sm:px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer border-2 ${
                  currentStep === 1
                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-white border-b-4 border-orange-700 shadow-[0_6px_16px_rgba(239,68,68,0.4)] scale-100'
                    : currentStep > 1
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm">{currentStep > 1 ? '✅' : '🚗'}</span>
                <span className="truncate">1. Vehicle & Wash</span>
              </button>

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                className={`py-2.5 px-1 sm:px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-2 ${
                  currentStep === 2
                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-white border-b-4 border-orange-700 shadow-[0_6px_16px_rgba(239,68,68,0.4)] cursor-pointer'
                    : currentStep > 2
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">{currentStep > 2 ? '✅' : '📍'}</span>
                <span className="truncate">2. Address & KM</span>
              </button>

              {/* Step 3 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 3 && setCurrentStep(3)}
                className={`py-2.5 px-1 sm:px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-2 ${
                  currentStep === 3
                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-white border-b-4 border-orange-700 shadow-[0_6px_16px_rgba(239,68,68,0.4)] cursor-pointer'
                    : currentStep > 3
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">{currentStep > 3 ? '✅' : '⏰'}</span>
                <span className="truncate">3. Timings & Slots</span>
              </button>

              {/* Step 4 Tab */}
              <button
                type="button"
                className={`py-2.5 px-1 sm:px-3 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-2 ${
                  currentStep === 4
                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 text-white border-b-4 border-orange-700 shadow-[0_6px_16px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">🎟️</span>
                <span className="truncate">4. Confirm</span>
              </button>

            </div>
          </div>
        )}

        {/* Main Wizard Form + Live 3D Estimate Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main Card */}
          <div className={`${isSubmitted ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white border-2 border-b-8 border-slate-200/90 rounded-3xl p-4 sm:p-7 md:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.06)] text-left relative overflow-hidden`}>
            
            {/* STEP 1: ANY VEHICLE & CUSTOMIZABLE WASH SERVICES */}
            {!isSubmitted && currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 1A: Vehicle Information */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-base">
                        🚗
                      </div>
                      <span>1. Vehicle Information</span>
                    </h3>

                    <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-100 text-orange-800 border-2 border-dashed border-amber-400 flex items-center gap-1">
                      <span>✨</span> ANY VEHICLE
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3.5 font-medium">
                    Enter your vehicle name & number (Bike 🛵, Car 🚗, Auto 🛺, SUV 🚙, Van 🚐, EV ⚡).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/60 border-2 border-dashed border-amber-300 shadow-sm">
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                        <span>🚘</span> Vehicle Name / Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swift, City, Creta, Pulsar, Activa, Auto, etc."
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                        <span>🔢</span> Vehicle Registration Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KA 01 AB 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none text-sm text-orange-600 uppercase font-mono font-black placeholder:text-slate-400 shadow-sm transition-all tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                {/* 1B: Modular Wash Services Selector */}
                <div className="pt-6 border-t-2 border-dashed border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center text-base">
                          🫧
                        </div>
                        <span>2. Choose Your Wash Services</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Tap any treatment to add or remove. Customize freely!
                      </p>
                    </div>

                    {/* Quick Package Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={selectAllServices}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-black text-slate-800 border-2 border-slate-300 transition-all cursor-pointer active:scale-95"
                      >
                        🌟 Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('express_foam')}
                        className="px-3 py-1.5 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-[11px] font-black text-cyan-800 border-2 border-cyan-300 transition-all cursor-pointer active:scale-95"
                      >
                        ⚡ Quick Wash
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('deep_interior_foam')}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-[11px] font-black text-slate-950 border-2 border-b-3 border-orange-600 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        🔥 Deep Wash Bundle
                      </button>
                    </div>
                  </div>

                  {/* 3D Bright Service Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {MODULAR_SERVICES.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);

                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none relative group active:scale-[0.98] ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-50 via-orange-50/60 to-white border-orange-500 border-b-6 shadow-[0_10px_25px_rgba(249,115,22,0.18)]'
                              : 'bg-white border-slate-200 border-b-4 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {/* Active 3D Badge */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm border border-white">
                              <span>✓</span>
                              <span>ADDED</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-start gap-3 mb-2 pr-12">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border-2 transition-transform group-hover:scale-110 ${
                                isSelected ? 'bg-gradient-to-br from-amber-300 to-orange-400 border-white' : 'bg-slate-100 border-slate-200'
                              }`}>
                                {getServiceEmoji(srv.id)}
                              </div>
                              <div>
                                <h4 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit'] leading-snug">
                                  {srv.name}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 font-mono mt-0.5">
                                  ⏱️ ~{srv.durationMinutes} mins
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          {/* 3D Price Bar */}
                          <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-slate-200/80 mt-3 text-xs">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs font-bold text-slate-500 font-mono">₹</span>
                              <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                                {srv.price}
                              </span>
                            </div>

                            <div className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all shadow-sm ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-600 border-b-3'
                                : 'bg-slate-100 text-slate-700 border-slate-300 group-hover:border-orange-400 group-hover:bg-orange-50'
                            }`}>
                              {isSelected ? '✓ Added' : '+ Add'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Footer CTA */}
                <div className="pt-5 flex items-center justify-between border-t-2 border-dashed border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-700 font-bold">
                    <span className="font-black text-orange-600">{selectedServiceIds.length}</span> services • Total: <span className="text-slate-950 font-black font-mono text-base">₹{grandTotal}</span> (~{totalDurationMinutes}m)
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm border-2 border-b-4 border-orange-700 shadow-[0_8px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.45)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Doorstep Address</span>
                    <span className="text-base">📍</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: ADDRESS, GPS & DISTANCE CALCULATION */}
            {!isSubmitted && currentStep === 2 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 2A: Contact Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mb-1 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-base">
                      👤
                    </div>
                    <span>1. Customer Contact</span>
                  </h3>
                  <p className="text-xs text-slate-600 mb-3.5 font-medium">
                    Our valet driver will call this number before arriving at your doorstep.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide flex items-center gap-1">
                        <span>👤</span> Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Anand Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide flex items-center gap-1">
                        <span>📱</span> Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-orange-600 font-mono font-black placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide flex items-center gap-1">
                        <span>📧</span> Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="anand@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 2B: Doorstep Address & Distance */}
                <div className="pt-6 border-t-2 border-dashed border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-base">
                        📍
                      </div>
                      <span>2. Doorstep Address & Distance</span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-950 font-black bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 px-4 py-2 rounded-2xl border-2 border-b-3 border-amber-600 shadow-sm active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <span className={`text-sm ${isLocating ? 'animate-spin' : ''}`}>🎯</span>
                      <span>{isLocating ? 'Detecting GPS...' : 'Detect My GPS Location'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 font-medium">
                    Distance calculated live from Sri Thirumala Hub, Karpur Main Road.
                  </p>

                  {/* Popular area chips */}
                  <div className="mb-3.5">
                    <span className="text-[11px] font-black text-slate-700 block mb-1.5">⚡ Tap Quick Hub Location:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {popularAreasWithDistance.map((area) => (
                        <button
                          key={area.name}
                          type="button"
                          onClick={() => handleAreaSelect(area.name, area.km)}
                          className="px-3.5 py-2 rounded-2xl bg-white hover:bg-orange-50 text-slate-800 border-2 border-slate-200 hover:border-orange-400 text-xs font-black transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <span>{area.emoji}</span>
                          <span>{area.name}</span>
                          <span className="text-orange-600 font-mono font-black">({area.km}km)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Textarea */}
                  <div className="relative mb-3.5">
                    <textarea
                      rows={3}
                      placeholder="🏠 House / Flat / Villa No., Apartment Name, Street, Landmark, Karpur or nearby locality"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm"
                    ></textarea>
                  </div>

                  {/* Pincode & Landmark & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide">
                        📮 Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="562125"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-mono font-bold placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide">
                        🏢 Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Karpur Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1 uppercase tracking-wide">
                        🚗 Parking Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basement B1 / Gate"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-300 focus:border-orange-500 outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* 3D Bright Distance Metric Card */}
                  <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-md border-2 border-white">
                        🗺️
                      </div>
                      <div>
                        <span className="text-slate-700 block text-[11px] font-bold">Distance from Karpur Hub:</span>
                        <span className="text-xl font-black text-slate-900 font-['Outfit'] font-mono">
                          {distanceKm} Kilometers
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
                      <span className="text-slate-700 block text-[11px] font-bold">Est. Valet Arrival Time:</span>
                      <span className="font-black text-emerald-800 text-sm">~{Math.round(distanceKm * 2.5 + 5)} mins transit reach ⏱️</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer border-2 border-slate-300 active:scale-95"
                  >
                    <span>← Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm border-2 border-b-4 border-orange-700 shadow-[0_8px_20px_rgba(249,115,22,0.35)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Slot Timings</span>
                    <span className="text-base">⏰</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: IN-TIME SELECTION & TIMELINE CALCULATOR */}
            {!isSubmitted && currentStep === 3 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 3A: Date Selector */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] mb-2.5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center text-base">
                      📅
                    </div>
                    <span>1. Select Pickup Date</span>
                  </h3>

                  <div className="flex items-center gap-3 p-3.5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-4 py-2.5 rounded-2xl bg-white border-2 border-orange-400 focus:border-orange-500 outline-none text-sm text-slate-900 font-black font-mono shadow-sm"
                    />
                    <span className="text-xs text-slate-700 font-bold">
                      Checking real-time open slots for {date} ⚡
                    </span>
                  </div>
                </div>

                {/* 3B: In-Time Slots with Live Conflict Detection */}
                <div className="pt-6 border-t-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-base">
                          ⏰
                        </div>
                        <span>2. Choose In-Time (Pickup Slot)</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        Select when you want our valet driver to collect your vehicle.
                      </p>
                    </div>
                  </div>

                  {/* 3D Slot Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                    {allTimeSlots.map((time) => {
                      const booked = isSlotBooked(time, date);
                      const isSelected = inTime === time && !booked;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={booked}
                          onClick={() => {
                            if (booked) {
                              alert(`⚠️ Slot ${time} on ${date} is already booked! Please select another open slot.`);
                              return;
                            }
                            setInTime(time);
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer select-none active:scale-95 ${
                            booked
                              ? 'bg-red-50 border-red-200 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-white border-orange-700 border-b-4 shadow-[0_8px_20px_rgba(249,115,22,0.35)] font-black'
                              : 'bg-white border-slate-200 border-b-3 hover:border-orange-400 hover:bg-orange-50 text-slate-800 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-black font-mono ${isSelected ? 'text-white' : booked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {time}
                            </span>
                            {booked ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-300">
                                BOOKED 🚫
                              </span>
                            ) : isSelected ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white text-orange-700">
                                PICKED ✨
                              </span>
                            ) : (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                OPEN 🟢
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                            {booked ? 'Slot unavailable' : isSelected ? '✓ Pickup Confirmed' : 'Tap to select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3C: Dynamic Timeline Calculator Card (3D Stitched Style) */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-100/90 via-orange-100/80 to-yellow-50 border-2 border-dashed border-amber-400 shadow-lg text-left relative overflow-hidden">
                    
                    <div className="flex items-center justify-between mb-3 border-b-2 border-dashed border-amber-300/80 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-['Outfit'] flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>AUTOMATED VALET TIMELINE CALCULATOR</span>
                      </span>
                      <span className="text-[11px] font-black text-orange-800 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400">
                        Doorstep Guaranteed 🤝
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                      
                      {/* In-Time */}
                      <div className="p-4 rounded-2xl bg-white border-2 border-b-4 border-orange-300 shadow-sm">
                        <span className="text-orange-700 block text-xs font-black uppercase flex items-center gap-1">
                          <span>📥</span> In-Time (Pickup):
                        </span>
                        <span className="text-xl font-black text-slate-900 font-mono font-['Outfit']">
                          {inTime}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-medium mt-0.5">Valet driver collects vehicle</span>
                      </div>

                      {/* Duration */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white border-2 border-b-4 border-orange-700 text-center shadow-md">
                        <span className="text-white block text-xs font-black uppercase flex items-center justify-center gap-1">
                          <span>⏱️</span> Wash Duration:
                        </span>
                        <span className="text-xl font-black font-mono font-['Outfit'] drop-shadow-sm">
                          {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                        </span>
                        <span className="block text-[11px] text-yellow-100 font-bold mt-0.5">{selectedServiceIds.length} services + 15m transit</span>
                      </div>

                      {/* Out-Time */}
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-b-4 border-emerald-400 shadow-sm">
                        <span className="text-emerald-800 block text-xs font-black uppercase flex items-center gap-1">
                          <span>📤</span> Out-Time (Return):
                        </span>
                        <span className="text-xl font-black text-emerald-800 font-mono font-['Outfit']">
                          {outTime}
                        </span>
                        <span className="block text-[11px] text-slate-600 font-medium mt-0.5">Spotless vehicle delivered back</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Step 3 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer border-2 border-slate-300 active:scale-95"
                  >
                    <span>← Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm border-2 border-b-4 border-orange-700 shadow-[0_8px_20px_rgba(249,115,22,0.35)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Review & Finalize</span>
                    <span className="text-base">🎟️</span>
                  </button>
                </div>

              </div>
            )}

            {/* STEP 4: FINAL SUMMARY & CONFIRMATION */}
            {!isSubmitted && currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit'] mb-1 flex items-center gap-2">
                    <span>🎟️</span>
                    <span>Review Your Custom Valet Slot</span>
                  </h3>
                  <p className="text-xs text-slate-600 mb-5 font-medium">
                    Review your vehicle, selected services, timings, and address before confirming.
                  </p>

                  {/* 3D Stitched Receipt Card */}
                  <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-dashed border-amber-400 space-y-3.5 text-xs sm:text-sm shadow-xl relative">
                    
                    {/* Perforation Cut Line */}
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] pb-2 border-b-2 border-dashed border-slate-200 font-mono font-bold">
                      <span>✂️</span>
                      <span>DOORSTEP VALET BOOKING VOUCHER</span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">🚗 Vehicle:</span>
                      <span className="font-black text-slate-900 font-['Outfit'] text-right text-sm">
                        {vehicleModel} ({vehicleNumber.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">🧼 Services:</span>
                      <div className="text-right space-y-1 max-w-xs sm:max-w-sm">
                        {selectedServicesObjects.map((s) => (
                          <div key={s.id} className="text-orange-600 font-black text-xs flex justify-between gap-4">
                            <span>• {s.name}</span>
                            <span className="font-mono text-slate-900 font-bold">₹{s.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">👤 Customer Contact:</span>
                      <span className="font-black text-slate-900">{customerName} ({customerPhone})</span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">📍 Doorstep Address:</span>
                      <span className="font-bold text-slate-900 max-w-xs sm:max-w-sm text-right">
                        {pickupAddress} ({pickupPincode})
                        <span className="block text-[11px] text-orange-600 font-mono mt-0.5">
                          🗺️ {distanceKm} km from Karpur Hub
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">📥 Pickup In-Time:</span>
                      <span className="font-black text-orange-600 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-600 font-bold">📤 Return Out-Time:</span>
                      <span className="font-black text-emerald-700 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-600 font-bold">🚚 Valet Pickup & Delivery Fee:</span>
                      <span className="font-black text-emerald-800 uppercase tracking-wider text-xs bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                        FREE (₹0) 🎉
                      </span>
                    </div>

                  </div>

                  <div className="mt-4 p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-slate-800 text-xs flex items-center gap-3 shadow-sm">
                    <span className="text-2xl">🤝</span>
                    <span>
                      <strong className="text-orange-700">Zero Advance Payment:</strong> Pay only after full vehicle wash inspection at your doorstep. Cash, UPI, GPay, PhonePe, and Cards accepted.
                    </span>
                  </div>
                </div>

                {/* Step 4 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer border-2 border-slate-300 active:scale-95"
                  >
                    <span>← Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm sm:text-base border-2 border-b-4 border-orange-700 shadow-[0_10px_25px_rgba(249,115,22,0.4)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Confirm & Book Slot • ₹{grandTotal}</span>
                    <span className="text-lg">🚀</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: 3D STITCHED CONFIRMED PASS & WHATSAPP DISPATCH */}
            {isSubmitted && (
              <div className="text-center py-4 sm:py-6 space-y-6 max-w-2xl mx-auto">
                
                {/* Header Confirmation 3D Badge */}
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-[0_10px_30px_rgba(52,211,153,0.5)] border-4 border-white text-4xl animate-bounce">
                  🎉
                </div>

                <div>
                  <span className="text-xs font-mono font-black px-4 py-1.5 rounded-full bg-amber-100 text-orange-800 border-2 border-dashed border-amber-400 shadow-sm">
                    🎫 BOOKING REFERENCE: {bookingId}
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit'] mt-3">
                    Slot Booked Successfully! 🫧
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed font-bold">
                    Thank you, <strong className="text-slate-900">{customerName}</strong>! Pickup scheduled at <strong className="text-orange-600">{inTime}</strong> and ready by <strong className="text-emerald-700">{outTime}</strong> on <strong className="text-slate-900">{date}</strong>.
                  </p>
                </div>

                {/* Printable 3D Stitched Digital Valet Pass Ticket */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-dashed border-amber-400 shadow-2xl text-left relative overflow-hidden">
                  
                  {/* Left & Right Perforated Ticket Notches */}
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#f8fafc] border-r-2 border-dashed border-amber-400"></div>
                  <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#f8fafc] border-l-2 border-dashed border-amber-400"></div>

                  <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3.5 mb-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 font-mono">
                        OFFICIAL DOORSTEP VALET PASS 🎟️
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                        SRI THIRUMALA FOAM WASH
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-black px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md border-2 border-white">
                      {bookingId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs mb-3.5">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold">🚗 Vehicle:</span>
                      <span className="font-black text-slate-900">{vehicleModel}</span>
                      <span className="block text-[10px] text-orange-600 font-mono font-black">{vehicleNumber.toUpperCase()}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold">📥 In-Time:</span>
                      <span className="font-black text-orange-600 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold">📤 Out-Time:</span>
                      <span className="font-black text-emerald-700 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold">🗺️ Distance:</span>
                      <span className="font-black text-slate-900 font-mono">{distanceKm} km Hub</span>
                    </div>
                  </div>

                  {/* Services Itemized */}
                  <div className="py-2.5 border-t-2 border-dashed border-slate-300 text-xs">
                    <span className="text-slate-500 block text-[11px] font-bold mb-1.5">🧼 Services Booked:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServicesObjects.map(s => (
                        <span key={s.id} className="px-2.5 py-1 rounded-xl bg-white text-slate-800 text-[11px] font-black border-2 border-slate-200 shadow-sm">
                          {getServiceEmoji(s.id)} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-300 pt-3.5 flex items-center justify-between text-xs mt-3">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-bold">💰 Total Payable (Upon Delivery):</span>
                      <span className="text-3xl font-black text-slate-900 font-['Outfit']">₹{grandTotal}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] font-bold">💳 Payment:</span>
                      <span className="font-bold text-slate-900 text-xs">Cash / UPI / GPay / Card</span>
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappBookingMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm border-2 border-b-4 border-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.4)] active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬 Send Booking to WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-black text-sm border-2 border-b-4 border-slate-300 active:border-b-2 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>🖨️ Print Valet Pass</span>
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm border-2 border-b-4 border-orange-700 shadow-md transition-all cursor-pointer active:translate-y-0.5"
                  >
                    🏡 Return to Home
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Desktop 3D Bright Sidebar Estimate */}
          {!isSubmitted && (
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              
              {/* Order Summary Stitched Card */}
              <div className="bg-white border-2 border-b-8 border-slate-200 rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
                
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-dashed border-slate-200">
                  <h3 className="font-black text-slate-900 text-sm font-['Outfit'] uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Live Valet Quote</span>
                  </h3>
                  <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-sm border border-white">
                    Step {currentStep} of 4 ⚡
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  
                  {/* Vehicle */}
                  {vehicleModel && (
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-bold">🚗 Vehicle:</span>
                      <span className="font-black text-slate-900 truncate max-w-[170px]">{vehicleModel}</span>
                    </div>
                  )}

                  {/* Services Selected */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-slate-500 block text-[11px] font-black uppercase">🧼 Services ({selectedServiceIds.length}):</span>
                    {selectedServicesObjects.map((s) => (
                      <div key={s.id} className="flex justify-between text-slate-700">
                        <span className="truncate max-w-[170px]">{getServiceEmoji(s.id)} {s.name}</span>
                        <span className="font-mono font-bold text-slate-900">₹{s.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Wash Duration */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-700">
                    <span className="font-bold">⏱️ Wash Duration:</span>
                    <span className="font-black text-orange-600 font-mono">
                      {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                    </span>
                  </div>

                  {/* In & Out Time */}
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-bold">⏰ Timings:</span>
                    <span className="font-black text-emerald-700 font-mono">
                      {inTime} ➔ {outTime}
                    </span>
                  </div>

                  {/* Distance from Hub */}
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-bold">🗺️ Distance:</span>
                    <span className="font-black text-slate-900 font-mono">{distanceKm} km Hub</span>
                  </div>

                  {/* Doorstep Valet Fee */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-700">
                    <span className="font-bold">🚚 Valet Fee:</span>
                    <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                      FREE (₹0) 🎉
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t-2 border-dashed border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-bold">Total Payable:</span>
                    <span className="text-[11px] text-orange-700 font-bold">Pay after wash inspection</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-500 font-mono">₹</span>
                    <span className="text-3xl font-black text-slate-900 font-['Outfit']">
                      {grandTotal}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-200 text-[11px] text-slate-700 flex items-center gap-2 font-medium">
                  <span className="text-base">🔒</span>
                  <span>Zero advance required. Instant valet pass.</span>
                </div>
              </div>

              {/* Hub Hotline Contact */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-amber-300 text-left text-xs shadow-sm">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide font-['Outfit'] mb-1 flex items-center gap-1.5">
                  <span>📞</span> Hub Dispatch Hotline
                </h4>
                <p className="text-slate-600 mb-2 text-[11px] font-medium">
                  Need an urgent emergency wash or customized fleet timing?
                </p>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="inline-flex items-center gap-2 font-black text-orange-700 hover:text-orange-900 transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

            </aside>
          )}

        </div>

      </main>

      {/* MOBILE-ONLY STICKY 3D BOTTOM ACTION BAR */}
      {!isSubmitted && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t-2 border-dashed border-amber-400 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            
            {/* Price & Expand Trigger */}
            <div 
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-bold block leading-none">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 font-['Outfit'] leading-tight font-mono">
                  ₹{grandTotal}
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-amber-100 text-slate-900 border border-amber-300">
                {showMobileSummary ? <ChevronDown className="w-4 h-4 stroke-[3]" /> : <ChevronUp className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>

            {/* Step Action Button */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs border-2 border-slate-300 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-b-4 border-orange-700 shadow-[0_6px_16px_rgba(249,115,22,0.4)] active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{currentStep === 1 ? 'Address 📍' : currentStep === 2 ? 'Slots ⏰' : currentStep === 3 ? 'Review 🎟️' : 'Confirm 🚀'}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE SUMMARY EXPANDABLE DRAWER */}
      {showMobileSummary && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-t-4 border-dashed border-amber-400 rounded-t-3xl p-5 text-left shadow-2xl max-h-[75vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200">
              <h3 className="text-base font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>📋</span>
                <span>Live Quote Breakdown</span>
              </h3>
              <button
                onClick={() => setShowMobileSummary(false)}
                className="text-slate-600 hover:text-slate-900 text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {vehicleModel && (
                <div className="flex justify-between text-slate-800">
                  <span className="font-bold">🚗 Vehicle:</span>
                  <span className="font-black text-slate-900">{vehicleModel} ({vehicleNumber || '—'})</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-slate-500 font-black block">🧼 Services Selected ({selectedServiceIds.length}):</span>
                {selectedServicesObjects.map((s) => (
                  <div key={s.id} className="flex justify-between text-slate-700 text-xs">
                    <span>{getServiceEmoji(s.id)} {s.name}</span>
                    <span className="font-mono font-bold text-slate-900">₹{s.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100 text-slate-700">
                <span>⏱️ Est. Duration:</span>
                <span className="font-black text-orange-600 font-mono">{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>⏰ Timings:</span>
                <span className="font-black text-emerald-700 font-mono">{inTime} ➔ {outTime}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>🚚 Valet Fee:</span>
                <span className="font-black text-emerald-800">FREE (₹0) 🎉</span>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-dashed border-slate-200 text-sm font-black items-baseline">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-2xl text-slate-900 font-['Outfit'] font-mono">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMobileSummary(false);
                handleNextStep();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm border-2 border-b-4 border-orange-700 shadow-lg shadow-orange-500/30 transition-all cursor-pointer active:translate-y-0.5"
            >
              Continue Next Step 🚀
            </button>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-dashed border-amber-400 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-slate-200">
              <h3 className="text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>🎫</span>
                <span>My Saved Valet Passes</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-600 hover:text-slate-900 text-sm font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {savedBookings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No previous bookings found.</p>
              ) : (
                savedBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 space-y-1 text-xs shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-orange-700">{b.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {b.status} ✅
                      </span>
                    </div>
                    <p className="font-black text-slate-900 font-['Outfit'] text-sm">🚗 {b.vehicleModel} ({b.vehicleNumber})</p>
                    <p className="text-orange-700 font-bold">🧼 {b.serviceName} • ₹{b.totalPrice}</p>
                    <p className="text-slate-600 text-[11px] font-mono">⏰ In: {b.inTime} ➔ Out: {b.outTime} ({b.date})</p>
                    <p className="text-slate-500 text-[11px] truncate">📍 {b.pickupAddress} ({b.distanceKm} km)</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t-2 border-dashed border-amber-300/60 text-center text-xs text-slate-600 font-bold">
        <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH 🫧 • Doorstep Valet Pickup & Delivery 🚗 • Karpur Hub, Karnataka</p>
      </footer>

    </div>
  );
};
