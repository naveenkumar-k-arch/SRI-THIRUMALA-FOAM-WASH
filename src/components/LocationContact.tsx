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
  ShieldCheck
} from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface LocationContactProps {
  onOpenBooking: () => void;
}

export const LocationContact: React.FC<LocationContactProps> = ({ onOpenBooking }) => {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-slate-50 relative text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* FINAL PROMPT CTA CARD */}
        <div className="mb-14 sm:mb-16 rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-7 sm:p-12 shadow-lg border border-slate-800 relative overflow-hidden text-center">
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-red-400 text-xs font-semibold tracking-wide mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DOORSTEP DETAILING SERVICE</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-['Outfit'] uppercase leading-tight mb-3">
              Your Vehicle Deserves <br />
              <span className="text-red-500">A Proper Foam Wash.</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-base font-normal max-w-xl mx-auto mb-6">
              Reserve your slot today. We'll pick it up, wash it with dense active snow foam, and deliver it back showroom clean.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Calendar className="w-4 h-4 text-red-200" />
                <span>BOOK A WASH</span>
              </button>

              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-slate-300" />
                <span>CALL NOW</span>
              </a>

              <a
                href={COMPANY_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-slate-300" />
                <span>DIRECTIONS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hub Location Details & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hub is Open Everyday • Valet Active</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit'] mb-5">
                Location & Hub Details
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">Service Hub Address</h4>
                    <p className="text-xs text-slate-700 font-medium mt-0.5 leading-relaxed">
                      {COMPANY_INFO.address}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      Plus Code: {COMPANY_INFO.plusCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">Operating Hours</h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {COMPANY_INFO.timing}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">Direct Helpline</h4>
                    <a 
                      href={`tel:${COMPANY_INFO.phone}`} 
                      className="text-xs sm:text-sm text-red-600 font-bold hover:underline"
                    >
                      {COMPANY_INFO.displayPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="pt-5 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20I%20would%20like%20to%20book%20a%20doorstep%20wash.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Hub</span>
              </a>

              <a
                href={COMPANY_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-slate-600" />
                <span>Google Maps</span>
              </a>
            </div>
          </div>

          {/* Right Interactive Map Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="relative w-full h-[240px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-200">
              <iframe
                title="Sri Thirumala Foam Wash Location - Karpur Rd, Karpur, Karnataka"
                src="https://maps.google.com/maps?q=12.7225,77.7191&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale opacity-90"
                loading="lazy"
              ></iframe>

              {/* Floating Overlay Badge on Map */}
              <div className="absolute top-3 left-3 p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-left">
                <p className="text-xs font-bold text-slate-900 font-['Outfit'] uppercase">
                  Sri Thirumala Foam Wash
                </p>
                <p className="text-[10px] text-slate-500">
                  {COMPANY_INFO.address}
                </p>
              </div>
            </div>

            {/* Service radius assurance pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 text-xs font-semibold text-slate-700 text-left">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px]">Doorstep Valet</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px]">Secure Transit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px]">Snow Foam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px]">Zero Advance</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
