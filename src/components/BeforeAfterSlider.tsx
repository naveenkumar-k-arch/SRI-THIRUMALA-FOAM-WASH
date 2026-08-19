import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-20 sm:py-24 bg-[#030712] relative border-b border-white/10 text-left overflow-hidden w-full max-w-full">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2 drop-shadow-sm">
            TRANSFORMATION RESULTS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            BEFORE & AFTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">COMPARISON</span>
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-base font-medium">
            Drag the slider across the vehicle to reveal the deep snow foam wash & gloss restoration.
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="max-w-5xl mx-auto">
          <div 
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
            className="relative h-[280px] xs:h-[320px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 select-none cursor-ew-resize bg-slate-950 touch-none"
          >
            {/* AFTER: Clean Car Image (Base Layer) */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80" 
                alt="After Sri Thirumala Foam Wash - Gleaming Clean Car" 
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-500/90 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>AFTER: SPOTLESS & GLOSSY</span>
              </div>
            </div>

            {/* BEFORE: Dirty Car Image (Clipped Layer) */}
            <div 
              className="absolute inset-0 h-full overflow-hidden transition-all duration-75"
              style={{ width: `${sliderPosition}%` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80" 
                alt="Before Sri Thirumala Foam Wash - Muddy Dirty Car" 
                className="absolute inset-0 w-full h-full object-cover object-center max-w-none pointer-events-none"
                style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
              />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-amber-600/90 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-lg backdrop-blur-sm">
                <span>BEFORE: DUST & MUD</span>
              </div>
            </div>

            {/* Split Drag Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Center Drag Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-red-600 shadow-2xl flex items-center justify-center border-2 border-red-500 pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                <div className="flex items-center">
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 -mr-1" />
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-1" />
                </div>
              </div>
            </div>

            {/* Bottom Helper Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold shadow-lg whitespace-nowrap">
              Drag or Tap to Compare
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mt-5">
            <button
              onClick={() => setSliderPosition(20)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Show More "After" (80%)
            </button>
            <button
              onClick={() => setSliderPosition(50)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-amber-300 font-bold text-xs border border-orange-400/40 transition-colors cursor-pointer"
            >
              Center 50/50 Split
            </button>
            <button
              onClick={() => setSliderPosition(80)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
            >
              Show More "Before" (80%)
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
