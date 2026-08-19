import React, { useState, useEffect } from 'react';
import { Calendar, Phone, ArrowUp, MessageSquare } from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface FloatingBookingBarProps {
  onOpenBooking: () => void;
}

export const FloatingBookingBar: React.FC<FloatingBookingBarProps> = ({ onOpenBooking }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Sticky Bottom Floating Bar — White & Black studio theme */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-3 flex items-center gap-2.5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <a
          href={`tel:${COMPANY_INFO.phone}`}
          className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center flex-shrink-0"
          title="Call Hub"
        >
          <Phone className="w-4 h-4 text-slate-700" />
        </a>

        <a
          href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20I%20would%20like%20to%20book%20a%20wash.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0"
          title="WhatsApp"
        >
          <MessageSquare className="w-4 h-4" />
        </a>

        <button
          onClick={onOpenBooking}
          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-red-200" />
          <span>BOOK A WASH</span>
        </button>
      </div>

      {/* Desktop Floating Back to Top & Quick Book Button */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3 animate-in fade-in duration-300">
        <button
          onClick={scrollToTop}
          className="w-11 h-11 rounded-xl bg-white hover:bg-slate-50 text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 text-slate-700" />
        </button>

        <button
          onClick={onOpenBooking}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-red-400" />
          <span>BOOK A WASH</span>
        </button>
      </div>
    </>
  );
};
