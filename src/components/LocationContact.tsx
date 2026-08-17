import React from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface LocationContactProps {
  onOpenBooking: () => void;
}

export const LocationContact: React.FC<LocationContactProps> = ({ onOpenBooking }) => {
  return (
    <section id="contact" className="py-20 sm:py-24 bg-[#030712] relative text-left overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* FINAL PROMPT CTA: YOUR CAR DESERVES A PROPER CLEAN */}
        <div className="mb-16 sm:mb-20 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-900 border border-white/15 text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 block mb-3 font-['Outfit']">
              EXPERIENCE THE SHINE
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-['Outfit'] uppercase leading-tight mb-4">
              YOUR CAR DESERVES <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
                A PROPER CLEAN.
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-lg font-medium max-w-xl mx-auto mb-8">
              Book a wash today. We'll pick it up, wash it, and bring it back gleaming.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-red-600/40 hover:scale-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5 text-amber-200" />
                <span>BOOK A WASH</span>
              </button>

              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>CALL NOW</span>
              </a>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 bg-white/5 hover:bg-white/15 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/15 transition-all flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-amber-300" />
                <span>GET DIRECTIONS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hub Location Details & Interactive Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-white/[0.03] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hub is Open Everyday • Valet Active</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mb-6">
                LOCATION & CONTACT
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-400/30 text-amber-300 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Service Location</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                      {COMPANY_INFO.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-400/30 text-amber-300 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Working Hours</h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      {COMPANY_INFO.timing}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-400/30 text-amber-300 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Phone Hotline</h4>
                    <a 
                      href={`tel:${COMPANY_INFO.phone}`} 
                      className="text-xs sm:text-sm text-orange-400 font-bold hover:underline"
                    >
                      {COMPANY_INFO.displayPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Links on Mobile & Desktop */}
            <div className="pt-6 mt-8 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20I%20would%20like%20to%20book%20a%20doorstep%20wash.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Booking</span>
              </a>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4 text-amber-300" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right Interactive Map Card */}
          <div className="lg:col-span-7 bg-white/[0.03] rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl flex flex-col justify-between">
            <div className="relative w-full h-[260px] sm:h-[360px] rounded-2xl overflow-hidden border border-white/15">
              <iframe
                title="Sri Thirumala Foam Wash Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.877660682855!2d77.6!3d12.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzEyLjAiTiA3N8KwMzYnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale contrast-125 opacity-90"
                loading="lazy"
              ></iframe>

              {/* Floating Overlay Badge on Map */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 p-3 rounded-2xl bg-[#030712]/90 backdrop-blur-md shadow-2xl border border-white/20 text-left">
                <p className="text-xs font-black text-white font-['Outfit'] uppercase">
                  Sri Thirumala Foam Wash
                </p>
                <p className="text-[10px] sm:text-[11px] text-orange-400">
                  Karpur, Karnataka & Doorstep Valet Radius
                </p>
              </div>
            </div>

            {/* Service radius assurance pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 text-xs font-bold text-slate-300 text-left">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span className="text-[11px]">Doorstep Pickup</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span className="text-[11px]">Insured Valet</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span className="text-[11px]">Snow Foam Care</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span className="text-[11px]">Zero Advance</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
