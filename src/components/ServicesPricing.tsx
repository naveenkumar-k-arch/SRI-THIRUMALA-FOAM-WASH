import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Car
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
    <section id="pricing" className="py-20 bg-white relative border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600 font-['Outfit'] block mb-2">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Outfit'] uppercase">
            CHOOSE YOUR <span className="text-red-600">PERFECT WASH</span>
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg font-medium">
            Select your vehicle class below to view custom tailored packages with doorstep pickup & delivery included.
          </p>
        </div>

        {/* Vehicle Selection Segment Bar */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-3">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner gap-1.5">
            {VEHICLE_OPTIONS.map((v) => {
              const isSelected = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/25 scale-102'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Vehicle Context Bar */}
        <div className="max-w-xl mx-auto mb-10 p-3 rounded-2xl bg-red-50/70 border border-red-100 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-700">Selected Class:</span>
            <span className="font-semibold text-slate-900">{currentVehicle.name}</span>
            <span className="text-slate-400">({currentVehicle.example})</span>
          </div>
          <span className="font-semibold text-red-600 text-[11px]">Free Pickup & Delivery</span>
        </div>

        {/* Service Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {SERVICE_PACKAGES.map((pkg) => {
            const price = calculatePrice(pkg.basePrice);
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-gradient-to-b from-red-50/60 via-white to-white border-2 border-red-500 shadow-xl shadow-red-500/10 scale-102 z-10'
                    : 'bg-white border border-slate-200/90 shadow-md hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
                      {pkg.duration}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Doorstep Valet
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 font-['Outfit'] mt-1">
                    {pkg.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 mt-1 min-h-[36px]">
                    {pkg.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-500">₹</span>
                    <span className="text-4xl font-black text-slate-900 font-['Outfit']">
                      {price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ all-inclusive</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-left mb-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      What's Included:
                    </p>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
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
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:scale-102 active:scale-100'
                      : 'bg-slate-900 hover:bg-red-600 text-white shadow-md'
                  }`}
                >
                  <span>Select & Book</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Optional Add-Ons Bar */}
        <div className="mt-16 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                Recommended Add-On Treatments
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Enhance your wash package with specialized protective treatments.
              </p>
            </div>
            {selectedAddons.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800">
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
                      ? 'bg-red-50/80 border-red-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {addon.name}
                    </h4>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-red-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-3">
                    {addon.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-extrabold pt-2 border-t border-slate-100">
                    <span className="text-red-600">+₹{addon.price}</span>
                    <span className="text-[11px] text-slate-400 font-normal">Add to wash</span>
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
