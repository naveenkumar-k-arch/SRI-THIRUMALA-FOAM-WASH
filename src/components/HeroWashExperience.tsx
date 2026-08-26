import React, { useRef, useEffect, useState } from 'react';
import { Calendar, ChevronDown, Volume2, VolumeX } from 'lucide-react';

interface HeroWashExperienceProps {
  onOpenBooking: () => void;
}

export const HeroWashExperience: React.FC<HeroWashExperienceProps> = ({ onOpenBooking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1.0;
    video.loop = true;

    const playVideo = async () => {
      try {
        await video.play();
        setIsMuted(false);
      } catch {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch (e2) {
          console.log('Autoplay fallback:', e2);
        }
      }
    };

    playVideo();

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const handlePause = () => {
      video.play().catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        video.play().catch(() => {});
      }
    };

    const unmuteOnInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        setIsMuted(false);
      }
      cleanupEvents();
    };

    const events = ['click', 'touchstart', 'scroll', 'pointerdown', 'keydown', 'wheel', 'touchend'];
    const cleanupEvents = () => {
      events.forEach(evt => {
        window.removeEventListener(evt, unmuteOnInteraction);
        document.removeEventListener(evt, unmuteOnInteraction);
      });
    };

    events.forEach(evt => {
      window.addEventListener(evt, unmuteOnInteraction, { once: true, passive: true });
      document.addEventListener(evt, unmuteOnInteraction, { once: true, passive: true });
    });

    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const watchdogInterval = setInterval(() => {
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    }, 1200);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(watchdogInterval);
      cleanupEvents();
    };
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || isMuted) {
      video.muted = false;
      video.volume = 1.0;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <section id="hero" className="relative min-h-svh flex flex-col justify-between pt-16 sm:pt-20 pb-4 sm:pb-8 overflow-hidden text-center bg-slate-950">
      
      {/* Background Edge-to-Edge Seamless Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src="/wash-video.mp4"
          autoPlay
          loop
          playsInline
          muted={isMuted}
          preload="auto"
          className="w-full h-full object-cover object-center opacity-90 scale-105"
        />
        
        {/* Subtle Vignette Overlays - Zero Heavy Black Bars */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-slate-950/80 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-28 bg-gradient-to-t from-slate-950/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-slate-950/25 z-10"></div>
      </div>

      {/* Floating Sound Toggle Control on Mobile & Desktop */}
      <div className="absolute top-18 sm:top-24 right-3 sm:right-6 z-30">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer ${
            !isMuted
              ? 'bg-red-600/95 hover:bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-slate-900/90 hover:bg-black text-amber-300 border-amber-500/50 animate-pulse'
          }`}
          title={isMuted ? 'Click to Enable Sound' : 'Sound is Active (Click to Mute)'}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 animate-bounce" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-amber-100 font-['Outfit']">SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-amber-300 font-['Outfit']">TAP SOUND</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Layout - Flex Justified from Top to Bottom */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col justify-between pt-4 sm:pt-8 pb-2">
        
        {/* Top Header Group */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 shadow-lg backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>SRI THIRUMALA FOAM WASH • KARPUR</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight sm:leading-tight font-['Outfit'] max-w-4xl drop-shadow-2xl">
            <span className="text-white">WE </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
              PICK IT UP.
            </span>{' '}
            <span className="text-white">WE </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 drop-shadow-[0_0_25px_rgba(249,115,22,0.7)]">
              WASH IT.
            </span>{' '}
            <span className="text-white">WE </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_0_25px_rgba(251,146,60,0.7)]">
              BRING IT BACK.
            </span>
          </h1>

          <p className="mt-2 text-slate-200 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed drop-shadow-md">
            Doorstep Valet Pickup & Delivery across Karpur. High-pressure active foam baths, interior sanitization & mirror gloss finish.
          </p>

          <div className="mt-4 sm:mt-6 w-full sm:w-auto px-2 sm:px-0">
            <button
              onClick={onOpenBooking}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm sm:text-base border border-amber-300/40 shadow-[0_10px_30px_-5px_rgba(220,38,38,0.6)] tactile-btn cursor-pointer font-['Outfit'] select-none"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 group-hover:scale-110 transition-transform" />
              <span className="tracking-wider text-white drop-shadow-md">BOOK A WASH SLOT</span>
            </button>
          </div>
        </div>

        {/* Bottom Feature Badges & Scroll Indicator - Placed Right at Bottom of Video */}
        <div className="w-full flex flex-col items-center mt-4 sm:mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-4xl">
            <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-left flex items-center gap-2 shadow-lg">
              <span className="text-sm sm:text-base">🚗</span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Valet Pickup</p>
                <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight">Doorstep & return</p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-left flex items-center gap-2 shadow-lg">
              <span className="text-sm sm:text-base">🫧</span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">Active Foam</p>
                <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight">pH-neutral bath</p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-left flex items-center gap-2 shadow-lg">
              <span className="text-sm sm:text-base">⚡</span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">180-Bar Jet</p>
                <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight">Soft water flush</p>
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-left flex items-center gap-2 shadow-lg">
              <span className="text-sm sm:text-base">⭐</span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">4.9★ Rated</p>
                <p className="text-[8px] sm:text-[9px] text-amber-300 font-bold leading-tight">250+ Washes</p>
              </div>
            </div>
          </div>

          <a 
            href="#about"
            className="mt-2.5 sm:mt-4 inline-flex flex-col items-center text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-400 transition-colors font-['Outfit']">
              EXPLORE DETAILS
            </span>
            <ChevronDown className="w-3 h-3 text-orange-400 animate-bounce -mt-0.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
