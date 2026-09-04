import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Palette, FastForward } from 'lucide-react';
import { TickerConfig } from '../types';
import { syncService } from '../services/broadcastSync';

interface TickerEditModalProps {
  ticker: TickerConfig | null;
  onClose: () => void;
}

export const TickerEditModal: React.FC<TickerEditModalProps> = ({ ticker, onClose }) => {
  if (!ticker) return null;

  const [badgeText, setBadgeText] = useState(ticker.badgeText);
  const [text, setText] = useState(ticker.text);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(ticker.speed);
  const [badgeBg, setBadgeBg] = useState(ticker.badgeBg);

  useEffect(() => {
    if (ticker) {
      setBadgeText(ticker.badgeText);
      setText(ticker.text);
      setSpeed(ticker.speed);
      setBadgeBg(ticker.badgeBg);
    }
  }, [ticker]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker) {
      syncService.updateTicker(ticker.id, {
        badgeText,
        text,
        speed,
        badgeBg,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            Edit On-Screen Ticker ({ticker.label})
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Badge / Flash Header (Bengali / English):
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold bengali-text focus:outline-none focus:border-cyan-500"
              placeholder="e.g., শুভ উদ্বোধন"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Scroll Content Text (Crawling Marquee):
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white bengali-text focus:outline-none focus:border-cyan-500 leading-relaxed"
              placeholder="Enter marquee ticker announcement..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                Scroll Speed:
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium focus:outline-none"
              >
                <option value="slow">Slow (25s)</option>
                <option value="normal">Normal (20s)</option>
                <option value="fast">Fast (15s)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                Badge Background Style:
              </label>
              <select
                value={badgeBg}
                onChange={(e) => setBadgeBg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium focus:outline-none"
              >
                <option value="bg-purple-600">Deep Purple</option>
                <option value="bg-red-600">Urgent Red</option>
                <option value="bg-blue-600">Royal Blue</option>
                <option value="bg-emerald-600">Emerald Green</option>
                <option value="bg-amber-600">Amber Gold</option>
              </select>
            </div>
          </div>

          {/* Realtime Live Preview Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Graphics Live Preview</span>
            <div className="flex items-center gap-2 overflow-hidden bg-slate-900/90 rounded border border-slate-800 p-1.5">
              <span className={`px-2 py-1 ${badgeBg} text-white font-bold text-[11px] rounded bengali-text shadow`}>
                {badgeText || 'Badge'}
              </span>
              <span className="text-slate-200 text-xs truncate bengali-text">{text || 'Ticker text sample...'}</span>
            </div>
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
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Apply Live Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
