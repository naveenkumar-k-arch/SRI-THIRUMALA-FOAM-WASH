import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Car,
  Zap
} from 'lucide-react';
import { VEHICLE_OPTIONS, SERVICE_PACKAGES, SERVICE_ADDONS } from '../data/carWashData';
import type { VehicleCategory } from '../types';

interface ServicesPricingProps {
  onSelectService: (vehicleType: VehicleCategory, serviceId: string, addons: string[]) => void;
}

export const ServicesPricing: React.FC<ServicesPricingProps> = ({ onSelectService }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('sedan');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const currentVehicle = VEHICLE_OPTIONS.find(v => v.id === selectedVehicle) || VEHICLE_OPTIONS[1];

  const calculatePrice = (basePrice: number) => {
    return Math.round(basePrice * currentVehicle.multiplier);
  };

  const toggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((sum, addonId) => {
      const addon = SERVICE_ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
  };

  const handleBookPackage = (packageId: string) => {
    onSelectService(selectedVehicle, packageId, selectedAddons);
  };

  return (
    <section id="pricing" className="py-24 bg-[#030712] relative border-b border-white/10 text-slate-100">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-orange-400 font-['Outfit'] block mb-2">
            TRANSPARENT VALUE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit'] uppercase">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">PERFECT WASH</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base font-normal">
            Select your vehicle class below to view custom tailored packages with doorstep valet pickup & delivery included.
          </p>
        </div>

        {/* Vehicle Selection Segment Bar - scrollable on mobile */}
        <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner gap-1.5 flex-nowrap">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Vehicle Context Bar */}
        <div className="max-w-xl mx-auto mb-12 p-3 rounded-2xl bg-red-950/30 border border-red-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-orange-400">Class:</span>
            <span className="font-semibold text-white">{currentVehicle.name}</span>
            <span className="text-slate-400 hidden sm:inline">({currentVehicle.example})</span>
          </div>
          <span className="font-bold text-amber-300 text-[11px] bg-red-500/20 px-2.5 py-0.5 rounded border border-orange-400/30 whitespace-nowrap">
            Free Pickup & Delivery
          </span>
        </div>

        {/* Service Package Cards Grid - 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {SERVICE_PACKAGES.map((pkg) => {
            const price = calculatePrice(pkg.basePrice);
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${
                  isPopular
                    ? 'bg-gradient-to-b from-red-950/40 via-white/[0.04] to-white/[0.02] border-2 border-orange-400/60 shadow-2xl shadow-red-900/30 scale-102 z-10'
                    : 'bg-white/[0.03] border border-white/10 hover:border-white/20 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider font-mono">
                      {pkg.duration}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      Doorstep Valet
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white font-['Outfit'] mt-1">
                    {pkg.name}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                    {pkg.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="my-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400 font-mono">₹</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-300 font-['Outfit']">
                      {price}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ all-inclusive</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-left mb-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      What's Included:
                    </p>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                        <Check className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={() => handleBookPackage(pkg.id)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg shadow-red-600/40 hover:scale-102 active:scale-100'
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/10 hover:border-orange-400/40'
                  }`}
                >
                  <span>Select & Book Slot</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Optional Add-Ons Bar */}
        <div className="mt-14 bg-white/[0.02] rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span>Recommended Add-On Treatments</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Enhance your wash package with specialized protective treatments.
              </p>
            </div>
            {selectedAddons.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-600/30 text-amber-300 border border-red-500/40 font-mono">
                {selectedAddons.length} Selected (+₹{calculateAddonsTotal()})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_ADDONS.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-red-600/20 border-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-orange-400'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white font-['Outfit']">
                      {addon.name}
                    </h4>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-orange-400 text-slate-950 font-bold' : 'border border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-3">
                    {addon.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-extrabold pt-2 border-t border-white/10">
                    <span className="text-amber-300 font-mono">+₹{addon.price}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {isSelected ? 'Selected' : 'Add to wash'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
