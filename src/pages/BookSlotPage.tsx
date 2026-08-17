import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2,
  Phone,
  User,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VEHICLE_OPTIONS, COMPANY_INFO } from '../data/carWashData';
import type { VehicleCategory, BookingFormData } from '../types';

interface BookSlotPageProps {
  onNavigateHome: () => void;
}

export const BookSlotPage: React.FC<BookSlotPageProps> = ({ onNavigateHome }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  const [formData, setFormData] = useState<BookingFormData>({
    vehicleType: 'sedan',
    vehicleModel: '',
    vehicleNumber: '',
    serviceId: 'doorstep_foam_wash',
    addons: [],
    pickupAddress: '',
    pickupPincode: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM - 11:00 AM',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const currentVehicleObj = VEHICLE_OPTIONS.find(v => v.id === formData.vehicleType) || VEHICLE_OPTIONS[1];

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  const vehicleVisuals: Record<VehicleCategory, { img: string; title: string; desc: string }> = {
    hatchback: {
      img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
      title: 'Hatchback',
      desc: 'Swift, i20, Baleno, Polo, Tiago'
    },
    sedan: {
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      title: 'Sedan',
      desc: 'City, Verna, Ciaz, Slavia, Virtus'
    },
    suv: {
      img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      title: 'Compact SUV',
      desc: 'Creta, Seltos, Brezza, Thar, Nexon'
    },
    luxury_suv: {
      img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80',
      title: 'Full SUV / MUV',
      desc: 'Innova, Fortuner, XUV700, Safari, Ertiga'
    },
    luxury: {
      img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      title: 'Luxury / Supercar',
      desc: 'BMW, Mercedes-Benz, Audi, Jaguar, Porsche'
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && (!formData.vehicleModel || !formData.vehicleNumber)) {
      alert('Please enter your vehicle model and registration number.');
      return;
    }
    if (currentStep === 2 && (!formData.pickupAddress || !formData.customerName || !formData.customerPhone)) {
      alert('Please fill your name, contact phone number, and pickup address.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Confirm Booking
      const generatedId = `STFW-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingId(generatedId);
      setIsSubmitted(true);
      
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
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

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">Karpur, Karnataka</span>
            <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-amber-300 font-bold border border-orange-400/30">
              Valet Open
            </span>
          </div>

        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex-1">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2">
            DOORSTEP VALET BOOKING
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            Schedule Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">Foam Wash</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            We pick it up from your doorstep in Karpur & nearby areas, foam wash it, and bring it back shining.
          </p>
        </div>

        {/* Step Progression Bar */}
        {!isSubmitted && (
          <div className="max-w-2xl mx-auto mb-10 p-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${currentStep >= 1 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Vehicle Details</span>
            </div>
            <div className="w-6 sm:w-12 h-0.5 bg-white/10"></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${currentStep >= 2 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>2</span>
              <span>Pickup & Time</span>
            </div>
            <div className="w-6 sm:w-12 h-0.5 bg-white/10"></div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${currentStep >= 3 ? 'bg-red-600/30 text-amber-300 border border-red-400/40' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>3</span>
              <span>Confirmation</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md text-left">
          
          {/* STEP 1: VEHICLE SELECTION */}
          {!isSubmitted && currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
                  1. Select Your Vehicle Class
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Choose the category that best matches your vehicle.
                </p>

                {/* Visual Category Grid with Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(vehicleVisuals) as VehicleCategory[]).map((vKey) => {
                    const veh = vehicleVisuals[vKey];
                    const isSelected = formData.vehicleType === vKey;
                    return (
                      <div
                        key={vKey}
                        onClick={() => setFormData({ ...formData, vehicleType: vKey })}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-red-600/20 border-orange-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-102'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="h-32 w-full overflow-hidden bg-slate-900 relative">
                          <img
                            src={veh.img}
                            alt={veh.title}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent"></div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-400 text-slate-950 flex items-center justify-center font-bold">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h4 className="text-base font-bold text-white font-['Outfit']">
                            {veh.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {veh.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Make & Reg Number */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-4">
                  2. Vehicle Identification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Vehicle Model & Make *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Honda City / Hyundai Creta / Swift"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KA 01 AB 1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none text-sm text-white uppercase font-mono placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 CTA */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue to Pickup Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PICKUP LOCATION, DATE & TIME */}
          {!isSubmitted && currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
                  1. Your Contact Information
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  Our valet driver will call this number prior to vehicle collection.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Doorstep Pickup Address */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
                  2. Doorstep Pickup Address
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Provide your house/apartment number, street, and landmark in Karpur or surrounding areas.
                </p>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    placeholder="House/Flat No., Apartment / Building Name, Street, Landmark, Karpur"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white placeholder:text-slate-500"
                  ></textarea>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-4">
                  3. Preferred Date & Time Slot
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 focus:border-orange-400 outline-none text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#120707] border border-white/15 focus:border-orange-400 outline-none text-sm text-white"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2 Footer Navigation */}
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
                  <span>Review Booking</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {!isSubmitted && currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
                  Review & Confirm Your Slot
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Please check your vehicle and doorstep pickup details before confirming.
                </p>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between pb-3 border-b border-white/10">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-bold text-white font-['Outfit']">
                      {formData.vehicleModel} ({formData.vehicleNumber}) • {currentVehicleObj.name}
                    </span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-white/10">
                    <span className="text-slate-400">Customer Name:</span>
                    <span className="font-bold text-white">{formData.customerName}</span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-white/10">
                    <span className="text-slate-400">Phone Hotline:</span>
                    <span className="font-bold text-amber-300">{formData.customerPhone}</span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-white/10">
                    <span className="text-slate-400">Pickup Address:</span>
                    <span className="font-medium text-white max-w-sm text-right">{formData.pickupAddress}</span>
                  </div>

                  <div className="flex justify-between pb-3 border-b border-white/10">
                    <span className="text-slate-400">Scheduled Date & Slot:</span>
                    <span className="font-bold text-amber-300">{formData.date} at {formData.timeSlot}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Service:</span>
                    <span className="font-bold text-white">Doorstep Snow Foam Wash & Valet Return</span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-red-900/30 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span>
                    No advance payment required. Valet driver will conduct digital photo inspection upon vehicle pickup in Karpur.
                  </span>
                </div>
              </div>

              {/* Step 3 Footer Navigation */}
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
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-600/40 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Confirm Doorstep Booking</span>
                </button>
              </div>
            </div>
          )}

          {/* CONFIRMATION SCREEN */}
          {isSubmitted && (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 border border-white/15">
                  BOOKING REFERENCE: {bookingId}
                </span>

                <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] mt-4">
                  Slot Confirmed!
                </h2>

                <p className="text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  Thank you, <strong className="text-white">{formData.customerName}</strong>! Our valet team will arrive at <strong className="text-white">{formData.pickupAddress}</strong> on <strong className="text-amber-300">{formData.date}</strong> during <strong className="text-amber-300">{formData.timeSlot}</strong>.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/15 max-w-md mx-auto text-left text-xs space-y-2">
                <h4 className="font-bold text-white text-sm font-['Outfit']">What happens next:</h4>
                <p className="text-slate-300">• Valet driver calls you 15 minutes before arrival.</p>
                <p className="text-slate-300">• Pre-wash digital condition inspection checklist.</p>
                <p className="text-slate-300">• Professional snow foam wash & deep cleaning.</p>
                <p className="text-slate-300">• Spotless vehicle returned right back to your location.</p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
                <button
                  onClick={onNavigateHome}
                  className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  Return to Home
                </button>

                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20I%20have%20confirmed%20booking%20reference%20${bookingId}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
                >
                  Send Booking to WhatsApp
                </a>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH • Karpur, Karnataka</p>
      </footer>

    </div>
  );
};
