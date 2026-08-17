import React from 'react';
import { Car, Sparkles, Calendar, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const HeroFeatureCards: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const keyPoints = [
    {
      id: 'pickup',
      title: 'Pickup & Delivery',
      description: 'No need to spend your time driving to the wash center. Book your service and let our team handle the pickup and return.',
      icon: Car,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-400/30',
      borderGlow: 'hover:border-orange-500/50 hover:bg-orange-500/5'
    },
    {
      id: 'foam',
      title: 'Professional Foam Cleaning',
      description: 'A focused vehicle-cleaning experience designed to remove everyday dirt, dust and road grime.',
      icon: Droplets,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-400/30',
      borderGlow: 'hover:border-orange-500/50 hover:bg-orange-500/5'
    },
    {
      id: 'booking',
      title: 'Easy Booking',
      description: 'Choose your vehicle, service and preferred time through our online booking system.',
      icon: Calendar,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-400/30',
      borderGlow: 'hover:border-red-500/50 hover:bg-red-500/5'
    }
  ];

  return (
    <section id="about" className="bg-[#030712] py-20 sm:py-24 border-b border-white/10 text-left relative z-20 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-Column Story-Driven About Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Large Premium Car Detailing Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl bg-slate-900 group">
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
                alt="Sri Thirumala Foam Wash - Professional Clean Car"
                className="w-full h-[420px] sm:h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80 pointer-events-none"></div>

              {/* Floating Bottom Badge on Image */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#030712]/85 backdrop-blur-md border border-white/15 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-400/30 text-red-400 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm font-['Outfit']">
                      Karpur, Karnataka
                    </h4>
                    <p className="text-xs text-slate-400">
                      Doorstep Pickup & Return
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-amber-300 border border-orange-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active Service</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Story-Driven Content & 3 Key Points */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Small Heading */}
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block">
                ABOUT SRI THIRUMALA FOAM WASH
              </span>
              <div className="h-0.5 w-16 bg-red-500 rounded-full mt-2 shadow-[0_0_8px_#dc2626]"></div>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
              Your Car Deserves <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">
                More Than Just a Wash.
              </span>
            </h2>

            {/* Story Description */}
            <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                Sri Thirumala Foam Wash is a vehicle cleaning service based in <strong className="text-white">Karpur, Karnataka</strong>, focused on making car washing simple, convenient and professional.
              </p>
              <p>
                With our pickup-and-delivery concept, customers can book a wash and let our team handle the vehicle from pickup to cleaning and return.
              </p>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-red-500/30 text-white font-bold text-sm sm:text-base shadow-sm flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>
                  <strong className="text-amber-300">You book it.</strong> We pick it up. <strong className="text-red-300">We clean it.</strong> We bring it back.
                </span>
              </div>
            </div>

            {/* 3 Key Points Cards with SVG Icons */}
            <div className="space-y-3 pt-2">
              {keyPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.id}
                    className={`p-4 rounded-2xl bg-white/[0.03] border border-white/10 ${point.borderGlow} transition-all duration-200 flex items-start gap-4`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${point.iconBg} border ${point.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                        {point.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-102 active:scale-100"
              >
                <Calendar className="w-4 h-4 text-red-200" />
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
