import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { REVIEWS } from '../data/carWashData';

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#030712] relative border-b border-white/10 text-left overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2 drop-shadow-sm">
              CUSTOMER EXPERIENCES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] uppercase leading-tight">
              COMMUNITY FEEDBACK & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
                DOORSTEP SATISFACTION
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.04] p-4 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-400/40 text-amber-300 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Doorstep Service in Karpur
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Pickup, Snow Foam Wash & Return
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid - 1 Col on Mobile, 2 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev) => (
            <div 
              key={rev.id}
              className="bg-white/[0.03] hover:bg-white/[0.06] rounded-3xl p-6 border border-white/10 hover:border-red-400/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author and Vehicle Details */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <img 
                  src={rev.avatar} 
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-red-400/40" 
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight font-['Outfit']">
                    {rev.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-orange-400 font-semibold mt-0.5">
                    <span>{rev.vehicle}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
