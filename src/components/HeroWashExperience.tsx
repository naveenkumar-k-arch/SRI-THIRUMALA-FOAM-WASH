import React, { useRef, useEffect, useState } from 'react';
import { Calendar, ChevronDown, Volume2, VolumeX } from 'lucide-react';

interface HeroWashExperienceProps {
  onOpenBooking: () => void;
}

export const HeroWashExperience: React.FC<HeroWashExperienceProps> = ({ onOpenBooking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

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

  // 3D Parallax Mouse & Touch Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max tilt angles (+/- 10 deg)
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 7;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

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
    <section 
      id="hero" 
      className="relative min-h-[100svh] bg-[#020617] flex flex-col justify-between pt-16 sm:pt-20 pb-10 overflow-hidden text-center select-none"
    >
      {/* Dynamic Ambient 3D Depth Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[400px] sm:h-[600px] bg-gradient-to-tr from-red-600/20 via-orange-500/25 to-amber-500/15 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse duration-1000"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Floor 3D Grid Matrix */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          perspective: '600px',
          transform: 'rotateX(55deg) scale(1.5)',
          transformOrigin: '50% 90%'
        }}
      ></div>

      {/* Floating Sound Toggle Control in top corner */}
      <div className="absolute top-20 sm:top-24 right-3 sm:right-6 z-40">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-300 shadow-2xl cursor-pointer ${
            !isMuted
              ? 'bg-red-600 text-white border-red-400/80 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/50 animate-pulse'
          }`}
          title={isMuted ? 'Click to Enable Sound' : 'Sound is Active (Click to Mute)'}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
              <span className="text-[10px] font-extrabold tracking-wider text-white font-['Outfit']">3D SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-extrabold tracking-wider text-amber-300 font-['Outfit']">TAP FOR AUDIO</span>
            </>
          )}
        </button>
      </div>

      {/* Top Hero Text Header */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-950/70 border border-red-500/30 text-red-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>LIVE SRI THIRUMALA FOAM WASH EXPERIENCE</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight font-['Outfit'] drop-shadow-2xl">
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">
            PICK IT UP.
          </span>{' '}
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 drop-shadow-[0_0_30px_rgba(249,115,22,0.7)]">
            WASH IT.
          </span>{' '}
          <span className="text-white">WE </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_0_30px_rgba(251,146,60,0.7)]">
            BRING IT BACK.
          </span>
        </h1>
      </div>

      {/* 3D INTERACTIVE THEATER STAGE */}
      <div 
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-20 max-w-5xl w-full mx-auto px-4 sm:px-6 my-4 sm:my-6"
        style={{ perspective: '1400px' }}
      >
        {/* 3D Floating Stage Canvas */}
        <div
          className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border-2 border-white/20 bg-slate-950/90 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(239,68,68,0.3)] transition-transform duration-300 ease-out will-change-transform group cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHovered
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
              : `rotateX(4deg) rotateY(0deg) scale3d(1, 1, 1)`
          }}
        >
          {/* Edge-to-edge Video Player */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/8] w-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/wash-video.mp4"
              autoPlay
              loop
              playsInline
              muted={isMuted}
              preload="auto"
              className="w-full h-full object-cover object-center scale-[1.03] filter contrast-[1.08] saturate-[1.12]"
            />

            {/* Dynamic 3D Glare Light Reflection that follows cursor */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`,
                opacity: isHovered ? 0.8 : 0.25
              }}
            ></div>

            {/* Subtle Vignette & Neon Edge Rim */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/25 rounded-3xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

            {/* 3D FLOATING HUD CHIPS (Depth Popped in Z-Axis) */}
            
            {/* Top Left: 4K Ultra HD & 3D Spatial Tag */}
            <div 
              className="absolute top-3 sm:top-5 left-3 sm:left-5 flex items-center gap-2 pointer-events-none transition-transform duration-300"
              style={{ transform: 'translateZ(40px)' }}
            >
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white font-extrabold text-[9px] sm:text-xs shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>REAL WORKSHOP 4K</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1.5 rounded-xl bg-red-600/80 backdrop-blur-md border border-red-400 text-white font-black text-[9px] tracking-wider uppercase shadow-md">
                3D THEATER
              </span>
            </div>

            {/* Top Right: Sound Status Hint */}
            <div 
              className="absolute top-3 sm:top-5 right-3 sm:right-5 pointer-events-none transition-transform duration-300"
              style={{ transform: 'translateZ(40px)' }}
            >
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 font-bold text-[9px] sm:text-[11px] shadow-lg">
                {!isMuted ? '🔊 Active Audio' : '🔇 Tap Sound Above'}
              </span>
            </div>

            {/* Bottom Overlay: Real Detailing Stats floating in 3D */}
            <div 
              className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 flex items-center justify-between pointer-events-none transition-transform duration-300"
              style={{ transform: 'translateZ(45px)' }}
            >
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-left">
                  <p className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 leading-none">Pressure Level</p>
                  <p className="text-[10px] sm:text-xs font-black text-white leading-tight mt-0.5">180-Bar Mud Jet</p>
                </div>
                <div className="hidden xs:block px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-left">
                  <p className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 leading-none">Treatment</p>
                  <p className="text-[10px] sm:text-xs font-black text-amber-300 leading-tight mt-0.5">Active Snow Foam</p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/90 to-orange-600/90 backdrop-blur-md border border-red-400/50 text-white text-[9px] sm:text-xs font-extrabold shadow-lg">
                Sri Thirumala Foam Wash
              </div>
            </div>

          </div>
        </div>

        {/* 3D Reflection Floor Beneath the Video Stage */}
        <div className="w-3/4 mx-auto h-6 bg-gradient-to-b from-orange-500/20 to-transparent blur-xl rounded-full mt-1 pointer-events-none"></div>
      </div>

      {/* Primary Glow 3D Action: BOOK A SLOT */}
      <div className="relative z-20 max-w-sm mx-auto px-4 mt-1">
        <button
          onClick={onOpenBooking}
          className="group relative w-full inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-sm sm:text-base border border-amber-300/40 shadow-[0_12px_30px_-5px_rgba(220,38,38,0.7),0_0_25px_rgba(249,115,22,0.4)] tactile-btn cursor-pointer font-['Outfit'] select-none hover:scale-[1.02] transition-transform"
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 group-hover:scale-110 transition-transform" />
          <span className="tracking-wider text-white drop-shadow-md">BOOK A WASH SLOT</span>
        </button>

        {/* Scroll Indicator */}
        <a 
          href="#about"
          className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group text-center"
        >
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-400 transition-colors font-['Outfit']">
            EXPLORE DETAILS
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
        </a>
      </div>

    </section>
  );
};
