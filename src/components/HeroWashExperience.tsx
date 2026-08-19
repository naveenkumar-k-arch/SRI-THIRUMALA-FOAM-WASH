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
    <section id="hero" className="relative min-h-[100svh] bg-[#030712] flex flex-col justify-between pt-16 sm:pt-20 overflow-hidden text-center">
      
      {/* Background Edge-to-Edge Seamless Background Video - NO BOX BORDERS */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src="/wash-video.mp4"
          autoPlay
          loop
          playsInline
          muted={isMuted}
          preload="auto"
          className="w-full h-full object-cover object-center opacity-85 scale-105"
        />
        
        {/* Seamless Vignette and Gradient Overlays Blending Edge to Edge */}
        <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-b from-[#030712] via-[#030712]/75 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 bg-gradient-to-t from-[#030712] via-[#030712]/85 to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-28 bg-gradient-to-r from-[#030712]/90 to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-28 bg-gradient-to-l from-[#030712]/90 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-radial-[circle_at_center_transparent_0%,#030712_85%] opacity-40 z-10"></div>
      </div>

      {/* Floating Sound Toggle Control on Mobile & Desktop */}
      <div className="absolute top-[4.5rem] sm:top-24 right-3 sm:right-6 z-30">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer ${
            !isMuted
              ? 'bg-red-600/90 hover:bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-black/80 hover:bg-black/95 text-amber-300 border-amber-500/50 animate-pulse'
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

      {/* Main Center Floating Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 my-auto pt-14 sm:pt-20 pb-6 sm:pb-8 flex flex-col items-center perspective-container">
        
        {/* Subtitle Tag */}
        <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-orange-400 font-['Outfit'] block mb-2 sm:mb-4 drop-shadow-[0_0_12px_rgba(232,121,249,0.6)]">
          SRI THIRUMALA FOAM WASH
        </span>

        {/* Hero Headline - Responsive Mobile Scaling with 3D Depth */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight uppercase leading-tight sm:leading-tight font-['Outfit'] max-w-5xl drop-shadow-2xl floating-3d">
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
            PICK IT UP.
          </span>{' '}
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300 drop-shadow-[0_0_25px_rgba(249,115,22,0.7)]">
            WASH IT.
          </span>{' '}
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_0_25px_rgba(251,146,60,0.7)]">
            BRING IT BACK.
          </span>
        </h1>

        {/* Primary Glow 3D Tactile Button: BOOK A SLOT */}
        <div className="mt-6 sm:mt-10 w-full sm:w-auto px-4 sm:px-0 depth-pop">
          <button
            onClick={onOpenBooking}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-7 sm:px-12 py-3.5 sm:py-4.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm sm:text-lg border border-amber-300/40 shadow-[0_10px_30px_-5px_rgba(220,38,38,0.6)] tactile-btn cursor-pointer font-['Outfit'] select-none"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 group-hover:scale-110 transition-transform" />
            <span className="tracking-wider text-white drop-shadow-md">BOOK A SLOT</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#about"
          className="mt-8 sm:mt-14 inline-flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <div className="w-6 sm:w-8 h-0.5 bg-orange-400 rounded-full mb-0.5 shadow-[0_0_8px_#fb923c]"></div>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-orange-400 transition-colors font-['Outfit']">
            SCROLL TO EXPLORE
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-bounce mt-0.5" />
        </a>

      </div>

    </section>
  );
};
