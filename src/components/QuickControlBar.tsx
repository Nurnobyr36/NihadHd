import React, { useState } from 'react';
import { Settings, Zap, Video, MessageSquare, AlertTriangle, Image as ImageIcon, Edit3, Tv, Sparkles, Eye, EyeOff, Plus, Trash2, PlusCircle, Layers, X, Upload } from 'lucide-react';
import { PlayoutState, LiveInputSource, LogoAnimation, BannerAdConfig } from '../types';
import { syncService } from '../services/broadcastSync';

interface QuickControlBarProps {
  state: PlayoutState;
  onOpenDisplaySettings: () => void;
  onEditTicker: (tickerId: string) => void;
}

export const QuickControlBar: React.FC<QuickControlBarProps> = ({
  state,
  onOpenDisplaySettings,
  onEditTicker,
}) => {
  const [showLogoEditor, setShowLogoEditor] = useState<boolean>(false);
  const [showBannerEditor, setShowBannerEditor] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerAdConfig> | null>(null);

  const handleSaveBanner = () => {
    if (!editingBanner || !editingBanner.title) return;

    if (editingBanner.id) {
      syncService.updateBanner(editingBanner.id, {
        title: editingBanner.title,
        subtitle: editingBanner.subtitle || '',
        badge: editingBanner.badge || 'PROMO',
        position: editingBanner.position || 'middle-left',
        imageUrl: editingBanner.imageUrl || '',
        theme: editingBanner.theme || 'indigo',
        animation: editingBanner.animation || 'fade',
      });
    } else {
      syncService.addBanner({
        title: editingBanner.title,
        subtitle: editingBanner.subtitle || '',
        badge: editingBanner.badge || 'NEW AD',
        position: editingBanner.position || 'middle-right',
        imageUrl: editingBanner.imageUrl || '',
        theme: editingBanner.theme || 'gold',
        animation: editingBanner.animation || 'pulse',
        active: true,
      });
    }
    setEditingBanner(null);
  };

  const handleDeleteBanner = (bannerId: string) => {
    syncService.deleteBanner(bannerId);
    if (editingBanner?.id === bannerId) {
      setEditingBanner(null);
    }
  };

  const logo = state.logoConfig || {
    channelName: 'CHANNEL 3',
    badgeText: 'HD',
    animation: 'pulse',
    stylePreset: 'blue-gradient',
    position: 'top-right',
    visible: true,
    opacity: 0.95
  };

  const handleToggleAutomation = () => {
    syncService.toggleAutomation();
  };

  const handleLiveInputSelect = (source: LiveInputSource) => {
    syncService.setLiveInput(source);
  };

  const handleToggleTicker = (tickerId: string) => {
    syncService.toggleTicker(tickerId);
  };

  const handleToggleNewsFlash = (preset: 'news1' | 'news2') => {
    if (preset === 'news1') {
      const isCurrentActive = state.newsFlash.active && state.newsFlash.id === 'news-1';
      syncService.toggleNewsFlash(
        !isCurrentActive,
        'শুভ উদ্বোধন',
        'চ্যানেল ৩ এইচডিতে সম্প্রচারিত হচ্ছে বিশেষ শুভ উদ্বোধন প্রদর্শনী।'
      );
    } else {
      const isCurrentActive = state.newsFlash.active && state.newsFlash.id === 'news-2';
      syncService.toggleNewsFlash(
        !isCurrentActive,
        'জরুরি খবর',
        'বিশেষ আবহাওয়া বার্তা: উত্তর ও উত্তর-পূর্বাঞ্চলে ভারী বর্ষণের সম্ভাবনা।'
      );
    }
  };

  const handleToggleBanner = (bannerId: string) => {
    syncService.toggleBanner(bannerId);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Broadcast Control Bar
          </h2>

          {/* Toggle Channel Logo Editor Button */}
          <button
            onClick={() => setShowLogoEditor(!showLogoEditor)}
            className="text-xs px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg flex items-center gap-1.5 border border-blue-500/40 font-bold transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Logo Settings: {logo.channelName}</span>
            <span className="text-[10px] bg-blue-600 text-white px-1 rounded uppercase font-mono">{logo.badgeText}</span>
          </button>

          {/* Toggle Banner Customizer Button */}
          <button
            onClick={() => setShowBannerEditor(!showBannerEditor)}
            className="text-xs px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg flex items-center gap-1.5 border border-emerald-500/40 font-bold transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Banner Customizer ({state.banners.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenDisplaySettings}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          Display Settings
        </button>
      </div>

      {/* EDITABLE CHANNEL LOGO & ANIMATION SETTINGS PANEL */}
      {showLogoEditor && (
        <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Channel Watermark & Animated Logo Customizer</span>
            </div>
            <button
              onClick={() => syncService.updateLogoConfig({ visible: !logo.visible })}
              className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 ${
                logo.visible ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {logo.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {logo.visible ? 'Logo Visible' : 'Logo Hidden'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Channel Title Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Channel Title / Name</label>
              <input
                type="text"
                value={logo.channelName}
                onChange={(e) => syncService.updateLogoConfig({ channelName: e.target.value })}
                placeholder="CHANNEL 3"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-xs focus:border-blue-500 outline-none"
              />
            </div>

            {/* Badge Text Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Label</label>
              <input
                type="text"
                value={logo.badgeText}
                onChange={(e) => syncService.updateLogoConfig({ badgeText: e.target.value })}
                placeholder="HD / 4K / LIVE"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-xs focus:border-blue-500 outline-none uppercase font-mono"
              />
            </div>

            {/* Animation Style Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Animation Preset</label>
              <select
                value={logo.animation}
                onChange={(e) => syncService.updateLogoConfig({ animation: e.target.value as LogoAnimation })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold text-xs focus:border-blue-500 outline-none"
              >
                <option value="pulse">Pulse Beat (হৃদস্পন্দন)</option>
                <option value="spin">Continuous 3D Spin (ঘূর্ণন)</option>
                <option value="bounce">Soft Bounce (বাউন্স)</option>
                <option value="flip">3D Y-Flip (থ্রিডি ফ্লিপ)</option>
                <option value="zoom">Breathing Zoom (জুম)</option>
                <option value="floating">Floating (ফ্লোটিং)</option>
                <option value="fade">Fade In-Out (ফেড ইন-আউট)</option>
                <option value="glow">Neon Glow Pulse (গ্লো)</option>
                <option value="shimmer">Shimmer Shift (শিমার)</option>
                <option value="none">Static None (স্থির)</option>
              </select>
            </div>

            {/* Color Theme Preset */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Color Preset</label>
              <select
                value={logo.stylePreset}
                onChange={(e) => syncService.updateLogoConfig({ stylePreset: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold text-xs focus:border-blue-500 outline-none"
              >
                <option value="blue-gradient">Blue Indigo Gradient</option>
                <option value="rose-gold">Rose Gold Gradient</option>
                <option value="emerald-teal">Emerald Teal Gradient</option>
                <option value="purple-pink">Purple Pink Gradient</option>
                <option value="gold-shine">Gold Shine Metallic</option>
                <option value="neon-cyan">Neon Cyan Bright</option>
              </select>
            </div>

            {/* Screen Position */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Screen Position</label>
              <select
                value={logo.position}
                onChange={(e) => syncService.updateLogoConfig({ position: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold text-xs focus:border-blue-500 outline-none"
              >
                <option value="top-right">Top Right (উপরে ডান)</option>
                <option value="top-left">Top Left (উপরে বাম)</option>
                <option value="bottom-right">Bottom Right (নিচে ডান)</option>
                <option value="bottom-left">Bottom Left (নিচে বাম)</option>
              </select>
            </div>

            {/* Logo Opacity Slider */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Opacity: {Math.round(logo.opacity * 100)}%</label>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.05}
                value={logo.opacity}
                onChange={(e) => syncService.updateLogoConfig({ opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-900 rounded appearance-none cursor-pointer accent-blue-500 mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDITABLE BANNER OVERLAYS CUSTOMIZER PANEL */}
      {showBannerEditor && (
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Banner Overlay Customizer & Graphic Ads Creator</span>
            </div>
            <button
              onClick={() => {
                setEditingBanner({
                  title: '',
                  subtitle: '',
                  badge: 'SPONSORED',
                  position: 'middle-right',
                  imageUrl: 'https://picsum.photos/300/150?random=' + Math.floor(Math.random() * 100),
                  theme: 'gold',
                  animation: 'pulse',
                });
              }}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 transition-colors shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Banner Ad</span>
            </button>
          </div>

          {/* List of Existing Banners with Edit / Toggle / Delete Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {state.banners.map((banner) => (
              <div
                key={banner.id}
                className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                  banner.active
                    ? 'bg-slate-900 border-emerald-500/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${banner.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded uppercase">
                          {banner.badge}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">{banner.position}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate mt-1 bengali-text">{banner.title}</h4>
                      {banner.subtitle && <p className="text-[10px] text-slate-400 truncate bengali-text">{banner.subtitle}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => handleToggleBanner(banner.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      banner.active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {banner.active ? 'AIRING ON' : 'OFF AIR'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingBanner(banner)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded"
                      title="Edit Banner"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Creation & Editing Form */}
          {editingBanner && (
            <div className="bg-slate-900 p-3.5 rounded-lg border border-indigo-500/40 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-300">
                  {editingBanner.id ? 'Edit Banner Overlay' : 'Create New Custom Banner Overlay'}
                </span>
                <button
                  onClick={() => setEditingBanner(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Banner Title (বাংলা / EN)</label>
                  <input
                    type="text"
                    value={editingBanner.title || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="স্পন্সরড অ্যাড / বিশেষ ছাড়..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold focus:border-emerald-500 outline-none bengali-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Subtitle Description</label>
                  <input
                    type="text"
                    value={editingBanner.subtitle || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    placeholder="আজকের সেরা অফার উপভোগ করুন..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-emerald-500 outline-none bengali-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Badge Label</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    placeholder="SPONSORED / PROMO / SALE"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-bold focus:border-emerald-500 outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Screen Position</label>
                  <select
                    value={editingBanner.position || 'middle-right'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold focus:border-emerald-500 outline-none"
                  >
                    <option value="middle-right">Middle Right (মাঝখানে ডান)</option>
                    <option value="middle-left">Middle Left (মাঝখানে বাম)</option>
                    <option value="top-right">Top Right (উপরে ডান)</option>
                    <option value="top-left">Top Left (উপরে বাম)</option>
                    <option value="bottom-right">Bottom Right (নিচে ডান)</option>
                    <option value="bottom-left">Bottom Left (নিচে বাম)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Color Theme</label>
                  <select
                    value={editingBanner.theme || 'indigo'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, theme: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold focus:border-emerald-500 outline-none"
                  >
                    <option value="indigo">Indigo Classic (ইন্ডিগো)</option>
                    <option value="emerald">Emerald Green (সবুজ)</option>
                    <option value="gold">Gold Metallic (সোনালী)</option>
                    <option value="rose">Rose Red Alert (লাল)</option>
                    <option value="amber">Amber Orange (কমলা)</option>
                    <option value="cyan">Cyan Electric (সায়ান)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Animation Preset</label>
                  <select
                    value={editingBanner.animation || 'pulse'}
                    onChange={(e) => setEditingBanner({ ...editingBanner, animation: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-semibold focus:border-emerald-500 outline-none"
                  >
                    <option value="pulse">Pulse Beat (পালস)</option>
                    <option value="bounce">Soft Bounce (বাউন্স)</option>
                    <option value="slide">Slide In (স্লাইড)</option>
                    <option value="fade">Fade Gentle (ফেড)</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Image Graphic URL (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingBanner.imageUrl || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                      placeholder="https://example.com/banner.png or sample image"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:border-emerald-500 outline-none font-mono"
                    />
                    <button
                      onClick={() => setEditingBanner({
                        ...editingBanner,
                        imageUrl: `https://picsum.photos/300/150?random=${Math.floor(Math.random() * 1000)}`
                      })}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded flex items-center gap-1 border border-slate-700 shrink-0"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Random Graphic</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingBanner(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow"
                >
                  {editingBanner.id ? 'Save Banner Changes' : 'Create Banner Overlay'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Automation & Input Switcher */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Playout Mode</span>
            <span className={state.automationMode ? "text-emerald-400" : "text-amber-400"}>
              {state.automationMode ? "AUTO QUEUE" : "MANUAL SELECT"}
            </span>
          </div>

          <button
            onClick={handleToggleAutomation}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              state.automationMode
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${state.automationMode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            Automation: {state.automationMode ? 'ENABLED (Auto Next)' : 'DISABLED (Manual)'}
          </button>

          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block mb-1">Live Input Source:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Main Stream', 'Studio Cam', 'Emergency Feed', 'External HLS'] as LiveInputSource[]).map((src) => (
                <button
                  key={src}
                  onClick={() => handleLiveInputSelect(src)}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left flex items-center justify-between ${
                    state.liveInput === src
                      ? 'bg-indigo-600 text-white font-semibold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{src}</span>
                  {state.liveInput === src && <Video className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Ticker Controllers */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              On-Screen Tickers
            </span>
            <span className="text-[10px] text-slate-500">Toggle / Edit</span>
          </div>

          <div className="space-y-1.5">
            {state.tickers.map((ticker) => (
              <div key={ticker.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleTicker(ticker.id)}
                  className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    ticker.visible
                      ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/50 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full ${ticker.visible ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="truncate bengali-text">{ticker.badgeText || ticker.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-900/80 rounded text-slate-300">
                    {ticker.visible ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => onEditTicker(ticker.id)}
                  title="Edit Ticker Text & Speed"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* News Flash Overlay Buttons */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              News Flash Graphics
            </span>
            <span className="text-[10px] font-mono text-rose-400">
              {state.newsFlash.active ? 'ACTIVE ON AIR' : 'INACTIVE'}
            </span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleToggleNewsFlash('news1')}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold bengali-text transition-all flex items-center justify-between ${
                state.newsFlash.active && state.newsFlash.title === 'শুভ উদ্বোধন'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-900/40'
              }`}
            >
              <span>News 1: "শুভ উদ্বোধন"</span>
              <span className="text-[10px] font-mono">
                {state.newsFlash.active && state.newsFlash.title === 'শুভ উদ্বোধন' ? 'LIVE' : 'SHOW'}
              </span>
            </button>

            <button
              onClick={() => handleToggleNewsFlash('news2')}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold bengali-text transition-all flex items-center justify-between ${
                state.newsFlash.active && state.newsFlash.title === 'জরুরি খবর'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/40'
              }`}
            >
              <span>News 2: "জরুরি খবর"</span>
              <span className="text-[10px] font-mono">
                {state.newsFlash.active && state.newsFlash.title === 'জরুরি খবর' ? 'LIVE' : 'SHOW'}
              </span>
            </button>
          </div>
        </div>

        {/* Banner Ads Controller */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              Banner Overlays
            </span>
            <span className="text-[10px] text-slate-500">DVE Ads</span>
          </div>

          <div className="space-y-1.5">
            {state.banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => handleToggleBanner(banner.id)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                  banner.active
                    ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${banner.active ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span className="truncate">Banner {index + 1}: {banner.title}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">
                  {banner.active ? 'ON' : 'OFF'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
