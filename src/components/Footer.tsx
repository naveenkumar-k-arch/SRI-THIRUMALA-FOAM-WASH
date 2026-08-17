import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking: _onOpenBooking }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-left pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Bio (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-md bg-slate-950 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Sri Thirumala Foam Wash" 
                  className="w-full h-full object-cover object-center scale-110" 
                />
              </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight uppercase font-['Outfit'] block leading-none">
                  SRI THIRUMALA
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold text-xs tracking-wider uppercase leading-tight font-['Outfit']">
                  FOAM WASH
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The signature doorstep automotive foam wash & detailing service in Karpur, Karnataka. You book it, we pick it up, clean it, and bring it back.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="px-3 py-1 rounded-lg bg-slate-800 text-red-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Valet Care</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#hero" className="hover:text-white transition-colors">Home Experience</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Sri Thirumala</a></li>
              <li><a href="#fleet" className="hover:text-white transition-colors">Fleet & Business Care</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Transformation Gallery</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Location & Contact</a></li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="text-slate-300">Exterior Snow Foam Wash</span></li>
              <li><span className="text-slate-300">Deep Interior Detailing</span></li>
              <li><span className="text-slate-300">Underbody Pressure Rinse</span></li>
              <li><span className="text-slate-300">Alloy Wheel Decontamination</span></li>
              <li><span className="text-slate-300">Doorstep Pickup & Return</span></li>
              <li><span className="text-slate-300">Corporate Fleet Contracts</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider">
              Contact & Hours
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>Everyday: 7:30 AM – 8:30 PM</span>
              </p>
              <p className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-white font-semibold">{COMPANY_INFO.displayPhone}</a>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.address}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Micro Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SRI THIRUMALA FOAM WASH. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Doorstep Valet Car Spa</span>
            <span>•</span>
            <span>Karpur, Karnataka</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
