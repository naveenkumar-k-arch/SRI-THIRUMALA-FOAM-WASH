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
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  VEHICLE_OPTIONS, 
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
  initialVehicleType = 'sedan',
  initialServiceId = 'deep_interior_foam'
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [savedBookings, setSavedBookings] = useState<BookingRecord[]>([]);

  // Selected Services List (A la carte & customizable)
  const defaultServices = initialServiceId === 'express_foam' 
    ? ['water_wash', 'foam_wash', 'underbody_wash'] 
    : initialServiceId === 'signature_ceramic'
    ? ['water_wash', 'foam_wash', 'vacuum_clean', 'ceramic_gloss', 'leather_polish']
    : ['water_wash', 'foam_wash', 'vacuum_clean', 'interior_sanitization'];

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(defaultServices);

  // Form State
  const [vehicleType, setVehicleType] = useState<string>(initialVehicleType);
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

  // Vehicle Multiplier
  const currentVehicleObj = VEHICLE_OPTIONS.find(v => v.id === vehicleType) || VEHICLE_OPTIONS[3];
  const vehicleMultiplier = currentVehicleObj.multiplier || 1.0;

  // Calculate Total Amount & Total Service Duration
  const calculateServiceCost = (basePrice: number) => {
    return Math.round(basePrice * vehicleMultiplier);
  };

  const selectedServicesObjects = MODULAR_SERVICES.filter(s => selectedServiceIds.includes(s.id));
  const totalRawCost = selectedServicesObjects.reduce((sum, s) => sum + s.price, 0);
  const grandTotal = Math.round(totalRawCost * vehicleMultiplier);
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
        alert('Please enter your vehicle model or name (e.g. Swift, City, Pulsar, Auto, Activa).');
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
        vehicleCategory: currentVehicleObj.name,
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
          particleCount: 130,
          spread: 90,
          origin: { y: 0.6 }
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
*Vehicle:* ${vehicleModel} (${vehicleNumber.toUpperCase()}) [${currentVehicleObj.name}]
*Services Selected:*
${selectedServicesObjects.map(s => `• ${s.name} (₹${calculateServiceCost(s.price)})`).join('\n')}
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
      case 'droplet': return <Droplet className="w-4 h-4 text-orange-400" />;
      case 'sparkles': return <Sparkles className="w-4 h-4 text-orange-400" />;
      case 'wind': return <Wind className="w-4 h-4 text-orange-400" />;
      case 'zap': return <Zap className="w-4 h-4 text-orange-400" />;
      case 'shield': return <ShieldCheck className="w-4 h-4 text-orange-400" />;
      case 'sun': return <Sun className="w-4 h-4 text-orange-400" />;
      case 'layers': return <Layers className="w-4 h-4 text-orange-400" />;
      case 'eye': return <Eye className="w-4 h-4 text-orange-400" />;
      default: return <Droplet className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 transition-colors text-xs sm:text-sm font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Back to Home</span>
          </button>

          {/* Circular Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-md bg-slate-950 flex items-center justify-center flex-shrink-0">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold text-[10px] uppercase tracking-widest leading-none font-['Outfit']">
                FOAM WASH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedBookings.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 text-xs font-bold border border-amber-400/30 transition-colors cursor-pointer"
                title="View My Bookings"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Bookings ({savedBookings.length})</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden md:inline">Karpur Hub</span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-amber-300 font-bold border border-orange-400/30">
                Valet Online
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
        
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2">
            DOORSTEP VEHICLE SPA & FOAM WASH
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            Customizable <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">Doorstep Slot Booking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Any vehicle • Select your exact wash services • Choose In-Time with auto-calculated Out-Time • Instant doorstep valet reach
          </p>
        </div>

        {/* Step Progression Bar */}
        {!isSubmitted && (
          <div className="max-w-3xl mx-auto mb-8 p-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-bold overflow-x-auto">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap ${currentStep >= 1 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Vehicle & Services</span>
            </div>
            <div className="w-4 sm:w-8 h-0.5 bg-white/10 flex-shrink-0"></div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap ${currentStep >= 2 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>2</span>
              <span>Address & Distance</span>
            </div>
            <div className="w-4 sm:w-8 h-0.5 bg-white/10 flex-shrink-0"></div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap ${currentStep >= 3 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>3</span>
              <span>In/Out Timing Slots</span>
            </div>
            <div className="w-4 sm:w-8 h-0.5 bg-white/10 flex-shrink-0"></div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap ${currentStep >= 4 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>4</span>
              <span>Confirm & Dispatch</span>
            </div>
          </div>
        )}

        {/* Main Grid: Form Container + Sticky Live Estimate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Wizard Area */}
          <div className={`${isSubmitted ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-left`}>
            
            {/* STEP 1: ANY VEHICLE & CUSTOMIZABLE SERVICES */}
            {!isSubmitted && currentStep === 1 && (
              <div className="space-y-8">
                
                {/* 1A: Vehicle Category & Any Vehicle Flexibility */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                      <Car className="w-5 h-5 text-orange-400" />
                      <span>1. Select Vehicle Type</span>
                    </h3>
                    <span className="text-xs text-amber-300 font-mono bg-red-950/60 px-2.5 py-1 rounded-md border border-red-800/40">
                      Rate Scale: {vehicleMultiplier}x
                    </span>
                  </div>

                  {/* Flexible Vehicle Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
                    {VEHICLE_OPTIONS.map((veh) => {
                      const isSelected = vehicleType === veh.id;
                      return (
                        <button
                          key={veh.id}
                          type="button"
                          onClick={() => setVehicleType(veh.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-red-600/25 border-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-orange-400'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-white font-['Outfit'] truncate">
                              {veh.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate">
                            {veh.example}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Vehicle Model & Registration Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Vehicle Name / Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swift / Honda City / Creta / Pulsar / Auto"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Vehicle Registration Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KA 01 AB 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white uppercase font-mono placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 1B: Choose Individual Wash Services */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                        <span>2. Choose Your Wash Services</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Check or uncheck individual treatments. Customize your wash to your exact preference.
                      </p>
                    </div>

                    {/* Quick Package Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={selectAllServices}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-bold text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('express_foam')}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-bold text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                      >
                        Quick Wash
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('deep_interior_foam')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/30 text-[11px] font-bold text-amber-300 border border-red-500/40 cursor-pointer"
                      >
                        Deep Wash Bundle
                      </button>
                    </div>
                  </div>

                  {/* Individual Services Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {MODULAR_SERVICES.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);
                      const cost = calculateServiceCost(srv.price);

                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-br from-red-950/40 via-red-900/20 to-white/[0.02] border-orange-400/80 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-1 ring-orange-400'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10">
                                  {getServiceIcon(srv.iconName)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                                    {srv.name}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ⏱️ ~{srv.durationMinutes} mins
                                  </span>
                                </div>
                              </div>

                              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-orange-400 text-slate-950 font-bold' : 'border border-white/20'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {srv.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3 text-xs">
                            <div className="flex items-baseline gap-1">
                              <span className="text-[11px] text-slate-400 font-mono">₹</span>
                              <span className="text-lg font-black text-amber-300 font-['Outfit']">
                                {cost}
                              </span>
                            </div>
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                              {isSelected ? '✓ Added' : '+ Tap to add'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Footer CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <div className="text-xs text-slate-300">
                    <span className="text-white font-bold">{selectedServiceIds.length}</span> services selected • Est. <span className="text-amber-300 font-bold font-mono">{totalDurationMinutes} mins</span>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue to Address & Distance</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: ADDRESS, GPS & DISTANCE CALCULATION */}
            {!isSubmitted && currentStep === 2 && (
              <div className="space-y-8">
                
                {/* 2A: Contact Info */}
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit'] mb-1">
                    1. Contact Information
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Our valet driver will call this number prior to vehicle arrival.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. Anand Kumar"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          placeholder="anand@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2B: Doorstep Address & Distance Calculation */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-orange-400" />
                      <span>2. Doorstep Pickup Address & Distance</span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/30 transition-colors cursor-pointer"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting GPS...' : 'Detect My GPS Location'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    Calculated from Sri Thirumala Foam Wash Hub, Karpur Main Road.
                  </p>

                  {/* Popular area chips with distance */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[11px] text-slate-400 self-center mr-1">Quick Hub Locations:</span>
                    {popularAreasWithDistance.map((area) => (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => handleAreaSelect(area.name, area.km)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                      >
                        + {area.name} <span className="text-amber-300 font-mono">({area.km}km)</span>
                      </button>
                    ))}
                  </div>

                  {/* Address Textarea */}
                  <div className="relative mb-3">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={3}
                      placeholder="House / Flat / Villa No., Apartment Name, Street, Landmark, Karpur or nearby locality"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                    ></textarea>
                  </div>

                  {/* Pincode & Landmark & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="562125"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white font-mono placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Prominent Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Karpur Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Parking / Valet Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basement B1 / Driveway"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Distance & Valet Reach Metrics Card */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-400/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Distance from Karpur Hub:</span>
                        <span className="text-base font-black text-amber-300 font-['Outfit'] font-mono">
                          {distanceKm} Kilometers
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                      <span className="text-slate-400 block text-[11px]">Est. Valet Arrival Time:</span>
                      <span className="font-bold text-white">~{Math.round(distanceKm * 2.5 + 5)} mins reach time</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Proceed to Slot Timings</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: IN-TIME SELECTION & DYNAMIC OUT-TIME CALCULATION & CONFLICT CHECK */}
            {!isSubmitted && currentStep === 3 && (
              <div className="space-y-8">
                
                {/* 3A: Date Selector */}
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit'] mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <span>1. Select Pickup Date</span>
                  </h3>

                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-[#120707] border border-white/15 focus:border-orange-400 outline-none text-sm text-white"
                    />
                    <span className="text-xs text-slate-400">
                      Slots checked live for {date}
                    </span>
                  </div>
                </div>

                {/* 3B: In-Time Slots with Live Conflict Detection */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <span>2. Choose In-Time (Pickup Slot)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select when you want our valet to pick up your vehicle.
                      </p>
                    </div>
                  </div>

                  {/* Slot conflict indicator notice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
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
                          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            booked
                              ? 'bg-red-950/20 border-red-900/40 text-slate-500 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-red-600/30 border-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-1 ring-orange-400 cursor-pointer'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-bold font-mono ${booked ? 'line-through text-slate-500' : isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {time}
                            </span>
                            {booked ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                Booked
                              </span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-400 text-slate-950">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Available
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400">
                            {booked ? 'Slot unavailable' : 'Tap to book'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3C: Dynamic In-Time to Out-Time Calculation Timeline */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#120707] via-slate-900 to-slate-950 border border-orange-400/40 shadow-xl text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block mb-2 font-['Outfit']">
                      AUTOMATED TIMELINE CALCULATOR
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      
                      {/* In-Time */}
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                        <span className="text-slate-400 block text-[11px] font-bold">📥 In-Time (Pickup):</span>
                        <span className="text-xl font-black text-white font-mono font-['Outfit']">
                          {inTime}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Valet collects vehicle</span>
                      </div>

                      {/* Duration */}
                      <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
                        <span className="text-orange-400 block text-[11px] font-bold">⏱️ Wash Duration:</span>
                        <span className="text-lg font-black text-amber-300 font-mono font-['Outfit']">
                          {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{selectedServiceIds.length} services + quality check</span>
                      </div>

                      {/* Out-Time */}
                      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                        <span className="text-emerald-400 block text-[11px] font-bold">📤 Out-Time (Return):</span>
                        <span className="text-xl font-black text-emerald-300 font-mono font-['Outfit']">
                          {outTime}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Clean vehicle delivered</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Step 3 CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Review & Finalize</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 4: FINAL SUMMARY & SUBMIT */}
            {!isSubmitted && currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white font-['Outfit'] mb-1">
                    Review Your Custom Slot Booking
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Check your vehicle, selected services, in-time, out-time, and doorstep location.
                  </p>

                  {/* Summary Breakdown */}
                  <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3.5 text-xs sm:text-sm">
                    
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-slate-400">Vehicle:</span>
                      <span className="font-bold text-white font-['Outfit'] text-right">
                        {vehicleModel} ({vehicleNumber.toUpperCase()}) • {currentVehicleObj.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-start pb-3 border-b border-white/10">
                      <span className="text-slate-400">Selected Services:</span>
                      <div className="text-right space-y-1 max-w-xs sm:max-w-sm">
                        {selectedServicesObjects.map((s) => (
                          <div key={s.id} className="text-amber-300 font-semibold text-xs flex justify-between gap-4">
                            <span>• {s.name}</span>
                            <span className="font-mono text-white">₹{calculateServiceCost(s.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-slate-400">Customer Name & Phone:</span>
                      <span className="font-bold text-white">{customerName} ({customerPhone})</span>
                    </div>

                    <div className="flex justify-between items-start pb-3 border-b border-white/10">
                      <span className="text-slate-400">Doorstep Location:</span>
                      <span className="font-medium text-white max-w-xs sm:max-w-sm text-right">
                        {pickupAddress} ({pickupPincode})
                        <span className="block text-[11px] text-amber-300/90 font-mono mt-0.5">
                          Distance: {distanceKm} km from Karpur Hub
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-slate-400">Scheduled In-Time (Pickup):</span>
                      <span className="font-bold text-amber-300 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-slate-400">Calculated Out-Time (Return):</span>
                      <span className="font-bold text-emerald-400 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Doorstep Valet Pickup & Delivery:</span>
                      <span className="font-black text-emerald-400 uppercase tracking-wider">FREE (₹0)</span>
                    </div>

                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-orange-400 flex-shrink-0" />
                    <span>
                      <strong>Zero Advance Payment:</strong> Pay after vehicle is washed and returned to your doorstep. Inspection guarantee before payment.
                    </span>
                  </div>
                </div>

                {/* Step 4 CTA */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Confirm & Book Slot • ₹{grandTotal}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMED BOOKING PASS & DISPATCH */}
            {isSubmitted && (
              <div className="text-center py-6 space-y-8 max-w-2xl mx-auto">
                
                {/* Header Confirmation Badge */}
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 border border-white/15">
                    BOOKING REFERENCE: {bookingId}
                  </span>

                  <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] mt-4">
                    Slot Booked Successfully!
                  </h2>

                  <p className="text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                    Thank you, <strong className="text-white">{customerName}</strong>! Valet pickup is scheduled at <strong className="text-amber-300">{inTime}</strong> and ready by <strong className="text-emerald-400">{outTime}</strong> on <strong className="text-white">{date}</strong>.
                  </p>
                </div>

                {/* Printable Digital Booking Pass */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/40 shadow-2xl text-left relative overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                        OFFICIAL DOORSTEP VALET PASS
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        SRI THIRUMALA FOAM WASH
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-red-600/30 text-amber-300 border border-red-500/30">
                      {bookingId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Vehicle:</span>
                      <span className="font-bold text-white">{vehicleModel}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{vehicleNumber.toUpperCase()}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">In-Time:</span>
                      <span className="font-bold text-amber-300 font-mono">{date} @ {inTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Out-Time:</span>
                      <span className="font-bold text-emerald-400 font-mono">{date} @ {outTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Distance:</span>
                      <span className="font-bold text-white font-mono">{distanceKm} km from Hub</span>
                    </div>
                  </div>

                  {/* Services Itemized */}
                  <div className="py-2 border-t border-white/10 text-xs">
                    <span className="text-slate-400 block text-[11px] mb-1">Services Booked:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServicesObjects.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-200 text-[11px]">
                          ✓ {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs mt-3">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Payable (Pay on Delivery):</span>
                      <span className="text-lg font-black text-amber-300 font-['Outfit']">₹{grandTotal}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Payment Modes:</span>
                      <span className="font-bold text-white text-xs">Cash / UPI / GPay / PhonePe / Card</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2 max-w-lg mx-auto">
                  <h4 className="font-bold text-white text-sm font-['Outfit'] mb-1">What to expect next:</h4>
                  <p className="text-slate-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Valet driver calls you 15 minutes before arrival ({inTime}).</span>
                  </p>
                  <p className="text-slate-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pre-wash digital vehicle condition checklist.</span>
                  </p>
                  <p className="text-slate-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Thorough professional wash & interior treatment at Karpur Hub.</span>
                  </p>
                  <p className="text-slate-300 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Spotless vehicle returned to your doorstep by {outTime}.</span>
                  </p>
                </div>

                {/* Final Actions */}
                <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappBookingMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Booking to WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 font-bold text-sm border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-orange-400" />
                    <span>Print Valet Pass</span>
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Return to Home
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Live Dynamic Price & Time Estimate Sidebar */}
          {!isSubmitted && (
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              {/* Order Summary Card */}
              <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md text-left">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="font-black text-white text-base font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>Live Estimate</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-600/20 text-amber-300 border border-red-500/30">
                    Step {currentStep} of 4
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  
                  {/* Vehicle */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Vehicle Class:</span>
                    <span className="font-bold text-white">{currentVehicleObj.name} ({vehicleMultiplier}x)</span>
                  </div>

                  {/* Services Selected */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-slate-400 block text-[11px] font-bold">Services ({selectedServiceIds.length}):</span>
                    {selectedServicesObjects.map((s) => (
                      <div key={s.id} className="flex justify-between text-slate-300">
                        <span className="truncate max-w-[170px]">• {s.name}</span>
                        <span className="font-mono font-bold text-white">₹{calculateServiceCost(s.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Wash Duration */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-slate-300">
                    <span>Est. Wash Duration:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                    </span>
                  </div>

                  {/* In & Out Time */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>In-Time ➔ Out-Time:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {inTime} ➔ {outTime}
                    </span>
                  </div>

                  {/* Distance from Hub */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Distance from Hub:</span>
                    <span className="font-bold text-white font-mono">{distanceKm} km</span>
                  </div>

                  {/* Doorstep Valet Pickup & Delivery */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-slate-300">
                    <span>Doorstep Valet Fee:</span>
                    <span className="font-black text-emerald-400">FREE (₹0)</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Amount:</span>
                    <span className="text-[10px] text-amber-300/80">Pay on doorstep delivery</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400 font-mono">₹</span>
                    <span className="text-3xl font-black text-amber-300 font-['Outfit']">
                      {grandTotal}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span>No advance payment needed to reserve slot.</span>
                </div>
              </div>

              {/* Hub Hotline Contact */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-white/10 text-left text-xs">
                <h4 className="font-bold text-white text-sm font-['Outfit'] mb-1">
                  Hub Dispatch Assistance
                </h4>
                <p className="text-slate-400 mb-3">
                  Need an urgent custom emergency wash or have specific queries?
                </p>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="inline-flex items-center gap-2 font-bold text-amber-300 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

            </aside>
          )}

        </div>

      </main>

      {/* Booking History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1120] border border-white/15 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                <History className="w-5 h-5 text-orange-400" />
                <span>My Saved Bookings</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {savedBookings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous bookings found.</p>
              ) : (
                savedBookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-amber-300">{b.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {b.status}
                      </span>
                    </div>
                    <p className="font-bold text-white font-['Outfit'] text-sm">{b.vehicleModel} ({b.vehicleNumber})</p>
                    <p className="text-slate-300">{b.serviceName} • ₹{b.totalPrice}</p>
                    <p className="text-slate-400 text-[11px] font-mono">In: {b.inTime} ➔ Out: {b.outTime} ({b.date})</p>
                    <p className="text-slate-400 text-[11px] truncate">{b.pickupAddress} ({b.distanceKm} km)</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH • Doorstep Valet Pickup & Delivery • Karpur Hub, Karnataka</p>
      </footer>

    </div>
  );
};
