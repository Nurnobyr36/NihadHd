import React, { useRef, useEffect, useState } from 'react';
import { Radio, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, AlertCircle, Play, Film, AlertTriangle, X } from 'lucide-react';
import { PlayoutState } from '../types';
import { syncService } from '../services/broadcastSync';

interface LiveViewerProps {
  state: PlayoutState;
}

export const LiveViewer: React.FC<LiveViewerProps> = ({ state }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showUnmuteOverlay, setShowUnmuteOverlay] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active media item
  const activeMedia = state.playlist.find(m => m.id === state.currentMediaId) || state.playlist[0];

  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  // Calculate 3 slide-in triggers for "এখন দেখছেন" based on total video duration (10s duration each)
  const mediaDuration = activeMedia?.duration || 180;
  const p1 = mediaDuration > 30 ? Math.max(2, mediaDuration * 0.03) : 0;
  const p2 = mediaDuration > 30 ? mediaDuration * 0.45 : 10;
  const p3 = mediaDuration > 30 ? mediaDuration * 0.80 : 20;

  const showLowerThird =
    (currentVideoTime >= p1 && currentVideoTime < p1 + 10) ||
    (currentVideoTime >= p2 && currentVideoTime < p2 + 10) ||
    (currentVideoTime >= p3 && currentVideoTime < p3 + 10);

  // Sync video source, live playback runtime position, play state, and volume
  useEffect(() => {
    if (!videoRef.current || !activeMedia) return;

    // Calculate live broadcast runtime timestamp so users don't start from 0:00
    const now = Date.now();
    const lastUpdate = state.lastUpdated || now;
    const elapsedSinceLastUpdate = state.isPaused ? 0 : (now - lastUpdate) / 1000;
    const liveTargetTime = Math.max(0, (state.currentTime || 0) + elapsedSinceLastUpdate);

    if (videoRef.current.src !== activeMedia.url) {
      videoRef.current.src = activeMedia.url;
      if (liveTargetTime > 0) {
        videoRef.current.currentTime = Math.min(liveTargetTime, activeMedia.duration || liveTargetTime);
      }
    } else {
      // Seek to exact live timestamp if viewer drift is > 2.5s
      if (Math.abs(videoRef.current.currentTime - liveTargetTime) > 2.5) {
        videoRef.current.currentTime = Math.min(liveTargetTime, videoRef.current.duration || liveTargetTime);
      }
    }

    if (state.state === 'Broadcasting' && !state.isPaused) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay blocked, user interaction required:", err);
      });
    } else {
      videoRef.current.pause();
    }

    videoRef.current.muted = isMuted;
    videoRef.current.volume = state.volume;
  }, [activeMedia, state.state, state.isPaused, state.currentMediaId, state.currentTime, state.lastUpdated, isMuted, state.volume]);

  // Synchronize audio gain and volume
  useEffect(() => {
    if (!videoRef.current) return;
    const gainFactor = (state.displaySettings?.audioGain ?? 100) / 100;
    const finalVolume = Math.min(1.0, Math.max(0, state.volume * gainFactor));
    videoRef.current.volume = finalVolume;
  }, [state.volume, state.displaySettings?.audioGain]);

  const getLogoAnimClass = (anim: string) => {
    switch (anim) {
      case 'spin': return 'anim-logo-spin';
      case 'pulse': return 'anim-logo-pulse';
      case 'bounce': return 'anim-logo-bounce';
      case 'flip': return 'anim-logo-flip';
      case 'zoom': return 'anim-logo-zoom';
      case 'floating': return 'anim-logo-floating';
      case 'fade': return 'anim-logo-fade';
      case 'glow': return 'anim-logo-glow';
      case 'shimmer': return 'anim-logo-shimmer';
      default: return '';
    }
  };

  const getLogoStylePresetClass = (preset: string) => {
    switch (preset) {
      case 'rose-gold': return 'from-rose-400 via-amber-200 to-amber-400';
      case 'emerald-teal': return 'from-emerald-400 via-teal-200 to-cyan-400';
      case 'purple-pink': return 'from-purple-400 via-pink-300 to-rose-400';
      case 'gold-shine': return 'from-amber-300 via-yellow-100 to-amber-500';
      case 'neon-cyan': return 'from-cyan-300 via-blue-200 to-indigo-400';
      default: return 'from-blue-400 via-indigo-200 to-rose-400';
    }
  };

  const getBannerPositionClass = (pos: string) => {
    switch (pos) {
      case 'top-left': return 'top-3 left-3';
      case 'top-right': return 'top-3 right-3';
      case 'bottom-left': return 'bottom-12 left-3';
      case 'bottom-right': return 'bottom-12 right-3';
      case 'middle-right': return 'top-1/2 -translate-y-1/2 right-3';
      case 'middle-left': default: return 'top-1/2 -translate-y-1/2 left-3';
    }
  };

  const getBannerThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'emerald': return 'bg-slate-950/90 border-emerald-500/60 text-emerald-100 shadow-emerald-950/60';
      case 'rose': return 'bg-slate-950/90 border-rose-500/60 text-rose-100 shadow-rose-950/60';
      case 'amber': return 'bg-slate-950/90 border-amber-500/60 text-amber-100 shadow-amber-950/60';
      case 'gold': return 'bg-gradient-to-r from-slate-950/95 via-amber-950/80 to-slate-950/95 border-amber-400/80 text-amber-100 shadow-amber-900/60';
      case 'cyan': return 'bg-slate-950/90 border-cyan-500/60 text-cyan-100 shadow-cyan-950/60';
      default: return 'bg-slate-950/90 border-indigo-500/60 text-indigo-100 shadow-indigo-950/60';
    }
  };

  const getBannerBadgeClasses = (theme?: string) => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-600 text-white';
      case 'rose': return 'bg-rose-600 text-white';
      case 'amber': return 'bg-amber-600 text-white';
      case 'gold': return 'bg-amber-400 text-slate-950 font-black';
      case 'cyan': return 'bg-cyan-600 text-white';
      default: return 'bg-indigo-600 text-white';
    }
  };

  const getBannerAnimClass = (anim?: string) => {
    switch (anim) {
      case 'bounce': return 'animate-bounce';
      case 'pulse': return 'animate-pulse';
      case 'slide': return 'animate-fadeIn';
      default: return '';
    }
  };

  const logoConfig = state.logoConfig || {
    channelName: 'CHANNEL 3',
    badgeText: 'HD',
    animation: 'pulse',
    stylePreset: 'blue-gradient',
    position: 'top-right',
    visible: true,
    opacity: 0.95
  };

  // Video time update listener
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const vTime = videoRef.current.currentTime;
      setCurrentVideoTime(vTime);
      if (state.state === 'Broadcasting' && !state.isPaused) {
        syncService.updatePlaybackProgress(vTime);
      }
    }
  };

  // Gapless Auto Advance when video ends
  const handleVideoEnded = () => {
    if (state.automationMode) {
      syncService.playNext();
    }
  };

  const handleUnmuteAndPlay = () => {
    setIsMuted(false);
    setShowUnmuteOverlay(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(console.error);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Filter visible tickers
  const visibleTickers = state.tickers.filter(t => t.visible);

  const getMarqueeSpeedClass = (speed: string) => {
    switch (speed) {
      case 'slow': return 'animate-marquee-slow';
      case 'fast': return 'animate-marquee-fast';
      default: return 'animate-marquee-normal';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black font-sans select-none overflow-hidden ${
        isFullscreen
          ? 'w-screen h-screen'
          : state.displaySettings?.aspectRatio === '4:3'
          ? 'w-full aspect-[4/3] max-h-[80vh] mx-auto rounded-2xl shadow-2xl border border-slate-800'
          : 'w-full aspect-video rounded-2xl shadow-2xl border border-slate-800'
      }`}
    >
      {/* BASE LAYER: Video Player */}
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        {state.state !== 'Offline' ? (
          activeMedia ? (
            <video
              ref={videoRef}
              src={activeMedia.url}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              autoPlay
              playsInline
              muted={isMuted}
              preload="auto"
              className="w-full h-full object-cover"
              onError={() => {
                console.warn("Video failed to play, skipping to next asset");
                if (state.automationMode) {
                  syncService.playNext();
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 p-6 text-center">
              <Film className="w-16 h-16 text-blue-500 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-white">NO VIDEO QUEUED IN PLAYLIST</h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  প্লেলিস্টে কোনো ভিডিও যুক্ত করা নেই। নিচে বাটনে ক্লিক করে স্যাম্পল ভিডিও যোগ করুন।
                </p>
              </div>
              <button
                onClick={() => syncService.restoreDefaultPlaylist()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Load Demo Channel Playlist Videos
              </button>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
            <Radio className="w-16 h-16 text-rose-500 animate-pulse" />
            <h2 className="text-2xl font-bold tracking-widest text-slate-200">CHANNEL 3 OFFLINE</h2>
            <p className="text-xs text-slate-400 font-mono">PLEASE STAND BY - BROADCAST WILL RESUME SHORTLY</p>
          </div>
        )}

        {/* Studio Cam / Emergency Feed Synthetic Screen Fallback */}
        {state.liveInput !== 'Main Stream' && state.state === 'Broadcasting' && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-white p-8 text-center z-10">
            <div className="p-4 bg-indigo-600/30 rounded-full border border-indigo-400 mb-4 animate-pulse">
              <Radio className="w-12 h-12 text-indigo-400" />
            </div>
            <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded uppercase tracking-wider mb-2 animate-bounce">
              LIVE INPUT ACTIVE: {state.liveInput}
            </span>
            <h3 className="text-xl font-bold text-white mb-1">Direct Playout Feed: {state.liveInput}</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Switched to external broadcast source. Studio signal synchronized at 1080p @ 60FPS.
            </p>
          </div>
        )}
      </div>

      {/* DVE & ON-SCREEN GRAPHICS OVERLAYS */}
      {state.displaySettings.showCanvasOverlay && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          
          {/* TOP BAR OVERLAYS (CUSTOMIZABLE EDITABLE ANIMATED CHANNEL LOGO) */}
          {logoConfig.visible && (
            <div className={`absolute ${logoConfig.position === 'top-left' ? 'top-2 left-2' : logoConfig.position === 'bottom-left' ? 'bottom-20 left-2' : logoConfig.position === 'bottom-right' ? 'bottom-20 right-2' : 'top-2 right-2'} pointer-events-auto z-30`}>
              <div 
                style={{ opacity: logoConfig.opacity }} 
                className={`flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-white/20 shadow-lg ${getLogoAnimClass(logoConfig.animation)}`}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-rose-500 to-blue-400 animate-spin" />
                <span className={`text-xs font-black italic tracking-tighter bg-gradient-to-r ${getLogoStylePresetClass(logoConfig.stylePreset)} bg-clip-text text-transparent`}>
                  {logoConfig.channelName}
                </span>
                {logoConfig.badgeText && (
                  <span className="text-[7px] font-mono font-bold bg-rose-600 text-white px-1 py-0.2 rounded uppercase">
                    {logoConfig.badgeText}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* MIDDLE OVERLAYS: News Flash Popups */}
          {state.newsFlash.active && (
            <div className="absolute top-1/3 left-3 z-30 pointer-events-auto">
              <div className="max-w-xs bg-slate-950/95 border-2 border-rose-600 text-white p-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-pulse space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span className="font-bold text-xs text-rose-300 bengali-text uppercase tracking-wide">
                    {state.newsFlash.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-100 bengali-text leading-snug">
                  {state.newsFlash.content}
                </p>
              </div>
            </div>
          )}

          {/* DYNAMIC POSITION-AWARE BANNER OVERLAYS */}
          {state.banners.map(banner => banner.active && (
            <div
              key={banner.id}
              className={`absolute ${getBannerPositionClass(banner.position)} z-30 max-w-[260px] sm:max-w-xs border-2 p-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-2.5 transition-all ${getBannerThemeClasses(banner.theme)} ${getBannerAnimClass(banner.animation)} pointer-events-auto`}
            >
              {banner.imageUrl ? (
                <div className="flex items-center gap-2.5 w-full">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${getBannerBadgeClasses(banner.theme)}`}>
                        {banner.badge}
                      </span>
                      <button
                        onClick={() => syncService.toggleBanner(banner.id)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="Dismiss Banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-xs mt-0.5 truncate bengali-text text-white">{banner.title}</h4>
                    {banner.subtitle && <p className="text-[10px] text-slate-200 truncate bengali-text">{banner.subtitle}</p>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2.5 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${getBannerBadgeClasses(banner.theme)}`}>
                        {banner.badge}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    </div>
                    <h4 className="font-bold text-xs mt-1 truncate bengali-text text-white">{banner.title}</h4>
                    {banner.subtitle && <p className="text-[10px] text-slate-200 truncate bengali-text">{banner.subtitle}</p>}
                  </div>
                  <button
                    onClick={() => syncService.toggleBanner(banner.id)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
                    title="Dismiss Banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* BOTTOM OVERLAYS: Periodically Sliding Lower-Third & Ultra-Slim Crawling Tickers */}
          <div className="absolute bottom-1 left-1 right-1 space-y-1 z-20 pointer-events-none">

            {/* LOWER-THIRD LEFT: "এখন দেখছেন" (Periodic Slide-In / Slide-Out) */}
            <div className={`transition-all duration-700 ease-in-out transform ${
              showLowerThird ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}>
              <div className="inline-flex items-center gap-2 max-w-sm bg-slate-950/90 backdrop-blur-md rounded px-2.5 py-1 border border-slate-700/80 shadow-xl pointer-events-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 bengali-text">
                  <Film className="w-2.5 h-2.5" />
                  এখন দেখছেন
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-white truncate bengali-text">
                    {activeMedia ? activeMedia.title : 'চ্যানেল ৩ বিশেষ অনুষ্ঠান'}
                  </p>
                </div>
              </div>
            </div>

            {/* MULTI-LAYER TICKER / CRAWL SYSTEM (Ultra-Slim TV Crawl Bar) */}
            <div className="space-y-0.5 w-full font-sans pointer-events-auto">
              {visibleTickers.length === 0 ? null : (
                visibleTickers.map((ticker) => (
                  <div
                    key={ticker.id}
                    className="flex items-center bg-slate-950/90 backdrop-blur-md rounded overflow-hidden border border-slate-700/80 shadow-lg h-5 text-[11px]"
                  >
                    {/* Badge */}
                    <div className={`px-2 h-full flex items-center ${ticker.badgeBg} text-white font-bold text-[9px] shrink-0 tracking-wide bengali-text shadow-sm`}>
                      {ticker.badgeText}
                    </div>

                    {/* Marquee Text */}
                    <div className="overflow-hidden whitespace-nowrap w-full px-2 text-slate-100 font-medium text-[11px] bengali-text">
                      <div className={getMarqueeSpeedClass(ticker.speed)}>
                        {ticker.text} &nbsp;&nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp;&nbsp; {ticker.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* AUDIO UNMUTE / USER INTERACTION OVERLAY */}
      {showUnmuteOverlay && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <button
            onClick={handleUnmuteAndPlay}
            className="px-6 py-3.5 bg-gradient-to-r from-red-600 via-indigo-600 to-rose-600 text-white font-bold text-sm rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform border border-white/20 animate-pulse"
          >
            <Volume2 className="w-6 h-6" />
            <span>CLICK TO UNMUTE LIVE BROADCAST AUDIO</span>
          </button>
        </div>
      )}

      {/* FLOATING CONTROLS: Fullscreen & Audio toggle */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 rounded-lg border border-slate-800 backdrop-blur-md transition-colors"
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 rounded-lg border border-slate-800 backdrop-blur-md transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Full Screen Broadcast View"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
