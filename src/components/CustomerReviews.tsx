import React from 'react';
import { Star, CheckCircle2, ShieldCheck, Quote } from 'lucide-react';
import { REVIEWS } from '../data/carWashData';

export const CustomerReviews: React.FC = () => {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Rating Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>CUSTOMER SATISFACTION</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] uppercase leading-tight">
              Verified Client <span className="text-red-600">Experiences</span>
            </h2>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Doorstep Service in Karpur
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                100% Verified Valet Reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {REVIEWS.map((rev) => (
            <div 
              key={rev.id}
              className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                </div>

                <Quote className="w-4 h-4 text-slate-300 mb-2" />

                <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit']">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {rev.vehicle}
                  </p>
                </div>
                
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
