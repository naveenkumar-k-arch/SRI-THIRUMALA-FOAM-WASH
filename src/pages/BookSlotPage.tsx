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
  Crosshair, 
  Printer, 
  History, 
  MessageSquare, 
  Droplets,
  Wind,
  Eye,
  Navigation,
  Mail,
  ChevronUp,
  ChevronDown,
  Shield,
  Award,
  Gem,
  Flame,
  Compass,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MODULAR_SERVICES, 
  SERVICE_PACKAGES, 
  COMPANY_INFO 
} from '../data/carWashData';
import type { BookingRecord } from '../types';
import { api } from '../services/api';

interface BookSlotPageProps {
  onNavigateHome: () => void;
  initialVehicleType?: string;
  initialServiceId?: string;
  initialAddons?: string[];
}

export const BookSlotPage: React.FC<BookSlotPageProps> = ({ 
  onNavigateHome,
  initialServiceId
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showMobileSummary, setShowMobileSummary] = useState<boolean>(false);
  const [savedBookings, setSavedBookings] = useState<BookingRecord[]>([]);

  // Selected Services List - Empty by default so user can choose freely
  const initialServices = initialServiceId === 'express_foam' 
    ? ['water_wash', 'foam_wash', 'underbody_wash'] 
    : initialServiceId === 'signature_ceramic'
    ? ['water_wash', 'foam_wash', 'vacuum_clean', 'ceramic_gloss', 'leather_polish']
    : initialServiceId && initialServiceId !== 'deep_interior_foam'
    ? [initialServiceId]
    : [];

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialServices);

  // Form State: Any vehicle input
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupPincode, setPickupPincode] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState<string>('');
  const [bookedSlotsList, setBookedSlotsList] = useState<Record<string, string[]>>({});

  // Load existing bookings and real booked slots from Neon PostgreSQL + localStorage
  useEffect(() => {
    let isMounted = true;

    async function loadNeonBookings() {
      try {
        // 1. Fetch live booked slots from Neon DB
        const serverSlots = await api.getBookedSlots();
        if (isMounted && Object.keys(serverSlots).length > 0) {
          setBookedSlotsList(prev => ({ ...prev, ...serverSlots }));
        }

        // 2. Fetch live bookings
        const liveList = await api.getBookings();
        if (isMounted && liveList.length > 0) {
          // Map DB response to BookingRecord interface
          const mapped: BookingRecord[] = liveList.map((b: any) => ({
            id: b.id,
            vehicleModel: `${b.vehicleBrand || ''} ${b.vehicleNumber || ''}`.trim() || b.vehicleType,
            serviceNames: [b.serviceType],
            addons: [],
            addonNames: [],
            totalPrice: b.price,
            totalDurationMinutes: 60,
            pickupAddress: b.pickupAddress || '',
            pickupPincode: b.pickupPincode || '',
            distanceKm: b.distanceKm || 0,
            date: b.date,
            inTime: b.inTime,
            outTime: b.outTime,
            timeSlot: b.timeSlot,
            customerName: b.customerName,
            customerPhone: b.customerPhone,
            customerEmail: b.customerEmail,
            notes: b.notes,
            status: b.status
          }));
          setSavedBookings(mapped);
          return;
        }
      } catch (err) {
        console.warn('Neon DB load error, using local storage fallback:', err);
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem('stfw_bookings');
        if (stored && isMounted) {
          const parsed: BookingRecord[] = JSON.parse(stored);
          setSavedBookings(parsed);
          
          const mapped: Record<string, string[]> = {};
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
    }

    loadNeonBookings();

    return () => {
      isMounted = false;
    };
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
    if (!inTimeStr || !inTimeStr.trim()) return 'Pending Slot';
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

  // Geolocation & Full Reverse Geocoded Address Resolution
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
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

        // Reverse Geocode to get real, full doorstep address & pincode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            
            // Build a clean, precise street address
            const parts: string[] = [];
            if (addr.building || addr.house_number) parts.push(addr.building || addr.house_number);
            if (addr.road || addr.street || addr.pedestrian) parts.push(addr.road || addr.street || addr.pedestrian);
            if (addr.suburb || addr.neighbourhood || addr.residential) parts.push(addr.suburb || addr.neighbourhood || addr.residential);
            if (addr.village || addr.town || addr.city_district || addr.city) parts.push(addr.village || addr.town || addr.city_district || addr.city);
            if (addr.state_district || addr.county) parts.push(addr.state_district || addr.county);
            if (addr.state) parts.push(addr.state);
            
            const resolvedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
            
            if (resolvedAddress) {
              setPickupAddress(resolvedAddress);
            } else {
              setPickupAddress(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            }

            if (addr.postcode) {
              setPickupPincode(addr.postcode);
            }

            if (addr.suburb || addr.neighbourhood || addr.road) {
              setLandmark(prev => prev || addr.suburb || addr.neighbourhood || addr.road || '');
            }
          } else {
            setPickupAddress(prev => 
              prev ? `${prev} (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})` 
                   : `Doorstep Location (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
            );
          }
        } catch {
          setPickupAddress(prev => 
            prev ? `${prev} (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})` 
                 : `Doorstep Location (GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
          );
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve exact GPS coordinates. Please type your doorstep address.');
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    // Step 1 Validation: Vehicle & Services
    if (currentStep === 1) {
      if (!vehicleModel.trim()) {
        alert('Please enter your vehicle make and model (e.g. Swift, City, Creta, Pulsar, Activa, etc.).');
        return;
      }
      if (!vehicleNumber.trim()) {
        alert('Please enter your vehicle registration number (e.g. KA 01 AB 1234).');
        return;
      }
      if (selectedServiceIds.length === 0) {
        alert('Please select at least one wash service.');
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

    // Step 3 Validation: In-time slot selection & conflict check
    if (currentStep === 3) {
      if (!inTime || !inTime.trim()) {
        alert('Please choose an in-time pickup slot.');
        return;
      }
      if (isSlotBooked(inTime, date)) {
        alert(`The slot ${inTime} on ${date} is currently booked. Please select another available slot.`);
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Final Confirmation
      if (isSlotBooked(inTime, date)) {
        alert(`The slot ${inTime} on ${date} is no longer available. Please choose another slot.`);
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

      // Save to Neon PostgreSQL Database
      try {
        api.createBooking({
          id: bookingId,
          bookingId: bookingId,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          vehicleType: vehicleModel || 'Car',
          vehicleBrand: vehicleModel,
          vehicleNumber: vehicleNumber,
          serviceType: serviceNamesList.join(', '),
          price: grandTotal,
          date: date,
          inTime: inTime,
          outTime: outTime,
          timeSlot: `${inTime} – ${outTime}`,
          pickupType: 'Doorstep Valet',
          pickupAddress: pickupAddress,
          pickupPincode: pickupPincode,
          distanceKm: distanceKm,
          notes: `${landmark ? `Landmark: ${landmark}. ` : ''}${notes}`,
          status: 'Confirmed',
          paymentStatus: 'Pending',
          paymentMethod: 'UPI'
        }).then(res => {
          if (res?.success) {
            console.log('✅ Booking successfully stored in Neon PostgreSQL:', bookingId);
          }
        }).catch(err => {
          console.warn('Could not save to PostgreSQL backend, saved locally:', err);
        });
      } catch (e) {
        console.warn('API error:', e);
      }

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
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#2563eb', '#dc2626', '#f59e0b', '#10b981', '#6366f1']
        });
      } catch {
        // safe fallback
      }
    }
  };

  // Professional WhatsApp Dispatch message
  const whatsappBookingMessage = encodeURIComponent(
`*SRI THIRUMALA FOAM WASH — DOORSTEP VALET BOOKING*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Booking Reference:* ${bookingId}
*Customer Name:* ${customerName}
*Contact Number:* ${customerPhone}
*Vehicle:* ${vehicleModel} (${vehicleNumber.toUpperCase()})
*Selected Treatments:*
${selectedServicesObjects.map(s => `• ${s.name} — ₹${s.price}`).join('\n')}
*Estimated Treatment Duration:* ${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m
*Pickup Schedule (In-Time):* ${date} at ${inTime}
*Estimated Return (Out-Time):* ${date} at ${outTime}
*Doorstep Address:* ${pickupAddress} (${pickupPincode})
${landmark ? `*Landmark:* ${landmark}\n` : ''}*Hub Transit Distance:* ${distanceKm} km
*Total Amount Payable:* ₹${grandTotal} (Payable upon vehicle delivery)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm valet pickup dispatch.`
  );

  // Mature, Refined Professional Vector Icon Selector
  const getProfessionalServiceIcon = (srvId: string) => {
    switch (srvId) {
      case 'water_wash': return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'foam_wash': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'vacuum_clean': return <Wind className="w-5 h-5 text-indigo-600" />;
      case 'engine_steam': return <Flame className="w-5 h-5 text-red-500" />;
      case 'underbody_wash': return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'interior_sanitization': return <Zap className="w-5 h-5 text-cyan-600" />;
      case 'ceramic_gloss': return <Gem className="w-5 h-5 text-violet-600" />;
      case 'leather_polish': return <Award className="w-5 h-5 text-amber-600" />;
      case 'windshield_coat': return <Eye className="w-5 h-5 text-blue-600" />;
      case 'rat_repellent': return <Shield className="w-5 h-5 text-rose-600" />;
      default: return <Droplets className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-red-600 selection:text-white pb-28 lg:pb-8 relative overflow-x-hidden w-full max-w-full font-sans">
      
      {/* Subtle Professional Ambient Gradient Background */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/60 via-slate-50 to-transparent pointer-events-none -z-10"></div>
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-3 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors text-xs font-semibold cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>

          {/* Clean Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Sri Thirumala Foam Wash" 
                className="w-full h-full object-cover scale-105" 
              />
            </div>
            <div className="text-left">
              <span className="text-slate-900 font-extrabold text-xs sm:text-sm tracking-wide block leading-none font-['Outfit']">
                SRI THIRUMALA
              </span>
              <span className="text-red-600 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider leading-none font-['Outfit']">
                FOAM WASH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedBookings.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                title="View My Bookings"
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">My Bookings ({savedBookings.length})</span>
                <span className="sm:hidden">{savedBookings.length}</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-800">Valet Active • Karpur Hub</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 w-full flex-1">
        
        {/* Professional Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>DOORSTEP VEHICLE CARE & FOAM WASH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Schedule Your <span className="text-red-600">Doorstep Slot</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal max-w-xl mx-auto">
            Select your vehicle, customize your detailing services, and reserve an exact in-time slot with complimentary doorstep valet transit.
          </p>
        </div>

        {/* Professional 4-Step Stepper Progress Bar */}
        {!isSubmitted && (
          <div className="max-w-4xl mx-auto mb-5 sm:mb-9 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
              
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStep === 1
                    ? 'bg-slate-900 text-white shadow-sm'
                    : currentStep > 1
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-transparent text-slate-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 1 ? 'bg-red-600 text-white' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </span>
                <span className="truncate hidden sm:inline">Vehicle & Services</span>
                <span className="truncate sm:hidden text-[10px]">Service</span>
              </button>

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-slate-900 text-white shadow-sm cursor-pointer'
                    : currentStep > 2
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                    : 'bg-transparent text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 2 ? 'bg-red-600 text-white' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </span>
                <span className="truncate hidden sm:inline">Address & Distance</span>
                <span className="truncate sm:hidden text-[10px]">Address</span>
              </button>

              {/* Step 3 Tab */}
              <button
                type="button"
                onClick={() => currentStep > 3 && setCurrentStep(3)}
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 3
                    ? 'bg-slate-900 text-white shadow-sm cursor-pointer'
                    : currentStep > 3
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                    : 'bg-transparent text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 3 ? 'bg-red-600 text-white' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > 3 ? '✓' : '3'}
                </span>
                <span className="truncate hidden sm:inline">Schedule & Timing</span>
                <span className="truncate sm:hidden text-[10px]">Timings</span>
              </button>

              {/* Step 4 Tab */}
              <button
                type="button"
                className={`py-2 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 4
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-transparent text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 4 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  4
                </span>
                <span className="truncate hidden sm:inline">Review & Confirm</span>
                <span className="truncate sm:hidden text-[10px]">Confirm</span>
              </button>

            </div>
          </div>
        )}

        {/* Main Form Layout + Desktop Estimate Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main Card */}
          <div className={`${isSubmitted ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm text-left relative`}>
            
            {/* STEP 1: VEHICLE INFORMATION & A LA CARTE SERVICES */}
            {!isSubmitted && currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 1A: Vehicle Information */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                        <Car className="w-4 h-4 text-slate-800" />
                      </div>
                      <span>1. Vehicle Information</span>
                    </h3>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                      All Types Supported
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-3.5">
                    Enter the make, model, and registration number of your vehicle.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Vehicle Make & Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swift, Honda City, Creta, Pulsar, Activa, etc."
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KA 01 AB 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none text-sm text-slate-900 uppercase font-mono font-semibold placeholder:text-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 1B: Modular Detailing Services */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                          <Droplets className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>2. Detailing & Wash Services</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select treatments to include in your booking.
                      </p>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={selectAllServices}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('express_foam')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        Quick Wash
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetBundle('deep_interior_foam')}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 border border-red-200 transition-colors cursor-pointer"
                      >
                        Deep Interior Bundle
                      </button>
                    </div>
                  </div>

                  {/* Service Cards — compact horizontal rows on mobile, 2-col on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {MODULAR_SERVICES.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);

                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-red-50/50 border-red-500 ring-1 ring-red-400'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Mobile: single compact row — Icon | Name+Duration | Price | Checkbox */}
                          <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                              isSelected ? 'bg-white border-red-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                              {getProfessionalServiceIcon(srv.id)}
                            </div>

                            {/* Name + duration */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 font-['Outfit'] leading-tight truncate">
                                {srv.name}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-medium">
                                ~{srv.durationMinutes} min
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                              <span className="text-sm font-bold text-slate-900 font-['Outfit'] font-mono">₹{srv.price}</span>
                            </div>

                            {/* Checkbox */}
                            <div className={`w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : null}
                            </div>
                          </div>

                          {/* Description — hidden on mobile, shown on sm+ */}
                          <p className="hidden sm:block text-xs text-slate-500 mt-2 line-clamp-1 leading-relaxed pl-12">
                            {srv.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Footer */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-900">{selectedServiceIds.length}</span> services selected • Duration: <span className="font-semibold text-slate-900">{totalDurationMinutes} mins</span>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full sm:w-auto sm:px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Address</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 2: ADDRESS, GPS & DISTANCE */}
            {!isSubmitted && currentStep === 2 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 2A: Customer Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] mb-1 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <User className="w-4 h-4 text-slate-800" />
                    </div>
                    <span>1. Customer Details</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-3.5">
                    Our valet driver will contact this number upon dispatch.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. Anand Kumar"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-mono font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="anand@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2B: Doorstep Pickup Location */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                        <Navigation className="w-4 h-4 text-slate-800" />
                      </div>
                      <span>2. Doorstep Pickup Address & Distance</span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleUseLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting Location...' : 'Detect GPS Location'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Calculated live from Sri Thirumala Detailing Hub, Karpur Main Road.
                  </p>

                  {/* Popular quick area chips */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Common Locations near Hub:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {popularAreasWithDistance.map((area) => (
                        <button
                          key={area.name}
                          type="button"
                          onClick={() => handleAreaSelect(area.name, area.km)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
                        >
                          <span>{area.name}</span>
                          <span className="text-slate-500 font-mono">({area.km} km)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Textarea */}
                  <div className="relative mb-3">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={3}
                      placeholder="Building / Villa / Flat No., Street Name, Landmark, Karpur or surrounding area"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400"
                    ></textarea>
                  </div>

                  {/* Pincode & Landmark & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Postal Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="562125"
                        value={pickupPincode}
                        onChange={(e) => setPickupPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-mono font-medium placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Temple / School"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parking Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Basement B1 / Visitor Gate"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Professional Distance Metric Box */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <Compass className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px] font-medium">Distance from Karpur Hub:</span>
                        <span className="text-base font-bold text-slate-900 font-['Outfit'] font-mono">
                          {distanceKm} km
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="text-slate-500 block text-[11px] font-medium">Estimated Valet Transit:</span>
                      <span className="font-semibold text-slate-900 text-xs">~{Math.round(distanceKm * 2.5 + 5)} mins arrival window</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 Footer */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Timings</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: SCHEDULE & TIMELINE */}
            {!isSubmitted && currentStep === 3 && (
              <div className="space-y-6 sm:space-y-8">
                
                {/* 3A: Date Selector */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] mb-2 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-800" />
                    </div>
                    <span>1. Select Date</span>
                  </h3>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-slate-800 outline-none text-sm text-slate-900 font-semibold font-mono"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Checking real-time slot availability for {date}
                    </span>
                  </div>
                </div>

                {/* 3B: In-Time Slots with Live Conflict Detection */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                          <Clock className="w-4 h-4 text-slate-800" />
                        </div>
                        <span>2. Choose In-Time (Pickup Slot)</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select when our valet driver should collect your vehicle.
                      </p>
                    </div>
                  </div>

                  {/* Slot chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
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
                              alert(`The slot ${time} on ${date} is already reserved. Please select another slot.`);
                              return;
                            }
                            setInTime(time);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer select-none ${
                            booked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-semibold font-mono ${isSelected ? 'text-white' : booked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {time}
                            </span>
                            {booked ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                Booked
                              </span>
                            ) : isSelected ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                                Selected
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Open
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {booked ? 'Unavailable' : isSelected ? 'Confirmed' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3C: Dynamic Timeline Calculator Card */}
                  <div className="p-5 rounded-xl bg-slate-900 text-white text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-['Outfit'] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>Automated Valet Schedule</span>
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        Doorstep Delivery Guaranteed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
                      
                      {/* In-Time */}
                      <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 block text-[11px] font-medium uppercase">Pickup In-Time:</span>
                        <span className={`text-lg font-bold font-mono font-['Outfit'] ${inTime ? 'text-white' : 'text-slate-400 text-sm'}`}>
                          {inTime || 'Tap a slot above'}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Valet driver collection</span>
                      </div>

                      {/* Duration */}
                      <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                        <span className="text-slate-400 block text-[11px] font-medium uppercase">Treatment Duration:</span>
                        <span className="text-lg font-bold text-amber-400 font-mono font-['Outfit']">
                          {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{selectedServiceIds.length} services + 15m transit</span>
                      </div>

                      {/* Out-Time */}
                      <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
                        <span className="text-emerald-400 block text-[11px] font-medium uppercase">Return Out-Time:</span>
                        <span className={`text-lg font-bold font-mono font-['Outfit'] ${inTime ? 'text-emerald-400' : 'text-slate-400 text-sm'}`}>
                          {inTime ? outTime : 'Pending Slot Choice'}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Spotless vehicle return</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Step 3 Footer */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Review Booking</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 4: REVIEW & SUBMISSION */}
            {!isSubmitted && currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit'] mb-1">
                    Booking Summary & Review
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Please review your vehicle details, scheduled timings, and location.
                  </p>

                  {/* Clean Receipt Breakdown */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
                    
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Vehicle:</span>
                      <span className="font-bold text-slate-900 font-['Outfit'] text-right">
                        {vehicleModel} ({vehicleNumber.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Selected Treatments:</span>
                      <div className="text-right space-y-1 max-w-xs sm:max-w-sm">
                        {selectedServicesObjects.map((s) => (
                          <div key={s.id} className="text-slate-800 font-medium text-xs flex justify-between gap-4">
                            <span>• {s.name}</span>
                            <span className="font-mono font-semibold">₹{s.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Customer Contact:</span>
                      <span className="font-semibold text-slate-900">{customerName} ({customerPhone})</span>
                    </div>

                    <div className="flex justify-between items-start pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Doorstep Pickup:</span>
                      <span className="font-medium text-slate-900 max-w-xs sm:max-w-sm text-right">
                        {pickupAddress} ({pickupPincode})
                        <span className="block text-[11px] text-slate-500 font-mono mt-0.5">
                          {distanceKm} km from Karpur Hub
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Scheduled In-Time:</span>
                      <span className="font-bold text-slate-900 font-mono">{date} at {inTime}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Estimated Return Out-Time:</span>
                      <span className="font-bold text-emerald-700 font-mono">{date} at {outTime}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500 font-medium">Doorstep Valet Fee:</span>
                      <span className="font-bold text-emerald-700 uppercase tracking-wider text-xs">
                        Included (₹0)
                      </span>
                    </div>

                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-slate-700 text-xs flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-900">Zero Advance Required:</strong> Inspect the vehicle upon return and pay securely via Cash, UPI (GPay/PhonePe), or Card.
                    </span>
                  </div>
                </div>

                {/* Step 4 Footer */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 sm:px-10 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Booking • ₹{grandTotal}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMED BOOKING PASS & DISPATCH */}
            {isSubmitted && (
              <div className="text-center py-4 sm:py-6 space-y-6 max-w-2xl mx-auto">
                
                {/* Clean Status Badge */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    REFERENCE ID: {bookingId}
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-3">
                    Booking Confirmed
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1.5 leading-relaxed font-normal">
                    Thank you, <strong className="text-slate-900">{customerName}</strong>. Valet pickup is confirmed for <strong className="text-slate-900">{inTime}</strong> with vehicle return by <strong className="text-emerald-700">{outTime}</strong> on <strong className="text-slate-900">{date}</strong>.
                  </p>
                </div>

                {/* Printable Digital Valet Pass Ticket */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-300 shadow-md text-left relative">
                  
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Official Doorstep Valet Pass
                      </span>
                      <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                        SRI THIRUMALA FOAM WASH
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-slate-900 text-white">
                      {bookingId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs mb-3.5">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Vehicle:</span>
                      <span className="font-bold text-slate-900">{vehicleModel}</span>
                      <span className="block text-[10px] text-slate-600 font-mono font-semibold">{vehicleNumber.toUpperCase()}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">In-Time:</span>
                      <span className="font-bold text-slate-900 font-mono">{date} at {inTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Out-Time:</span>
                      <span className="font-bold text-emerald-700 font-mono">{date} at {outTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Distance:</span>
                      <span className="font-bold text-slate-900 font-mono">{distanceKm} km</span>
                    </div>
                  </div>

                  {/* Services Itemized */}
                  <div className="py-2.5 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 block text-[11px] font-medium mb-1.5">Treatments:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServicesObjects.map(s => (
                        <span key={s.id} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5 flex items-center justify-between text-xs mt-3">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Total Amount (Pay on Delivery):</span>
                      <span className="text-2xl font-bold text-slate-900 font-['Outfit']">₹{grandTotal}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] font-medium">Payment Modes:</span>
                      <span className="font-semibold text-slate-800 text-xs">Cash / UPI / Cards</span>
                    </div>
                  </div>
                </div>

                {/* Final CTA buttons */}
                <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${whatsappBookingMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Booking via WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Print Valet Pass</span>
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Return to Home
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Desktop Summary Sidebar */}
          {!isSubmitted && (
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              
              {/* Order Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left relative">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-red-600" />
                    <span>Reservation Quote</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Step {currentStep} of 4
                  </span>
                </div>

                <div className="py-3.5 space-y-2.5 text-xs">
                  
                  {/* Vehicle */}
                  {vehicleModel && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Vehicle:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[170px]">{vehicleModel}</span>
                    </div>
                  )}

                  {/* Services Selected */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-slate-500 block text-[11px] font-semibold uppercase">Services ({selectedServiceIds.length}):</span>
                    {selectedServicesObjects.map((s) => (
                      <div key={s.id} className="flex justify-between text-slate-700">
                        <span className="truncate max-w-[170px]">• {s.name}</span>
                        <span className="font-mono font-medium text-slate-900">₹{s.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Wash Duration */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-600">
                    <span className="font-medium">Estimated Duration:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m
                    </span>
                  </div>

                  {/* In & Out Time */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Schedule Window:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {inTime} ➔ {outTime}
                    </span>
                  </div>

                  {/* Distance from Hub */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Hub Distance:</span>
                    <span className="font-semibold text-slate-900 font-mono">{distanceKm} km</span>
                  </div>

                  {/* Doorstep Valet Fee */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-600">
                    <span className="font-medium">Doorstep Valet Fee:</span>
                    <span className="font-bold text-emerald-700">
                      FREE (₹0)
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3.5 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Total Amount:</span>
                    <span className="text-[11px] text-slate-600 font-normal">Payable upon delivery</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs text-slate-500 font-mono">₹</span>
                    <span className="text-2xl font-bold text-slate-900 font-['Outfit']">
                      {grandTotal}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 font-normal">
                  <ShieldCheck className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span>Zero advance payment required to book.</span>
                </div>
              </div>

              {/* Hub Hotline Contact */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left text-xs shadow-xs">
                <h4 className="font-bold text-slate-900 text-xs font-['Outfit'] mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Hub Dispatch Hotline</span>
                </h4>
                <p className="text-slate-500 mb-2 text-[11px]">
                  Special fleet requests or urgent scheduling support:
                </p>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-red-600 transition-colors text-xs"
                >
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

            </aside>
          )}

        </div>

      </main>

      {/* MOBILE STICKY BOTTOM BAR */}
      {!isSubmitted && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            
            {/* Price & Expand */}
            <div 
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-medium block leading-none">Total Amount</span>
                <span className="text-xl font-bold text-slate-900 font-['Outfit'] leading-tight font-mono">
                  ₹{grandTotal}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                {showMobileSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Step Action Button */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{currentStep === 1 ? 'Address' : currentStep === 2 ? 'Timings' : currentStep === 3 ? 'Review' : 'Confirm'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MOBILE SUMMARY DRAWER */}
      {showMobileSummary && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-t border-slate-200 rounded-t-2xl p-5 text-left shadow-2xl max-h-[75vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-red-600" />
                <span>Reservation Breakdown</span>
              </h3>
              <button
                onClick={() => setShowMobileSummary(false)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {vehicleModel && (
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">Vehicle:</span>
                  <span className="font-semibold text-slate-900">{vehicleModel} ({vehicleNumber || '—'})</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold block">Services Selected ({selectedServiceIds.length}):</span>
                {selectedServicesObjects.map((s) => (
                  <div key={s.id} className="flex justify-between text-slate-700 text-xs">
                    <span>• {s.name}</span>
                    <span className="font-mono font-medium text-slate-900">₹{s.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100 text-slate-700">
                <span>Duration:</span>
                <span className="font-medium text-slate-900 font-mono">{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Schedule:</span>
                <span className="font-medium text-slate-900 font-mono">{inTime} ➔ {outTime}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Doorstep Valet Fee:</span>
                <span className="font-semibold text-emerald-700">FREE (₹0)</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold items-baseline">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-xl text-slate-900 font-['Outfit'] font-mono">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMobileSummary(false);
                handleNextStep();
              }}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Continue Next Step →
            </button>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-left shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <span>My Saved Bookings</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {savedBookings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No previous bookings found.</p>
              ) : (
                savedBookings.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-900">{b.id}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {b.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 font-['Outfit'] text-sm">{b.vehicleModel} ({b.vehicleNumber})</p>
                    <p className="text-slate-700">{b.serviceName} • ₹{b.totalPrice}</p>
                    <p className="text-slate-500 text-[11px] font-mono">In: {b.inTime} ➔ Out: {b.outTime} ({b.date})</p>
                    <p className="text-slate-500 text-[11px] truncate">{b.pickupAddress} ({b.distanceKm} km)</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 font-normal">
        <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH • Professional Doorstep Detailing • Karpur Hub, Karnataka</p>
      </footer>

    </div>
  );
};
