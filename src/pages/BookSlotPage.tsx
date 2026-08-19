import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  Car, 
  Zap, 
  Sun, 
  Crosshair, 
  Printer, 
  History, 
  FileText, 
  MessageCircle, 
  Droplet,
  Wind,
  Layers,
  Eye,
  Navigation,
  Mail,
  ChevronUp,
  ChevronDown,
  Tag,
  Scissors
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
        alert('Please keep at least 1 wash service selected.');
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
    { name: 'Karpur Main Road', km: 0.8 },
    { name: 'Sarjapur Hub', km: 5.2 },
    { name: 'Attibele Junction', km: 4.5 },
    { name: 'Anekal Town', km: 8.2 },
    { name: 'Chandapura Circle', km: 6.8 },
    { name: 'Electronic City Ph 2', km: 12.5 }
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
        alert('Could not retrieve exact GPS coordinates. Please enter your address.');
      },
      { timeout: 10000 }
    );
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    // Step 1 Validation: Vehicle & Services
    if (currentStep === 1) {
      if (!vehicleModel.trim()) {
        alert('Please enter your vehicle model or name (e.g. Swift, City, Creta, Pulsar, Activa, Auto, etc.).');
        return;
      }
      if (!vehicleNumber.trim()) {
        alert('Please enter your vehicle registration number (e.g. KA 01 AB 1234).');
        return;
      }
      if (selectedServiceIds.length === 0) {
        alert('Please select at least 1 wash service.');
        return;
      }
    }

    // Step 2 Validation: Doorstep Address & Contact
    if (currentStep === 2) {
      if (!customerName.trim()) {
        alert('Please enter your full name.');
        return;
      }
      if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
        alert('Please enter a valid 10-digit contact / WhatsApp phone number.');
        return;
      }
      if (!pickupAddress.trim()) {
        alert('Please enter your specific doorstep pickup address.');
        return;
      }
    }

    // Step 3 Validation: Slot conflict check
    if (currentStep === 3) {
      if (isSlotBooked(inTime, date)) {
        alert(`⚠️ The slot ${inTime} on ${date} is already booked by another customer! Please select an available time slot.`);
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Final Confirmation
      if (isSlotBooked(inTime, date)) {
        alert(`⚠️ The slot ${inTime} on ${date} is no longer available! Please choose another time slot.`);
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
          particleCount: 150,
          spread: 100,
          origin: { y: 0.55 },
          colors: ['#ff0033', '#ff6d00', '#ffd600', '#00e676', '#00e5ff']
        });
      } catch {
        // safe fallback
      }
    }
  };

  // Formatted WhatsApp Dispatch message
  const whatsappBookingMessage = encodeURIComponent(
`*SRI THIRUMALA FOAM WASH - NEW DOORSTEP BOOKING*
----------------------------------------
*Booking ID:* ${bookingId}
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Vehicle:* ${vehicleModel} (${vehicleNumber.toUpperCase()})
*Services Selected:*
${selectedServicesObjects.map(s => `• ${s.name} (₹${s.price})`).join('\n')}
*Estimated Wash Duration:* ${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m
*In-Time (Pickup):* ${date} @ ${inTime}
*Out-Time (Return):* ${date} @ ${outTime}
*Doorstep Address:* ${pickupAddress} (${pickupPincode})
${landmark ? `*Landmark:* ${landmark}\n` : ''}*Distance from Hub:* ${distanceKm} km
*Total Amount Payable:* ₹${grandTotal} (Pay upon doorstep delivery)
----------------------------------------
Please confirm valet driver dispatch.`
  );

  // Icon selector helper
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplet': return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'wind': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'shield': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'sun': return <Sun className="w-5 h-5 text-orange-400" />;
      case 'layers': return <Layers className="w-5 h-5 text-purple-400" />;
      case 'eye': return <Eye className="w-5 h-5 text-blue-400" />;
      default: return <Droplet className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-black pb-28 lg:pb-8 relative overflow-x-hidden font-sans">
      
      {/* Vibrant Ambient Glow Background Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-red-600/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-bl from-amber-400/20 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-b-2 border-dashed border-orange-500/30 py-3.5 px-3 sm:px-8 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-950/60 to-orange-950/60 hover:from-red-900/80 hover:to-orange-900/80 text-orange-200 border-2 border-dashed border-orange-400/40 hover:border-orange-400 transition-all text-xs sm:text-sm font-black cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Home</span>
          </button>

          {/* Circular Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-dashed border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] bg-slate-950 flex items-center justify-center flex-shrink-0 ring-2 ring-orange-500/50">
              <img 
                src="/logo.png" 
                alt="Sri Thirumala Foam Wash" 
                className="w-full h-full object-cover object-center scale-110" 
              />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-white font-black text-sm uppercase tracking-wider block leading-none font-['Outfit']">
                SRI THIRUMALA
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 font-extrabold text-[10px] uppercase tracking-widest leading-none font-['Outfit']">
                FOAM WASH • DOORSTEP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedBookings.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-black border-2 border-dashed border-amber-400/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                title="View My Bookings"
              >
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span>My Passes ({savedBookings.length})</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-emerald-300">Valet Active</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full flex-1">
        
        {/* Page Title with Vibrant Badges & Stitched Ribbon */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600/25 via-orange-500/25 to-yellow-500/25 border-2 border-dashed border-orange-400/70 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2.5 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>EXPRESS DOORSTEP VALET WASH & DETAILING</span>
            <Tag className="w-3.5 h-3.5 text-orange-400" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            Book Doorstep <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]">Wash Slot</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium max-w-xl mx-auto">
            ⚡ Pick your vehicle • Select customized wash services • Live timing & instant valet pass
          </p>
        </div>

        {/* Stitched Step Progression Bar */}
        {!isSubmitted && (
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 p-2 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#111625]/90 to-slate-900/90 border-2 border-dashed border-orange-500/40 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-[11px] sm:text-xs font-black">
              
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-1 sm:px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                  currentStep === 1
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-yellow-400'
                    : currentStep > 1
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep > 1 ? 'bg-emerald-500 text-slate-950' : currentStep === 1 ? 'bg-white text-red-600 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                <span className="truncate">Vehicle & Wash</span>
              </button>

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                className={`py-2 px-1 sm:px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  currentStep === 2
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-yellow-400 cursor-pointer'
                    : currentStep > 2
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep > 2 ? 'bg-emerald-500 text-slate-950' : currentStep === 2 ? 'bg-white text-red-600 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </span>
                <span className="truncate">Doorstep Address</span>
              </button>

              {/* Step 3 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 3 && setCurrentStep(3)}
                className={`py-2 px-1 sm:px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  currentStep === 3
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-yellow-400 cursor-pointer'
                    : currentStep > 3
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep > 3 ? 'bg-emerald-500 text-slate-950' : currentStep === 3 ? 'bg-white text-red-600 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  {currentStep > 3 ? '✓' : '3'}
                </span>
                <span className="truncate">Timing Slots</span>
              </button>

              {/* Step 4 Tab */}
              <button
                type="button"
                className={`py-2 px-1 sm:px-3 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                  currentStep === 4
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-2 ring-yellow-400'
                    : 'text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentStep === 4 ? 'bg-white text-red-600' : 'bg-white/10 text-slate-400'
                }`}>
                  4
                </span>
                <span className="truncate">Confirm</span>
              </button>

            </div>
          </div>
        )}

        {/* Main Form Grid + Sidebar Estimate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main Wizard Card */}
          <div className={`${isSubmitted ? 'lg:col-span-12' : 'lg:col-span-8'} bg-[#0d1322]/90 border-2 border-dashed border-orange-500/40 rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl backdrop-blur-xl text-left relative overflow-hidden`}>
            
            {/* Decorative Stitch Stitch Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-3xl border-b-2 border-l-2 border-dashed border-orange-400/40 pointer-events-none"></div>

            {/* STEP 1: ANY VEHICLE & CUSTOMIZABLE SERVICES */}
            {!isSubmitted && currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 1A: Vehicle Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/40">
                        <Car className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                      </div>
                      <span>1. Vehicle Information</span>
                    </h3>

                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600/30 to-orange-500/30 text-amber-300 border border-orange-400/50">
                      ANY VEHICLE SUPPORTED
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">
                    Enter your vehicle make & model (Bike, Scooter, Auto, Hatchback, Sedan, SUV, Commercial, EV).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border-2 border-dashed border-white/15 shadow-inner">
                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1.5 uppercase tracking-wide">
                        Vehicle Name / Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swift, City, Creta, Pulsar, Activa, Auto, etc."
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border-2 border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 outline-none text-sm text-white font-bold placeholder:text-slate-500 transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1.5 uppercase tracking-wide">
                        Vehicle Registration Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KA 01 AB 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border-2 border-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 outline-none text-sm text-yellow-300 uppercase font-mono font-black placeholder:text-slate-500 transition-all shadow-sm tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                {/* 1B: Choose Individual Wash Services */}
                <div className="pt-6 border-t-2 border-dashed border-orange-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-400/40">
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        </div>
                        <span>2. Choose Your Wash Services</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tap any service to add/remove. Combine treatments freely!
                      </p>
                    </div>

                    {/* Quick Package Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={selectAllServices}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-black text-white border border-white/20 transition-all cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('express_foam')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-cyan-900/60 hover:from-blue-800 hover:to-cyan-800 text-[11px] font-black text-cyan-300 border border-cyan-400/40 transition-all cursor-pointer"
                      >
                        Quick Wash
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('deep_interior_foam')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/40 to-orange-500/40 hover:from-red-600/60 hover:to-orange-500/60 text-[11px] font-black text-amber-300 border border-orange-400/60 transition-all cursor-pointer shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                      >
                        Deep Wash Bundle
                      </button>
                    </div>
                  </div>

                  {/* Individual Services Cards Grid (Bright, Vibrant, Stitched) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    {MODULAR_SERVICES.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);

                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group active:scale-[0.98] ${
                            isSelected
                              ? 'bg-gradient-to-br from-red-950/70 via-orange-950/40 to-slate-900/90 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-400'
                              : 'bg-slate-900/60 border-dashed border-white/15 hover:border-white/30 hover:bg-slate-900/90'
                          }`}
                        >
                          {/* Stitched active ribbon badge */}
                          {isSelected && (
                            <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl bg-gradient-to-l from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>ADDED</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-start gap-2.5 mb-2 pr-12">
                              <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-110 ${
                                isSelected ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-amber-400/60' : 'bg-slate-800 border-white/10'
                              }`}>
                                {getServiceIcon(srv.iconName)}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-white font-['Outfit'] leading-snug">
                                  {srv.name}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300/90 font-mono mt-0.5">
                                  ⏱️ ~{srv.durationMinutes} mins
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          {/* Stitched Price Bar */}
                          <div className="flex items-center justify-between pt-2.5 border-t-2 border-dashed border-white/10 mt-3 text-xs">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs font-bold text-slate-400 font-mono">₹</span>
                              <span className="text-xl font-black text-amber-300 font-['Outfit'] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                {srv.price}
                              </span>
                            </div>

                            <div className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                : 'bg-white/5 text-slate-400 border-white/10 group-hover:border-orange-400 group-hover:text-orange-300'
                            }`}>
                              {isSelected ? '✓ Selected' : '+ Add Service'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Footer CTA */}
                <div className="pt-5 flex items-center justify-between border-t-2 border-dashed border-orange-500/30">
                  <div className="text-xs text-slate-200">
                    <span className="font-black text-amber-300">{selectedServiceIds.length}</span> services selected • <span className="text-yellow-300 font-black font-mono">₹{grandTotal}</span> (~{totalDurationMinutes}m)
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Doorstep Address</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: ADDRESS, GPS & DISTANCE CALCULATION */}
            {!isSubmitted && currentStep === 2 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 2A: Contact Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-1 flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>1. Contact Details</span>
                  </h3>
                  <p className="text-xs text-slate-300 mb-3.5">
                    Our valet driver will call this number prior to arrival at your doorstep.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-slate-900/80 border-2 border-dashed border-white/15">
                    <div>
                      <label className="block text-xs font-black text-cyan-300 mb-1 uppercase tracking-wide">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. Anand Kumar"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-cyan-400 outline-none text-sm text-white font-bold placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-cyan-300 mb-1 uppercase tracking-wide">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-cyan-400 outline-none text-sm text-yellow-300 font-mono font-bold placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-cyan-300 mb-1 uppercase tracking-wide">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          placeholder="anand@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-cyan-400 outline-none text-sm text-white font-bold placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2B: Doorstep Address & Distance Calculation */}
                <div className="pt-6 border-t-2 border-dashed border-orange-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span>2. Doorstep Pickup Address & Distance</span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-200 font-black bg-gradient-to-r from-red-600/30 to-orange-500/30 hover:from-red-600/50 hover:to-orange-500/50 px-3.5 py-2 rounded-xl border-2 border-dashed border-yellow-400/60 transition-all cursor-pointer shadow-md self-start sm:self-auto"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting GPS...' : '📍 Detect My GPS Location'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">
                    Calculated live from Sri Thirumala Foam Wash Hub, Karpur Main Road.
                  </p>

                  {/* Popular quick area chips */}
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">⚡ Tap Quick Hub Area:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {popularAreasWithDistance.map((area) => (
                        <button
                          key={area.name}
                          type="button"
                          onClick={() => handleAreaSelect(area.name, area.km)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-dashed border-amber-400/40 hover:border-amber-400 text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                        >
                          <span>{area.name}</span>
                          <span className="text-amber-300 font-mono font-black">({area.km}km)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Textarea */}
                  <div className="relative mb-3.5">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={3}
                      placeholder="House / Flat / Villa No., Apartment Name, Street, Landmark, Karpur or nearby locality"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 outline-none text-sm text-white font-bold placeholder:text-slate-500 shadow-inner"
                    ></textarea>
                  </div>

                  {/* Pincode & Landmark & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1 uppercase tracking-wide">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="562125"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 outline-none text-sm text-white font-mono font-bold placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1 uppercase tracking-wide">
                        Prominent Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Karpur Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 outline-none text-sm text-white font-bold placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-amber-300 mb-1 uppercase tracking-wide">
                        Valet Parking Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basement B1 / Gate"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-slate-950 border-2 border-white/20 focus:border-amber-400 outline-none text-sm text-white font-bold placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Vibrant Stitched Distance Card */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-orange-950/40 to-slate-900 border-2 border-dashed border-yellow-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-md">
                        <Navigation className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-slate-300 block text-[11px] font-bold">Distance from Karpur Hub:</span>
                        <span className="text-lg font-black text-yellow-300 font-['Outfit'] font-mono drop-shadow-md">
                          {distanceKm} Kilometers
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                      <span className="text-slate-300 block text-[11px] font-bold">Est. Valet Arrival Time:</span>
                      <span className="font-black text-emerald-400 text-sm">~{Math.round(distanceKm * 2.5 + 5)} mins transit reach</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-orange-500/30">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer border border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Slot Timings</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: IN-TIME SELECTION & DYNAMIC OUT-TIME CALCULATION & CONFLICT CHECK */}
            {!isSubmitted && currentStep === 3 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 3A: Date Selector */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] mb-2.5 flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-400/40">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span>1. Select Pickup Date</span>
                  </h3>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border-2 border-dashed border-white/15">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-slate-950 border-2 border-amber-400/60 focus:border-amber-400 outline-none text-sm text-yellow-300 font-bold font-mono"
                    />
                    <span className="text-xs text-slate-300 font-bold">
                      Checking real-time slot availability for {date}
                    </span>
                  </div>
                </div>

                {/* 3B: In-Time Slots with Live Conflict Detection */}
                <div className="pt-6 border-t-2 border-dashed border-orange-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/40">
                          <Clock className="w-4 h-4 text-orange-400" />
                        </div>
                        <span>2. Choose In-Time (Pickup Slot)</span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Select when you want our valet driver to pick up your vehicle.
                      </p>
                    </div>
                  </div>

                  {/* Slot chips grid */}
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
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer select-none active:scale-95 ${
                            booked
                              ? 'bg-red-950/30 border-red-800/40 text-slate-500 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 text-slate-950 border-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] ring-2 ring-yellow-400 font-black'
                              : 'bg-slate-900/80 border-dashed border-white/20 hover:border-amber-400/80 hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-black font-mono ${isSelected ? 'text-slate-950' : booked ? 'line-through text-slate-500' : 'text-white'}`}>
                              {time}
                            </span>
                            {booked ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                                BOOKED
                              </span>
                            ) : isSelected ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-950 text-yellow-300">
                                SELECTED
                              </span>
                            ) : (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                OPEN
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                            {booked ? 'Unavailable' : isSelected ? '✓ Pickup Confirmed' : 'Tap to select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3C: Dynamic In-Time to Out-Time Calculation Timeline (Stitched Ticket Card) */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#180a0a] via-[#101424] to-[#070b14] border-2 border-dashed border-amber-400 shadow-2xl text-left relative overflow-hidden">
                    
                    <div className="flex items-center justify-between mb-3 border-b border-dashed border-white/15 pb-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-['Outfit'] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-yellow-400" />
                        <span>AUTOMATED VALET TIMELINE CALCULATOR</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Doorstep Guaranteed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                      
                      {/* In-Time */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border-2 border-amber-400/50 shadow-inner">
                        <span className="text-amber-300 block text-[11px] font-black uppercase">📥 In-Time (Pickup):</span>
                        <span className="text-xl font-black text-white font-mono font-['Outfit']">
                          {inTime}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Valet driver collects vehicle</span>
                      </div>

                      {/* Duration */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/70 to-orange-950/70 border-2 border-dashed border-orange-400/60 text-center shadow-inner">
                        <span className="text-orange-300 block text-[11px] font-black uppercase">⏱️ Total Duration:</span>
                        <span className="text-xl font-black text-yellow-300 font-mono font-['Outfit'] drop-shadow-md">
                          {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                        </span>
                        <span className="block text-[10px] text-slate-300 mt-0.5">{selectedServiceIds.length} services + 15m transit buffer</span>
                      </div>

                      {/* Out-Time */}
                      <div className="p-3.5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/60 shadow-inner">
                        <span className="text-emerald-300 block text-[11px] font-black uppercase">📤 Out-Time (Delivery):</span>
                        <span className="text-xl font-black text-emerald-300 font-mono font-['Outfit'] drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                          {outTime}
                        </span>
                        <span className="block text-[10px] text-slate-300 mt-0.5">Clean vehicle delivered back</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Step 3 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-orange-500/30">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer border border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Review & Finalize</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 4: FINAL SUMMARY & SUBMIT */}
            {!isSubmitted && currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] mb-1">
                    Review Your Custom Valet Slot
                  </h3>
                  <p className="text-xs text-slate-300 mb-5">
                    Check your vehicle, chosen services, timing, and address before generating pass.
                  </p>

                  {/* Stitched Receipt Breakdown */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border-2 border-dashed border-amber-400/80 space-y-3.5 text-xs sm:text-sm shadow-2xl relative">
                    
                    {/* Perforation Cut line indicator */}
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] pb-2 border-b-2 border-dashed border-white/10 font-mono">
                      <Scissors className="w-3.5 h-3.5 text-orange-400" />
                      <span>DOORSTEP VALET BOOKING VOUCHER</span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Vehicle:</span>
                      <span className="font-black text-yellow-300 font-['Outfit'] text-right text-sm">
                        {vehicleModel} ({vehicleNumber.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Selected Services:</span>
                      <div className="text-right space-y-1 max-w-xs sm:max-w-sm">
                        {selectedServicesObjects.map((s) => (
                          <div key={s.id} className="text-amber-300 font-bold text-xs flex justify-between gap-4">
                            <span>• {s.name}</span>
                            <span className="font-mono text-white">₹{s.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Customer Contact:</span>
                      <span className="font-black text-white">{customerName} ({customerPhone})</span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Doorstep Pickup:</span>
                      <span className="font-bold text-white max-w-xs sm:max-w-sm text-right">
                        {pickupAddress} ({pickupPincode})
                        <span className="block text-[11px] text-amber-300 font-mono mt-0.5">
                          📍 {distanceKm} km from Karpur Hub
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Scheduled In-Time:</span>
                      <span className="font-black text-amber-300 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                      <span className="text-slate-400 font-bold">Calculated Out-Time:</span>
                      <span className="font-black text-emerald-400 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400 font-bold">Doorstep Valet Fee:</span>
                      <span className="font-black text-emerald-400 uppercase tracking-wider text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                        FREE (₹0)
                      </span>
                    </div>

                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-orange-950/60 border-2 border-dashed border-red-500/40 text-red-200 text-xs flex items-center gap-3 shadow-md">
                    <ShieldCheck className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <span>
                      <strong className="text-yellow-300">Zero Advance Payment:</strong> Pay only after full vehicle inspection at your doorstep. Cash / UPI / Cards accepted.
                    </span>
                  </div>
                </div>

                {/* Step 4 CTA */}
                <div className="pt-4 flex items-center justify-between border-t-2 border-dashed border-orange-500/30">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer border border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <span>Confirm & Book Slot • ₹{grandTotal}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMED STITCHED PASS & WHATSAPP DISPATCH */}
            {isSubmitted && (
              <div className="text-center py-4 sm:py-6 space-y-6 max-w-2xl mx-auto">
                
                {/* Header Confirmation Badge */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-xs font-mono font-black px-3.5 py-1.5 rounded-full bg-amber-500/20 text-yellow-300 border-2 border-dashed border-amber-400">
                    BOOKING REFERENCE: {bookingId}
                  </span>

                  <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit'] mt-3">
                    Slot Booked Successfully!
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed font-medium">
                    Thank you, <strong className="text-white">{customerName}</strong>! Pickup scheduled at <strong className="text-amber-300">{inTime}</strong> and ready by <strong className="text-emerald-400">{outTime}</strong> on <strong className="text-white">{date}</strong>.
                  </p>
                </div>

                {/* Printable Stitched Digital Valet Pass Ticket */}
                <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#11172a] to-[#0a0e1a] border-2 border-dashed border-yellow-400 shadow-2xl text-left relative overflow-hidden">
                  
                  {/* Left & Right Perforated Ticket Notches */}
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] border-r-2 border-dashed border-yellow-400"></div>
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] border-l-2 border-dashed border-yellow-400"></div>

                  <div className="flex items-center justify-between border-b-2 border-dashed border-white/15 pb-3.5 mb-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-mono">
                        OFFICIAL DOORSTEP VALET PASS
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        SRI THIRUMALA FOAM WASH
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md">
                      {bookingId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3.5">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">Vehicle:</span>
                      <span className="font-black text-yellow-300">{vehicleModel}</span>
                      <span className="block text-[10px] text-slate-300 font-mono">{vehicleNumber.toUpperCase()}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">In-Time:</span>
                      <span className="font-bold text-amber-300 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">Out-Time:</span>
                      <span className="font-bold text-emerald-400 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">Distance:</span>
                      <span className="font-bold text-white font-mono">{distanceKm} km from Hub</span>
                    </div>
                  </div>

                  {/* Services Itemized */}
                  <div className="py-2.5 border-t-2 border-dashed border-white/10 text-xs">
                    <span className="text-slate-400 block text-[11px] font-bold mb-1.5">Services Booked:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServicesObjects.map(s => (
                        <span key={s.id} className="px-2.5 py-0.5 rounded-lg bg-white/10 text-yellow-200 text-[11px] font-bold border border-white/10">
                          ✓ {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-white/15 pt-3.5 flex items-center justify-between text-xs mt-3">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-bold">Total Payable (Upon Delivery):</span>
                      <span className="text-2xl font-black text-yellow-300 font-['Outfit'] drop-shadow-md">₹{grandTotal}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] font-bold">Payment Methods:</span>
                      <span className="font-bold text-white text-xs">Cash / UPI / GPay / PhonePe</span>
                    </div>
                  </div>
                </div>

                {/* Final Actions CTA */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappBookingMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Send Booking to WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm border-2 border-dashed border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-yellow-400" />
                    <span>Print Valet Pass</span>
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Return to Home
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Desktop Live Dynamic Price & Time Estimate Sidebar */}
          {!isSubmitted && (
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              
              {/* Order Summary Stitched Card */}
              <div className="bg-[#0d1322]/90 border-2 border-dashed border-amber-400/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-left relative overflow-hidden">
                
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-dashed border-white/15">
                  <h3 className="font-black text-white text-sm font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>Live Valet Quote</span>
                  </h3>
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm">
                    Step {currentStep} of 4
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  
                  {/* Vehicle */}
                  {vehicleModel && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-bold">Vehicle:</span>
                      <span className="font-black text-yellow-300 truncate max-w-[170px]">{vehicleModel}</span>
                    </div>
                  )}

                  {/* Services Selected */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-slate-400 block text-[11px] font-black uppercase">Services ({selectedServiceIds.length}):</span>
                    {selectedServicesObjects.map((s) => (
                      <div key={s.id} className="flex justify-between text-slate-300">
                        <span className="truncate max-w-[170px]">• {s.name}</span>
                        <span className="font-mono font-bold text-white">₹{s.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Wash Duration */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-slate-300">
                    <span className="font-bold">Est. Wash Duration:</span>
                    <span className="font-black text-amber-300 font-mono">
                      {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                    </span>
                  </div>

                  {/* In & Out Time */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-bold">In-Time ➔ Out-Time:</span>
                    <span className="font-black text-emerald-400 font-mono">
                      {inTime} ➔ {outTime}
                    </span>
                  </div>

                  {/* Distance from Hub */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-bold">Distance from Hub:</span>
                    <span className="font-black text-white font-mono">{distanceKm} km</span>
                  </div>

                  {/* Doorstep Valet Fee */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-slate-300">
                    <span className="font-bold">Doorstep Valet Fee:</span>
                    <span className="font-black text-emerald-400">FREE (₹0)</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t-2 border-dashed border-white/15 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-bold">Total Amount:</span>
                    <span className="text-[10px] text-amber-300 font-bold">Pay after wash inspection</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400 font-mono">₹</span>
                    <span className="text-3xl font-black text-yellow-300 font-['Outfit'] drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]">
                      {grandTotal}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Zero advance required. Instant confirmation.</span>
                </div>
              </div>

              {/* Hub Hotline Contact */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-900 border-2 border-dashed border-orange-400/40 text-left text-xs shadow-md">
                <h4 className="font-black text-white text-xs uppercase tracking-wide font-['Outfit'] mb-1">
                  Hub Dispatch Assistance
                </h4>
                <p className="text-slate-400 mb-2 text-[11px]">
                  Emergency wash requests or timing adjustments?
                </p>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="inline-flex items-center gap-2 font-black text-yellow-300 hover:text-white transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

            </aside>
          )}

        </div>

      </main>

      {/* MOBILE-ONLY STICKY BOTTOM CHECKOUT ACTION BAR */}
      {!isSubmitted && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-t-2 border-dashed border-orange-500/50 p-3 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            
            {/* Price & Expand Trigger */}
            <div 
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div>
                <span className="text-[10px] text-slate-400 font-bold block leading-none">Total Amount</span>
                <span className="text-xl font-black text-yellow-300 font-['Outfit'] leading-tight font-mono">
                  ₹{grandTotal}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-white/10 text-amber-300">
                {showMobileSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Step Action Button */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-white/15 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{currentStep === 1 ? 'Address' : currentStep === 2 ? 'Slots' : currentStep === 3 ? 'Review' : 'Confirm'}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE SUMMARY EXPANDABLE DRAWER */}
      {showMobileSummary && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1322] border-t-2 border-dashed border-amber-400 rounded-t-3xl p-5 text-left shadow-2xl max-h-[75vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-white/15">
              <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                <span>Live Quote Breakdown</span>
              </h3>
              <button
                onClick={() => setShowMobileSummary(false)}
                className="text-slate-400 hover:text-white text-xs font-black px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {vehicleModel && (
                <div className="flex justify-between text-slate-300">
                  <span className="font-bold">Vehicle:</span>
                  <span className="font-black text-yellow-300">{vehicleModel} ({vehicleNumber || '—'})</span>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-slate-400 font-black block">Services Selected ({selectedServiceIds.length}):</span>
                {selectedServicesObjects.map((s) => (
                  <div key={s.id} className="flex justify-between text-slate-200 text-xs">
                    <span>• {s.name}</span>
                    <span className="font-mono font-bold text-yellow-300">₹{s.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-white/10 text-slate-300">
                <span>Est. Duration:</span>
                <span className="font-black text-amber-300 font-mono">{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>In-Time ➔ Out-Time:</span>
                <span className="font-black text-emerald-400 font-mono">{inTime} ➔ {outTime}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Doorstep Valet Fee:</span>
                <span className="font-black text-emerald-400">FREE (₹0)</span>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-dashed border-white/15 text-sm font-black items-baseline">
                <span className="text-white">Total Amount:</span>
                <span className="text-2xl text-yellow-300 font-['Outfit'] font-mono">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMobileSummary(false);
                handleNextStep();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
            >
              Continue Next Step →
            </button>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border-2 border-dashed border-amber-400 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-white/15">
              <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400" />
                <span>My Saved Valet Passes</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-black px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {savedBookings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous bookings found.</p>
              ) : (
                savedBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-900/90 border-2 border-dashed border-white/15 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-yellow-300">{b.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {b.status}
                      </span>
                    </div>
                    <p className="font-black text-white font-['Outfit'] text-sm">{b.vehicleModel} ({b.vehicleNumber})</p>
                    <p className="text-amber-300 font-bold">{b.serviceName} • ₹{b.totalPrice}</p>
                    <p className="text-slate-300 text-[11px] font-mono">In: {b.inTime} ➔ Out: {b.outTime} ({b.date})</p>
                    <p className="text-slate-400 text-[11px] truncate">{b.pickupAddress} ({b.distanceKm} km)</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-white/15 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-xs cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t-2 border-dashed border-orange-500/20 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH • Doorstep Valet Pickup & Delivery • Karpur Hub, Karnataka</p>
      </footer>

    </div>
  );
};
