import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VEHICLE_OPTIONS, SERVICE_PACKAGES, SERVICE_ADDONS } from '../data/carWashData';
import type { VehicleCategory, BookingFormData } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: VehicleCategory;
  initialServiceId?: string;
  initialAddons?: string[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialVehicle = 'sedan',
  initialServiceId = 'deep_interior_foam',
  initialAddons = []
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  const [formData, setFormData] = useState<BookingFormData>({
    vehicleType: initialVehicle,
    vehicleModel: '',
    vehicleNumber: '',
    serviceId: initialServiceId,
    addons: initialAddons,
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
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleType: initialVehicle,
        serviceId: initialServiceId,
        addons: initialAddons
      }));
      setCurrentStep(1);
      setIsSubmitted(false);
    }
  }, [isOpen, initialVehicle, initialServiceId, initialAddons]);

  if (!isOpen) return null;

  const currentVehicleObj = VEHICLE_OPTIONS.find(v => v.id === formData.vehicleType) || VEHICLE_OPTIONS[1];
  const currentServiceObj = SERVICE_PACKAGES.find(s => s.id === formData.serviceId) || SERVICE_PACKAGES[1];

  const basePrice = Math.round(currentServiceObj.basePrice * currentVehicleObj.multiplier);
  const addonsTotal = formData.addons.reduce((sum, addonId) => {
    const addon = SERVICE_ADDONS.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);
  const totalPrice = basePrice + addonsTotal;

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  const handleToggleAddon = (addonId: string) => {
    if (formData.addons.includes(addonId)) {
      setFormData({ ...formData, addons: formData.addons.filter(id => id !== addonId) });
    } else {
      setFormData({ ...formData, addons: [...formData.addons, addonId] });
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && (!formData.vehicleModel || !formData.vehicleNumber)) {
      alert('Please enter vehicle model and registration number.');
      return;
    }
    if (currentStep === 3 && (!formData.pickupAddress || !formData.customerName || !formData.customerPhone)) {
      alert('Please fill your name, phone number, and pickup address.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final Submit
      const generatedId = `STFW-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingId(generatedId);
      setIsSubmitted(true);
      
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Outfit']">
                {isSubmitted ? 'Booking Confirmed!' : 'Book Doorstep Foam Wash'}
              </h3>
              <p className="text-xs text-slate-300">
                {isSubmitted 
                  ? 'Your valet pickup has been scheduled' 
                  : `Step ${currentStep} of 4 • Sri Thirumala Doorstep Valet`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        {!isSubmitted && (
          <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-red-600' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Vehicle</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-red-600' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Package</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-red-600' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Location & Slot</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-red-600' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 4 ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>4</span>
              <span>Review</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          
          {/* STEP 1: VEHICLE */}
          {!isSubmitted && currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                  Select Vehicle Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {VEHICLE_OPTIONS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, vehicleType: v.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        formData.vehicleType === v.id
                          ? 'bg-red-50 border-red-500 shadow-sm text-red-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{v.name}</span>
                        {formData.vehicleType === v.id && <Check className="w-3.5 h-3.5 text-red-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">{v.example}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Model / Make *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Honda City / Hyundai Creta"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AP 39 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE & ADDONS */}
          {!isSubmitted && currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                  Choose Wash Package
                </label>
                <div className="space-y-2.5">
                  {SERVICE_PACKAGES.map((pkg) => {
                    const price = Math.round(pkg.basePrice * currentVehicleObj.multiplier);
                    const isSelected = formData.serviceId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setFormData({ ...formData, serviceId: pkg.id })}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-red-50/80 border-red-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{pkg.name}</h4>
                            <p className="text-xs text-slate-500">{pkg.duration} • {pkg.tagline}</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900">₹{price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                  Add-on Treatments (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SERVICE_ADDONS.map((addon) => {
                    const isSelected = formData.addons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          isSelected ? 'bg-red-50 border-red-400 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <span>{addon.name}</span>
                          <p className="text-[10px] text-red-600 font-bold">+₹{addon.price}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-red-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PICKUP LOCATION & TIME SLOT */}
          {!isSubmitted && currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doorstep Pickup Address *
                </label>
                <textarea
                  rows={2}
                  placeholder="Apartment name / House No, Street, Landmark"
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time Slot *
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm bg-white"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {!isSubmitted && currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                  <span>Vehicle:</span>
                  <span>{formData.vehicleModel} ({formData.vehicleNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Wash Package:</span>
                  <span className="font-bold text-slate-900">{currentServiceObj.name} (₹{basePrice})</span>
                </div>
                {formData.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Add-ons ({formData.addons.length}):</span>
                    <span className="font-bold text-slate-900">+₹{addonsTotal}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Valet Pickup Address:</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs truncate">{formData.pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Scheduled Time:</span>
                  <span className="font-bold text-red-600">{formData.date} at {formData.timeSlot}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="text-2xl text-red-600 font-['Outfit']">₹{totalPrice}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>Zero Advance Payment. Pay via Cash / UPI / Card only after inspecting your clean vehicle!</span>
              </div>
            </div>
          )}

          {/* CONFIRMATION SCREEN */}
          {isSubmitted && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono">
                  REF: {bookingId}
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                  Valet Pickup Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Thank you, <span className="font-bold text-slate-900">{formData.customerName}</span>! Our valet driver will arrive at <span className="font-bold text-slate-900">{formData.pickupAddress}</span> on <span className="font-bold text-red-600">{formData.date}</span> ({formData.timeSlot}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs text-left space-y-1">
                <p className="font-bold text-slate-800">Next Steps:</p>
                <p className="text-slate-600">1. Digital vehicle inspection photos upon pickup.</p>
                <p className="text-slate-600">2. Real-time wash updates via WhatsApp.</p>
                <p className="text-slate-600">3. Drop back spotless & shiny.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Navigation */}
        {!isSubmitted && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-800">
                Total: <span className="text-red-600">₹{totalPrice}</span>
              </span>

              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                <span>{currentStep === 4 ? 'Confirm & Schedule' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
