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
      {/* Mobile Sticky Bottom Floating Bar — dark theme */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#030712]/95 backdrop-blur-md border-t border-white/10 px-3 py-3 flex items-center gap-2.5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <a
          href={`tel:${COMPANY_INFO.phone}`}
          className="p-3 rounded-xl bg-white/[0.07] text-white border border-white/15 flex items-center justify-center flex-shrink-0"
          title="Call Hub"
        >
          <Phone className="w-5 h-5 text-amber-300" />
        </a>

        <a
          href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20I%20would%20like%20to%20book%20a%20wash.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center flex-shrink-0"
          title="WhatsApp"
        >
          <MessageSquare className="w-5 h-5" />
        </a>

        <button
          onClick={onOpenBooking}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-200" />
          <span>BOOK A WASH</span>
        </button>
      </div>

      {/* Desktop Floating Back to Top & Quick Book Button — dark theme */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3 animate-in fade-in duration-300">
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-2xl bg-[#030712]/90 hover:bg-[#030712] text-white shadow-xl border border-white/20 flex items-center justify-center transition-transform hover:-translate-y-1 cursor-pointer backdrop-blur-md"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5 text-amber-300" />
        </button>

        <button
          onClick={onOpenBooking}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-extrabold text-sm shadow-xl shadow-red-600/40 transition-transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-200" />
          <span>BOOK A WASH</span>
        </button>
      </div>
    </>
  );
};
