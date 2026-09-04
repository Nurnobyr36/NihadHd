import React, { useState, useEffect } from 'react';
import { PlayoutState } from './types';
import { syncService } from './services/broadcastSync';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveViewer } from './components/LiveViewer';
import { ExternalLink, Copy, Check, ArrowLeft, Tv, ShieldAlert } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<PlayoutState>(syncService.getState());
  const [activeView, setActiveView] = useState<'admin' | 'viewer'>('admin');
  const [copied, setCopied] = useState(false);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'viewer' || viewParam === 'user' || viewParam === 'player' || viewParam === 'live') {
      setActiveView('viewer');
    }
  }, []);

  // Subscribe to real-time broadcast state updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const getUserLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?view=user`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getUserLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // If activeView is 'viewer', show a 100% full-screen dedicated User TV Player Interface
  if (activeView === 'viewer') {
    return (
      <div className="w-screen h-screen bg-black text-white relative overflow-hidden flex flex-col justify-center items-center select-none font-sans">
        
        {/* Floating Minimal Control Bar for User Interface Mode (Fades out / Subtle) */}
        <div className="absolute top-0 left-0 right-0 z-50 p-3 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between opacity-30 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              Channel 3 - Public Live TV Stream
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded border border-slate-700 flex items-center gap-1.5 transition-colors shadow-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy User Link'}</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>

        {/* 100% Full-Screen Live TV Broadcast Player */}
        <div className="w-full h-full max-w-[1920px] max-h-[1080px] aspect-video relative flex items-center justify-center">
          <LiveViewer state={state} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        state={state}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-4">
        <AdminDashboard state={state} />
      </main>

      {/* Professional Polish Footer Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-700 px-6 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>LOCAL IP: 192.168.1.104</span>
          <span>CPU: 14%</span>
          <span>RAM: 2.4GB / 8GB</span>
        </div>
        <div className="flex gap-4">
          <span>ENCODER: NVENC H.264</span>
          <span className="text-emerald-500 font-bold">SYNC: 102ms</span>
        </div>
      </footer>
    </div>
  );
}

