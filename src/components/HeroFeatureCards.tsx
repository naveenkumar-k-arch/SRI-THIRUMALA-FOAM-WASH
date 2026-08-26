import React from 'react';
import { Car, Sparkles, Calendar, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const HeroFeatureCards: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const keyPoints = [
    {
      id: 'pickup',
      title: 'Valet Pickup & Return',
      description: 'No need to spend your time driving to the wash center. Our team handles secure pickup, wash transit, and delivery.',
      icon: Car,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 border-red-200'
    },
    {
      id: 'foam',
      title: 'Active High-Foam Decontamination',
      description: 'pH-neutral dense snow foam lifts stubborn road grime, dust, and brake particles without abrasive micro-scratches.',
      icon: Droplets,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'booking',
      title: 'Digital Slot Reservation',
      description: 'Select your vehicle, choose custom modular treatments, and reserve an exact in-time slot with live timeline tracking.',
      icon: Calendar,
      iconColor: 'text-slate-900',
      iconBg: 'bg-slate-100 border-slate-200'
    }
  ];

  return (
    <section id="about" className="bg-white py-16 sm:py-24 border-b border-slate-200 text-left relative z-20 overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-Column Story-Driven About Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Large Premium Car Detailing Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 group ring-1 ring-black/5">
              <img
                src="/images/foam/about-showcase.png"
                alt="Sri Thirumala Foam Wash - Premium Car & Bike Service Facility"
                className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Floating Bottom Overlap Badge */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-2xl flex items-center justify-between z-10 transition-transform group-hover:-translate-y-0.5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-xs sm:text-sm font-['Outfit'] leading-tight">
                      Official Service Facility
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">
                      Premium Foam & Detailing Station
                    </p>
                  </div>
                </div>

                <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-xs flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Facility</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Story-Driven Content & 3 Key Points */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Heading */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ABOUT SRI THIRUMALA FOAM WASH</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
                Your Vehicle Deserves <br className="hidden sm:inline" />
                <span className="text-red-600">More Than Just a Wash.</span>
              </h2>
            </div>

            {/* Story Description */}
            <div className="space-y-3 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                Sri Thirumala Foam Wash is an automotive care studio based in <strong className="text-slate-900 font-semibold">Karpur, Karnataka</strong>, dedicated to making high-precision car detailing and foam washing effortless, convenient, and reliable.
              </p>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm sm:text-base shadow-xs flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900 font-bold">You book it.</strong> We pick it up. <strong className="text-red-600 font-bold">We clean it.</strong> We bring it back.
                </span>
              </div>
            </div>

            {/* 3 Key Points Cards with 3D Tilt */}
            <div className="space-y-3 pt-1 perspective-container">
              {keyPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 card-3d flex items-start gap-4 cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl ${point.iconBg} border flex items-center justify-center flex-shrink-0 mt-0.5 depth-pop`}>
                      <Icon className={`w-5 h-5 ${point.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit']">
                        {point.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Booking CTA Button */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tactile-dark-btn cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-red-400" />
                <span>BOOK A WASH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
