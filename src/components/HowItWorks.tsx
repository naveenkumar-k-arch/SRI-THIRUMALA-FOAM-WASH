import React from 'react';
import { Smartphone, Car, Sparkles, Key, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenBooking: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenBooking }) => {
  const steps = [
    {
      num: '01',
      title: 'BOOK',
      subtitle: 'Choose your vehicle & slot.',
      desc: 'Select your vehicle category and pick a convenient doorstep pickup time slot in Karpur.',
      icon: Smartphone,
      accent: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-400/30'
    },
    {
      num: '02',
      title: 'WE PICK IT UP',
      subtitle: 'Valet driver collects your car.',
      desc: 'Our trained valet arrives at your address, conducts a digital inspection, and safely collects the vehicle.',
      icon: Key,
      accent: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-400/30'
    },
    {
      num: '03',
      title: 'WE WASH',
      subtitle: 'Deep snow foam cleaning.',
      desc: 'High-pressure underbody rinse, thick snow foam blanket, microfiber hand scrub, and rim detailing.',
      icon: Sparkles,
      accent: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-400/30'
    },
    {
      num: '04',
      title: 'WE BRING IT BACK',
      subtitle: 'Spotless vehicle returned.',
      desc: 'Your gleaming, showroom-fresh car is delivered right back to your doorstep.',
      icon: Car,
      accent: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-400/30'
    }
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#030712] relative overflow-hidden border-b border-white/10 text-left w-full max-w-full">
      
      {/* Background Subtle Ambience */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2 drop-shadow-sm">
            DOORSTEP WORKFLOW
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight uppercase">
            CLEAN CAR. <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">ZERO HASSLE.</span>
          </h2>
          
          <p className="mt-3 text-slate-300 text-xs sm:text-base font-medium">
            "Why drive to the wash when we can come to you?"
          </p>
        </div>

        {/* 4 Steps Grid - 1 Col on Mobile, 2 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num} 
                className="relative bg-white/[0.03] hover:bg-white/[0.07] rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-red-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step number badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-white/20 group-hover:text-orange-400 transition-colors font-['Outfit']">
                    {step.num}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl ${step.iconBg} border ${step.accent} flex items-center justify-center transition-transform group-hover:scale-110 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] uppercase tracking-tight group-hover:text-amber-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                    {step.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs font-bold text-slate-500 group-hover:text-orange-400 transition-colors">
                  <span>Phase {idx + 1} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 transition-all cursor-pointer transform active:scale-98"
          >
            <span>BOOK YOUR WASH NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
