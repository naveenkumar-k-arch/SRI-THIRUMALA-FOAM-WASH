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
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
                alt="Sri Thirumala Foam Wash - Professional Clean Car"
                className="w-full h-[380px] sm:h-[480px] object-cover object-center group-hover:scale-104 transition-transform duration-700"
              />
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 pointer-events-none"></div>

              {/* Floating Bottom Badge on Image */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm font-['Outfit']">
                      Karpur Detailing Hub
                    </h4>
                    <p className="text-xs text-slate-500">
                      Doorstep Valet & Return
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Valet Active</span>
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

            {/* 3 Key Points Cards */}
            <div className="space-y-3 pt-1">
              {keyPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl ${point.iconBg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer hover:shadow-md"
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
