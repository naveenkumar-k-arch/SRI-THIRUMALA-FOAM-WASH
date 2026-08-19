import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Car,
  Zap,
  ShieldCheck
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
    <section id="pricing" className="py-16 sm:py-24 bg-slate-50 relative border-b border-slate-200 text-slate-900 overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>TRANSPARENT VALUE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] uppercase leading-tight">
            Choose Your <span className="text-red-600">Wash Treatment</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            Select your vehicle class below to view custom tailored packages with doorstep valet pickup & delivery included.
          </p>
        </div>

        {/* Vehicle Selection Segment Bar - scrollable on mobile */}
        <div className="flex justify-start sm:justify-center mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs gap-1.5 flex-nowrap">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
        <div className="max-w-xl mx-auto mb-10 p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
            <span className="font-bold text-slate-900">Vehicle Class:</span>
            <span className="font-semibold text-red-600">{currentVehicle.name}</span>
            <span className="text-slate-500 hidden sm:inline">({currentVehicle.example})</span>
          </div>
          <span className="font-semibold text-emerald-700 text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
            Complimentary Doorstep Valet Included
          </span>
        </div>

        {/* Service Package Cards Grid with 3D Tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 perspective-container">
          {SERVICE_PACKAGES.map((pkg) => {
            const price = calculatePrice(pkg.basePrice);
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-default ${
                  isPopular
                    ? 'bg-slate-900 text-white border-2 border-red-600 shadow-xl card-3d-dark z-10'
                    : 'bg-white border border-slate-200 text-slate-900 card-3d'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm depth-pop">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isPopular ? 'text-amber-400' : 'text-red-600'}`}>
                      {pkg.duration}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isPopular ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      Valet Included
                    </span>
                  </div>

                  <h3 className={`text-lg font-extrabold font-['Outfit'] mt-1 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {pkg.name}
                  </h3>
                  
                  <p className={`text-xs mt-1 min-h-[32px] leading-relaxed ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    {pkg.tagline}
                  </p>

                  {/* Price Block */}
                  <div className={`my-5 p-3.5 rounded-xl border flex items-baseline gap-1 depth-pop ${
                    isPopular ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-sm font-bold font-mono ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                    <span className={`text-3xl font-extrabold font-['Outfit'] ${isPopular ? 'text-amber-400' : 'text-slate-900'}`}>
                      {price}
                    </span>
                    <span className={`text-xs ml-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>/ all-inclusive</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 text-left mb-6">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                      What's Included:
                    </p>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className={`flex items-start gap-2 text-xs font-medium ${isPopular ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-red-400' : 'text-red-600'}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={() => handleBookPackage(pkg.id)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-red-600 hover:bg-red-700 text-white tactile-btn'
                      : 'bg-slate-900 hover:bg-slate-800 text-white tactile-dark-btn'
                  }`}
                >
                  <span>Select & Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Optional Add-Ons Bar */}
        <div className="mt-12 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 text-left">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-600" />
                <span>Recommended Add-On Treatments</span>
              </h3>
              <p className="text-xs text-slate-500">
                Enhance your wash package with specialized protective treatments.
              </p>
            </div>
            {selectedAddons.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono self-start sm:self-auto">
                {selectedAddons.length} Selected (+₹{calculateAddonsTotal()})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SERVICE_ADDONS.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-red-50/60 border-red-500 ring-1 ring-red-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">
                        {addon.name}
                      </h4>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-red-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed line-clamp-2">
                      {addon.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200/60">
                    <span className="text-slate-900 font-mono">+₹{addon.price}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-red-600 font-semibold' : 'text-slate-400 font-normal'}`}>
                      {isSelected ? 'Selected' : 'Add treatment'}
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
