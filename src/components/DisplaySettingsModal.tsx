import React, { useState } from 'react';
import { SlidersHorizontal, Check, X, Monitor, Volume2, Sparkles } from 'lucide-react';
import { DisplaySettings } from '../types';
import { syncService } from '../services/broadcastSync';

interface DisplaySettingsModalProps {
  settings: DisplaySettings;
  onClose: () => void;
}

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({ settings, onClose }) => {
  const [aspectRatio, setAspectRatio] = useState(settings.aspectRatio);
  const [resolution, setResolution] = useState(settings.resolution);
  const [fps, setFps] = useState(settings.fps);
  const [audioGain, setAudioGain] = useState(settings.audioGain);
  const [showCanvasOverlay, setShowCanvasOverlay] = useState(settings.showCanvasOverlay);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    syncService.updateDisplaySettings({
      aspectRatio,
      resolution,
      fps,
      audioGain,
      showCanvasOverlay
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            Broadcast Engine & Display Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-cyan-400" />
              Canvas Aspect Ratio:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`py-2 px-3 rounded-lg font-bold border transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                16:9 (Widescreen Broadcast)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('4:3')}
                className={`py-2 px-3 rounded-lg font-bold border transition-all ${
                  aspectRatio === '4:3'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                4:3 (Legacy SD Format)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Target Resolution:
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:outline-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="4K">4K Ultra HD</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Framerate (FPS):
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value) as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-medium focus:outline-none"
              >
                <option value={60}>60 FPS (Smooth Broadcast)</option>
                <option value={30}>30 FPS (Standard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Master Audio Gain / Processing:
              </span>
              <span className="font-mono text-emerald-400 font-bold">{audioGain}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={150}
              value={audioGain}
              onChange={(e) => setAudioGain(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-white font-semibold block">DVE / On-Screen Canvas Overlays</span>
                <span className="text-[10px] text-slate-400">Render clock, logos, lower-third & tickers</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCanvasOverlay(!showCanvasOverlay)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                showCanvasOverlay ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showCanvasOverlay ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
