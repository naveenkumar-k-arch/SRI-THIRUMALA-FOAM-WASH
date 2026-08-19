import React from 'react';
import { Smartphone, Car, Sparkles, Key, ArrowRight, ShieldCheck } from 'lucide-react';

interface HowItWorksProps {
  onOpenBooking: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenBooking }) => {
  const steps = [
    {
      num: '01',
      title: 'BOOK SLOT',
      subtitle: 'Choose vehicle & services.',
      desc: 'Select your vehicle type, choose a la carte treatments, and pick an exact in-time slot.',
      icon: Smartphone,
      accent: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200'
    },
    {
      num: '02',
      title: 'VALET PICKUP',
      subtitle: 'Driver collects your vehicle.',
      desc: 'Our verified valet arrives at your doorstep, conducts a quick check, and departs safely.',
      icon: Key,
      accent: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200'
    },
    {
      num: '03',
      title: 'PRECISION WASH',
      subtitle: 'Snow foam & detailing.',
      desc: 'Thick snow foam bath, underbody rinse, microfiber wash, vacuum extraction, and glass polish.',
      icon: Sparkles,
      accent: 'text-red-600',
      iconBg: 'bg-red-50 border-red-200'
    },
    {
      num: '04',
      title: 'VALET RETURN',
      subtitle: 'Delivered back to your door.',
      desc: 'Your spotless vehicle is delivered on-schedule right back to your exact doorstep.',
      icon: Car,
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden border-b border-slate-200 text-left w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>DOORSTEP WORKFLOW</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] uppercase leading-tight">
            Spotless Vehicle. <span className="text-red-600">Zero Hassle.</span>
          </h2>
          
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            "Why waste your weekend at the wash center when our valet comes right to your door?"
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num} 
                className="relative bg-white hover:bg-slate-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-300 group-hover:text-slate-900 transition-colors font-['Outfit']">
                    {step.num}
                  </span>
                  <div className={`w-11 h-11 rounded-xl ${step.iconBg} border ${step.accent} flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit'] uppercase tracking-tight group-hover:text-red-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                  <span>Phase {idx + 1} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-red-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-10 text-center">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <span>RESERVE DOORSTEP SLOT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
