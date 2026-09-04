import React, { useState } from 'react';
import { Film, Music, Tv, Plus, Trash2, Play, ArrowUp, ArrowDown, FileVideo, Globe, CheckCircle2, ListOrdered, Edit3 } from 'lucide-react';
import { PlayoutState, MediaCategory, MediaItem } from '../types';
import { syncService } from '../services/broadcastSync';

interface PlaylistManagerProps {
  state: PlayoutState;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<MediaCategory>('Movies');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<MediaCategory>('Movies');
  const [newDuration, setNewDuration] = useState('120');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Item counters
  const moviesCount = state.playlist.filter(m => m.category === 'Movies').length;
  const songsCount = state.playlist.filter(m => m.category === 'Songs').length;
  const adsCount = state.playlist.filter(m => m.category === 'Advertisements').length;

  // Filtered list by active category
  const filteredPlaylist = state.playlist.filter(m => m.category === activeTab);

  const handlePlayNow = (id: string) => {
    syncService.selectMediaItem(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this media item from queue?')) {
      syncService.deleteMediaItem(id);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      // Find real index in overall state.playlist
      const item = filteredPlaylist[index];
      const realIndex = state.playlist.findIndex(m => m.id === item.id);
      if (realIndex > 0) {
        syncService.reorderMedia(realIndex, realIndex - 1);
      }
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < filteredPlaylist.length - 1) {
      const item = filteredPlaylist[index];
      const realIndex = state.playlist.findIndex(m => m.id === item.id);
      if (realIndex < state.playlist.length - 1) {
        syncService.reorderMedia(realIndex, realIndex + 1);
      }
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    syncService.addMediaItem({
      title: newTitle,
      url: newUrl,
      duration: parseInt(newDuration, 10) || 180,
      category: newCategory,
      resolution: '1080p',
      fps: 30,
      fileSize: 'Network Stream'
    });

    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const [isDetectingDuration, setIsDetectingDuration] = useState(false);

  const handleUrlChange = (url: string) => {
    setNewUrl(url);
    if (url.trim().startsWith('http://') || url.trim().startsWith('https://') || url.trim().startsWith('blob:')) {
      setIsDetectingDuration(true);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = url.trim();
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration > 0) {
          setNewDuration(Math.round(tempVideo.duration).toString());
        }
        setIsDetectingDuration(false);
      };
      tempVideo.onerror = () => {
        setIsDetectingDuration(false);
      };
    }
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = blobUrl;
      tempVideo.onloadedmetadata = () => {
        const detectedDuration = Math.round(tempVideo.duration) || 180;
        syncService.addMediaItem({
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: blobUrl,
          duration: detectedDuration,
          category: activeTab,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          resolution: 'Local File',
          fps: 30
        });
      };
      tempVideo.onerror = () => {
        syncService.addMediaItem({
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: blobUrl,
          duration: 180,
          category: activeTab,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          resolution: 'Local File',
          fps: 30
        });
      };
    }
  };

  const startEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      syncService.updateMediaItem(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-lg flex flex-col overflow-hidden shadow-xl">
      {/* Section Header & Tab Switcher */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setActiveTab('Movies')}
            className={`px-4 py-2 rounded text-xs font-bold transition-colors ${
              activeTab === 'Movies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
          >
            MOVIES ({moviesCount})
          </button>

          <button
            onClick={() => setActiveTab('Songs')}
            className={`px-4 py-2 rounded text-xs font-bold transition-colors ${
              activeTab === 'Songs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
          >
            SONGS ({songsCount})
          </button>

          <button
            onClick={() => setActiveTab('Advertisements')}
            className={`px-4 py-2 rounded text-xs font-bold transition-colors ${
              activeTab === 'Advertisements'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
          >
            ADS ({adsCount})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-[10px] uppercase font-bold text-white rounded border border-blue-400 shadow transition-colors flex items-center gap-1">
            + Browse Video
            <input
              type="file"
              accept="video/*"
              onChange={handleFileBrowse}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-slate-700 text-[10px] uppercase font-bold text-blue-300 rounded border border-slate-600 hover:bg-slate-600 transition-colors"
          >
            + Stream URL
          </button>

          {filteredPlaylist.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Delete all ${filteredPlaylist.length} items in ${activeTab}?`)) {
                  syncService.clearCategory(activeTab);
                }
              }}
              title={`Delete all items in ${activeTab}`}
              className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] uppercase font-bold rounded border border-rose-800 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              Clear {activeTab}
            </button>
          )}

          {state.playlist.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all media across Movies, Songs and Ads?')) {
                  syncService.clearAllMedia();
                }
              }}
              title="Clear all queued videos in all categories"
              className="px-2.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white text-[10px] uppercase font-bold rounded border border-rose-700 shadow transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-white" />
              Clear All Media ({state.playlist.length})
            </button>
          )}

          {state.playlist.length === 0 && (
            <button
              onClick={() => syncService.restoreDefaultPlaylist()}
              title="Restore default sample test videos"
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] uppercase font-bold rounded border border-emerald-500 shadow transition-colors flex items-center gap-1"
            >
              Load Sample Videos
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900/50 sticky top-0 border-b border-slate-700 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="p-3 w-10 text-slate-500">#</th>
              <th className="p-3 text-slate-500 font-bold uppercase tracking-wider">Media Asset</th>
              <th className="p-3 text-slate-500 font-bold uppercase tracking-wider">Path / Meta</th>
              <th className="p-3 text-slate-500 font-bold uppercase tracking-wider w-24">Status</th>
              <th className="p-3 text-slate-500 font-bold uppercase tracking-wider w-36 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredPlaylist.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl font-bold">
                      🎬
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">No media queued in {activeTab}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        ভিডিও যুক্ত করতে উপরে <b>+ Browse Video</b> বা <b>+ Stream URL</b> বাটন সিলেক্ট করুন।
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded shadow transition-colors">
                        + Browse Local Video File
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileBrowse}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded border border-slate-700 transition-colors"
                      >
                        + Add Stream URL
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPlaylist.map((item, index) => {
                const isLive = state.currentMediaId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isLive ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="p-3 font-mono text-slate-500">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>

                    <td className="p-3">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full"
                          />
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center shrink-0 text-slate-300 font-bold">
                            {item.category === 'Movies' ? '🎬' : item.category === 'Songs' ? '🎵' : '📺'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 bengali-text block">{item.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{Math.floor(item.duration / 60)}m {item.duration % 60}s</span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      <div className="truncate max-w-[220px]" title={item.url}>{item.url}</div>
                      <span className="text-[10px] text-slate-500">{item.fileSize || 'HD Stream'}</span>
                    </td>

                    <td className="p-3">
                      {isLive ? (
                        <span className="px-2 py-0.5 bg-rose-600 text-white rounded-[2px] font-bold text-[9px] uppercase tracking-wider">
                          LIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-600 text-slate-300 rounded-[2px] font-bold text-[9px] uppercase tracking-wider">
                          QUEUED
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handlePlayNow(item.id)}
                          title="Jump to Live Playout Now"
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </button>

                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 rounded transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === filteredPlaylist.length - 1}
                          title="Move Down"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 rounded transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => startEdit(item)}
                          title="Edit Title"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Remove from Queue"
                          className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Quick Controls Bar as defined in Professional Polish theme */}
      <div className="p-4 bg-slate-900 border-t border-slate-700 flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-slate-500">Ticker Control</span>
          <div className="flex gap-1">
            {state.tickers.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => syncService.toggleTicker(t.id)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                  t.visible ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                T{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 border-l border-slate-700 pl-3">
          <span className="text-[9px] uppercase font-bold text-slate-500">Flash News</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                const isCurrentActive = state.newsFlash.active && state.newsFlash.id === 'news-1';
                syncService.toggleNewsFlash(!isCurrentActive, 'শুভ উদ্বোধন', 'চ্যানেল ৩ এইচডিতে বিশেষ সম্প্রচার শুরু।');
              }}
              className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                state.newsFlash.active && state.newsFlash.title === 'শুভ উদ্বোধন' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              NEWS 1
            </button>
            <button
              onClick={() => {
                const isCurrentActive = state.newsFlash.active && state.newsFlash.id === 'news-2';
                syncService.toggleNewsFlash(!isCurrentActive, 'জরুরি খবর', 'বিশেষ আবহাওয়া বার্তা: ভারী বর্ষণের সম্ভাবনা।');
              }}
              className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                state.newsFlash.active && state.newsFlash.title === 'জরুরি খবর' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              NEWS 2
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-l border-slate-700 pl-3">
          <span className="text-[9px] uppercase font-bold text-slate-500">Overlays</span>
          <div className="flex gap-1">
            <button
              onClick={() => syncService.updateDisplaySettings({ showCanvasOverlay: !state.displaySettings.showCanvasOverlay })}
              className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                state.displaySettings.showCanvasOverlay ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              CLOCK
            </button>
            <button
              onClick={() => syncService.updateDisplaySettings({ showCanvasOverlay: !state.displaySettings.showCanvasOverlay })}
              className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                state.displaySettings.showCanvasOverlay ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              BUG
            </button>
            {state.banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => syncService.toggleBanner(b.id)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold ${
                  b.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                BANNER {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Direct URL Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add Network Stream or Video
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Title / Track Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HD Nature Master Clip"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Direct Video URL (MP4 / HLS):</label>
                <input
                  type="url"
                  required
                  placeholder="https://domain.com/stream.mp4"
                  value={newUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MediaCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="Movies">Movies</option>
                    <option value="Songs">Songs</option>
                    <option value="Advertisements">Advertisements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center justify-between">
                    <span>Duration (Sec):</span>
                    {isDetectingDuration && <span className="text-[9px] text-blue-400 animate-pulse">Detecting...</span>}
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Append to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
