import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Eye, EyeOff, Radio, Film, Music, Tv, Video } from 'lucide-react';
import { PlayoutState, BroadcastPhase } from '../types';
import { syncService } from '../services/broadcastSync';

interface SidebarPreviewProps {
  state: PlayoutState;
}

export const SidebarPreview: React.FC<SidebarPreviewProps> = ({ state }) => {
  const [showLivePreview, setShowLivePreview] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeMedia = state.playlist.find(m => m.id === state.currentMediaId) || state.playlist[0];

  // Sync video preview element with global playout state
  useEffect(() => {
    if (!videoRef.current || !activeMedia) return;

    if (videoRef.current.src !== activeMedia.url) {
      videoRef.current.src = activeMedia.url;
      videoRef.current.currentTime = state.currentTime || 0;
    }

    if (state.state === 'Broadcasting' && !state.isPaused) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    } else {
      videoRef.current.pause();
    }
  }, [activeMedia, state.state, state.isPaused, state.currentMediaId]);

  const handleTimeUpdate = () => {
    if (videoRef.current && !state.isPaused && state.state === 'Broadcasting') {
      if (videoRef.current.duration) {
        syncService.updateState({
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    syncService.seekTime(newTime);
  };

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <aside className="bg-slate-950 p-6 flex flex-col gap-6 rounded-lg border border-slate-800 shadow-2xl">
      {/* Live Broadcast Screen Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            Live Broadcast Screen
          </h2>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              ON AIR
            </span>
            <span className="text-slate-500">FPS: {state.displaySettings.fps}.0</span>
            <span className="text-slate-500">BITRATE: 8500kbps</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-mono">SYSTEM UPTIME: 14:22:05</p>
        </div>
      </div>

      {/* Live Video Preview Frame */}
      {showLivePreview ? (
        <div className="aspect-video bg-black rounded-lg border border-slate-700 shadow-2xl relative overflow-hidden group">
          {activeMedia ? (
            <video
              ref={videoRef}
              src={activeMedia.url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => syncService.playNext()}
              muted={true}
              autoPlay
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onError={() => {
                if (state.automationMode) syncService.playNext();
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
              <Film className="w-8 h-8 text-blue-400 mb-2 animate-bounce" />
              <p className="text-xs text-slate-300 font-bold">No Media Loaded</p>
              <button
                onClick={() => syncService.restoreDefaultPlaylist()}
                className="mt-2 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded shadow"
              >
                + Load Videos
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Channel Watermark Bug */}
          {state.logoConfig?.visible && (
            <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 z-20">
              <span className="text-xs font-black italic tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {state.logoConfig.channelName}
              </span>
              {state.logoConfig.badgeText && (
                <span className="text-[7px] font-mono font-bold bg-rose-600 text-white px-1 py-0.2 rounded">
                  {state.logoConfig.badgeText}
                </span>
              )}
            </div>
          )}

          {/* Active Banner Overlays Preview */}
          {state.banners.map(b => b.active && (
            <div
              key={b.id}
              className={`absolute ${
                b.position === 'top-left' ? 'top-2 left-2' :
                b.position === 'top-right' ? 'top-2 right-2' :
                b.position === 'bottom-left' ? 'bottom-16 left-2' :
                b.position === 'bottom-right' ? 'bottom-16 right-2' :
                b.position === 'middle-left' ? 'top-1/3 left-2' : 'top-1/3 right-2'
              } z-20 max-w-[180px] bg-slate-950/90 border border-amber-500/60 p-1.5 rounded-lg shadow-lg text-[10px] text-white flex items-center gap-1.5`}
            >
              {b.imageUrl && (
                <img src={b.imageUrl} alt="" className="w-6 h-6 object-cover rounded border border-white/20 shrink-0" />
              )}
              <div className="truncate flex-1">
                <span className="text-[7px] bg-amber-500 text-slate-950 px-1 py-0.2 font-bold rounded uppercase">
                  {b.badge}
                </span>
                <p className="font-bold truncate text-[9px] bengali-text mt-0.5">{b.title}</p>
              </div>
            </div>
          ))}

          {/* Lower Third Preview */}
          <div className="absolute bottom-12 left-2 z-10">
            <div className="flex items-center bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-800 text-[10px]">
              <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded mr-1.5 bengali-text">
                এখন দেখছেন
              </span>
              <p className="font-bold text-white bengali-text truncate max-w-[150px]">
                {activeMedia ? activeMedia.title : 'চ্যানেল ৩ বিশেষ অনুষ্ঠান'}
              </p>
            </div>
          </div>

          {/* Multi-Layer Crawl Tickers Preview (Includes T1, T2, T3) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 space-y-0.5">
            {state.tickers.filter(t => t.visible).map((ticker) => (
              <div key={ticker.id} className="bg-slate-950/90 h-5 flex items-center overflow-hidden border-t border-slate-800 text-[10px]">
                <div className={`${ticker.badgeBg} px-2 h-full flex items-center font-bold text-[8px] whitespace-nowrap text-white bengali-text shrink-0`}>
                  {ticker.badgeText}
                </div>
                <div className="flex-1 px-2 font-medium whitespace-nowrap overflow-hidden text-slate-100 bengali-text text-[10px]">
                  <span className={ticker.speed === 'fast' ? 'animate-marquee-fast' : ticker.speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee-normal'}>
                    {ticker.text} &nbsp;&nbsp;&nbsp;&nbsp; ★ &nbsp;&nbsp;&nbsp;&nbsp; {ticker.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {state.state === 'Offline' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
              <Radio className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
              <span>CHANNEL 3 OFFLINE</span>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
          <EyeOff className="w-6 h-6 mb-2 text-slate-600" />
          <span>Live Preview Suspended</span>
          <button
            onClick={() => setShowLivePreview(true)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold"
          >
            Enable Preview
          </button>
        </div>
      )}

      {/* Grid Status Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Now Playing Details Card */}
        <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Now Playing Details</h3>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono">TRACK TITLE</p>
              <p className="text-sm font-bold text-blue-400 truncate bengali-text" title={activeMedia?.title}>
                {activeMedia ? activeMedia.title : 'No track selected'}
              </p>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={state.duration || 100}
                value={state.currentTime || 0}
                onChange={handleSeekChange}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => syncService.playPrevious()}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => syncService.updateState({ isPaused: !state.isPaused })}
                  className="p-1 bg-blue-600 text-white rounded font-bold text-xs"
                >
                  {state.isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
                </button>
                <button
                  onClick={() => syncService.playNext()}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <Volume2 className="w-3 h-3 text-slate-500" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.volume}
                  onChange={(e) => syncService.updateState({ volume: parseFloat(e.target.value) })}
                  className="w-14 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phase Monitor Card */}
        <div className="bg-slate-900 p-4 rounded border border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Phase Monitor</h3>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="bg-blue-600/10 border border-blue-600/30 p-2 rounded">
              <p className="text-[8px] text-blue-400 uppercase font-bold">CURRENT PHASE</p>
              <p className="text-xs font-bold text-white">{state.phase.toUpperCase()}</p>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <p className="text-[8px] text-slate-500 uppercase font-bold">NEXT UP</p>
              <p className="text-xs font-bold text-slate-200">SONGS (AUTO)</p>
            </div>
            <div className="bg-slate-800 p-2 rounded col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-bold">AUTOMATION STATE</p>
                <p className="text-xs font-bold text-emerald-400">
                  {state.automationMode ? 'ENABLED (V.03-L)' : 'MANUAL CONTROL'}
                </p>
              </div>
              <button
                onClick={() => syncService.toggleAutomation()}
                className={`px-2 py-1 rounded text-[10px] font-bold ${
                  state.automationMode ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'
                }`}
              >
                TOGGLE
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
