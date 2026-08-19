import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

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
    <section className="py-16 sm:py-24 bg-white relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>TRANSFORMATION RESULTS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Before & After <span className="text-red-600">Visual Comparison</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            Drag the slider across the vehicle to reveal the deep snow foam wash & paint gloss restoration.
          </p>
        </div>

        {/* Interactive Comparison Container with 3D Bevel */}
        <div className="max-w-5xl mx-auto perspective-container">
          <div 
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
            className="relative h-[280px] xs:h-[320px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 select-none cursor-ew-resize bg-slate-950 touch-none bevel-3d"
          >
            {/* AFTER: Clean Car Image (Base Layer) */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80" 
                alt="After Sri Thirumala Foam Wash - Gleaming Clean Car" 
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-md backdrop-blur-sm flex items-center gap-1.5 depth-pop">
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
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-md backdrop-blur-sm depth-pop">
                <span>BEFORE: DUST & ROAD GRIME</span>
              </div>
            </div>

            {/* Split Drag Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Center 3D Tactile Drag Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-slate-900 pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform depth-pop">
                <div className="flex items-center">
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 -mr-1" />
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-1" />
                </div>
              </div>
            </div>

            {/* Bottom Helper Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold shadow-md whitespace-nowrap">
              Drag slider to compare
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mt-5">
            <button
              onClick={() => setSliderPosition(20)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Show More "After" (80%)
            </button>
            <button
              onClick={() => setSliderPosition(50)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Center 50/50 Split
            </button>
            <button
              onClick={() => setSliderPosition(80)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Show More "Before" (80%)
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
