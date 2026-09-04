import React, { useState } from 'react';
import { Radio, Play, Square, Pause, ExternalLink, ShieldCheck, Monitor, SlidersHorizontal, Activity, Link, Copy, Check, Tv } from 'lucide-react';
import { PlayoutState } from '../types';
import { syncService } from '../services/broadcastSync';

interface HeaderProps {
  state: PlayoutState;
  activeView: 'admin' | 'viewer';
  setActiveView: (view: 'admin' | 'viewer') => void;
}

export const Header: React.FC<HeaderProps> = ({ state, activeView, setActiveView }) => {
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    syncService.setBroadcastState('Broadcasting');
  };

  const handlePlay = () => {
    if (state.state === 'Paused') {
      syncService.setBroadcastState('Broadcasting');
    } else {
      syncService.updateState({ isPaused: false });
    }
  };

  const handlePause = () => {
    syncService.setBroadcastState('Paused');
  };

  const handleStop = () => {
    syncService.setBroadcastState('Offline');
  };

  const getUserUrl = () => {
    return window.location.origin + window.location.pathname + '?view=user';
  };

  const handleCopyUserLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(getUserUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenUserTab = () => {
    window.open(getUserUrl(), '_blank');
  };

  return (
    <header className="h-16 bg-[#1E293B] border-b border-slate-700 text-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-lg">
      {/* Branding & License Badge */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-md border border-blue-400/30">
          CS
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold leading-none text-white flex items-center gap-2">
            Cable Stream Studio
            <span className="text-xs font-mono text-blue-400">v1.0.8</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Broadcast Playout Engine
          </p>
        </div>
        <span className="hidden lg:inline-block ml-2 px-2 py-0.5 bg-green-900/40 text-green-400 border border-green-700 rounded text-[10px] font-bold tracking-wide">
          PRO LICENSE ACTIVE
        </span>
      </div>

      {/* Master Controls & Interface Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Playback Controls */}
        <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700 items-center gap-1">
          <button
            onClick={handleStart}
            title="Start Master Playout"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded transition-all ${
              state.state === 'Broadcasting'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            START
          </button>

          <button
            onClick={state.state === 'Broadcasting' && !state.isPaused ? handlePause : handlePlay}
            title={state.isPaused ? "Resume Playout" : "Pause Playout"}
            className={`px-2.5 py-1.5 text-xs font-bold rounded transition-all ${
              state.state === 'Broadcasting' && !state.isPaused
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {state.isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          <button
            onClick={handleStop}
            title="Stop Master Playout"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded transition-all ${
              state.state === 'Offline'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            STOP
          </button>
        </div>

        {/* Dedicated User Link Button (Primary Call-to-Action) */}
        <div className="flex items-center bg-blue-950/80 border border-blue-500/50 rounded-lg p-0.5 shadow-md">
          <button
            onClick={handleOpenUserTab}
            title="Open Dedicated User Screen in a New Window / Tab"
            className="px-2.5 md:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-all"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User Live Link</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </button>

          <button
            onClick={handleCopyUserLink}
            title="Copy Public User TV Link to Clipboard"
            className="p-1.5 hover:bg-blue-800/60 text-blue-300 hover:text-white rounded transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-700 text-xs">
          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 font-bold rounded transition-all ${
              activeView === 'admin'
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => setActiveView('viewer')}
            className={`px-3 py-1.5 font-bold rounded transition-all ${
              activeView === 'viewer'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Mode
          </button>
        </div>
      </div>
    </header>
  );
};

