import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Car, Bike, Truck } from 'lucide-react';

interface ComparisonItem {
  id: string;
  name: string;
  category: string;
  icon: typeof Car;
  beforeImg: string;
  afterImg: string;
  beforeLabel: string;
  afterLabel: string;
  description: string;
}

const COMPARISONS: ComparisonItem[] = [
  {
    id: 'car',
    name: 'Car / Sedan / Hatchback',
    category: 'Car Wash',
    icon: Car,
    beforeImg: '/images/foam/car-before.jpg',
    afterImg: '/images/foam/car-after.jpg',
    beforeLabel: 'BEFORE: DUST, MUD & ROAD FILM',
    afterLabel: 'AFTER: ACTIVE FOAM & MIRROR FINISH',
    description: 'Real Sri Thirumala Foam Wash transformation: high-pressure pre-wash, thick snow foam soak, alloy de-dusting, and showroom shine.'
  },
  {
    id: 'bike',
    name: 'Motorcycle / Scooter',
    category: 'Bike Wash',
    icon: Bike,
    beforeImg: '/images/foam/foam-7.png',
    afterImg: '/images/foam/foam-6.png',
    beforeLabel: 'BEFORE: CHAIN GRIME & DRIED MUD',
    afterLabel: 'AFTER: ENGINE DEGREASE & CHROME GLOSS',
    description: 'Deep chain clean & lube, engine cooling fins foam blast, chrome restoration, and tire blackening.'
  },
  {
    id: 'suv',
    name: 'SUV / 4x4 / Creta / Fortuner',
    category: 'SUV Wash',
    icon: Truck,
    beforeImg: '/images/foam/car-before.jpg',
    afterImg: '/images/foam/car-after.jpg',
    beforeLabel: 'BEFORE: OFFROAD SPLATTER & ROAD FILM',
    afterLabel: 'AFTER: DEEP FOAM SPA & HYDROPHOBIC GLOSS',
    description: 'Heavy pressure blast, thick snow foam soak, spotless soft-water rinse, and mirror gloss coating.'
  }
];

export const BeforeAfterSlider: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('car');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeComparison = COMPARISONS.find(c => c.id === selectedVehicle) || COMPARISONS[0];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <section id="comparison" className="py-16 sm:py-24 bg-white relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>TRANSFORMATION RESULTS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Before & After <span className="text-red-600">Visual Comparison</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            Swipe or drag the slider left and right to reveal the full transformation from road grime to showroom gloss.
          </p>

          {/* Vehicle Category Switcher Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
            {COMPARISONS.map((comp) => {
              const Icon = comp.icon;
              const isSelected = selectedVehicle === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelectedVehicle(comp.id);
                    setSliderPosition(50);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md border border-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-slate-600'}`} />
                  <span>{comp.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Comparison Container with Pixel-Perfect Clip Path */}
        <div className="max-w-3xl mx-auto perspective-container">
          <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full aspect-[4/3] sm:aspect-[749/660] max-h-[580px] min-h-[320px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 select-none cursor-ew-resize bg-slate-950 touch-none ring-1 ring-black/5 mx-auto"
          >
            {/* AFTER: Clean Image (Base Layer - 100% width & height) */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={activeComparison.afterImg} 
                alt={`${activeComparison.name} - After Sri Thirumala Foam Wash Cleaned`} 
                className="w-full h-full object-cover object-bottom pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-md backdrop-blur-sm flex items-center gap-1.5 depth-pop pointer-events-none">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{activeComparison.afterLabel}</span>
              </div>
            </div>

            {/* BEFORE: Dirty Image (Overlay Layer with clipPath inset - NEVER squished or missing) */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
              }}
            >
              <img 
                src={activeComparison.beforeImg} 
                alt={`${activeComparison.name} - Before Sri Thirumala Foam Wash Dirty`} 
                className="w-full h-full object-cover object-bottom pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-md backdrop-blur-sm depth-pop pointer-events-none">
                <span>{activeComparison.beforeLabel}</span>
              </div>
            </div>

            {/* Split Drag Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 pointer-events-none transition-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Center 3D Tactile Drag Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] flex items-center justify-center border-2 border-slate-900 pointer-events-none hover:scale-110 active:scale-95 transition-transform depth-pop">
                <div className="flex items-center">
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 -mr-1 text-slate-800" />
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-1 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Bottom Helper Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold shadow-md whitespace-nowrap pointer-events-none">
              Swipe slider to compare • {activeComparison.name}
            </div>
          </div>

          {/* Quick Preset Buttons & Description */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
            <p className="text-xs text-slate-500 italic text-center sm:text-left">
              {activeComparison.description}
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSliderPosition(15)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                85% After
              </button>
              <button
                onClick={() => setSliderPosition(50)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                50/50 Split
              </button>
              <button
                onClick={() => setSliderPosition(85)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                85% Before
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
