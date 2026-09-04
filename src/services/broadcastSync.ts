import { PlayoutState, MediaItem, TickerConfig, NewsFlashConfig, BannerAdConfig, DisplaySettings, BroadcastState, LiveInputSource, MediaCategory, BroadcastPhase, ChannelLogoConfig } from '../types';
import { INITIAL_PLAYLIST, INITIAL_TICKERS, INITIAL_NEWS_FLASH, INITIAL_BANNERS, INITIAL_DISPLAY_SETTINGS, INITIAL_LOGO_CONFIG } from '../data/initialPlaylist';

const STORAGE_KEY = 'cable_stream_studio_state_v1';
const CHANNEL_NAME = 'cable_stream_studio_broadcast_channel';

const getDefaultState = (): PlayoutState => ({
  isBroadcasting: true,
  state: 'Broadcasting',
  phase: 'Movie',
  automationMode: true,
  currentMediaId: INITIAL_PLAYLIST[0].id,
  currentTime: 0,
  duration: INITIAL_PLAYLIST[0].duration,
  isPaused: false,
  volume: 0.8,
  liveInput: 'Main Stream',
  activeTab: 'Movies',
  playlist: INITIAL_PLAYLIST,
  tickers: INITIAL_TICKERS,
  newsFlash: INITIAL_NEWS_FLASH,
  banners: INITIAL_BANNERS,
  logoConfig: INITIAL_LOGO_CONFIG,
  displaySettings: INITIAL_DISPLAY_SETTINGS,
  lastUpdated: Date.now(),
  licenseKey: 'CSS-PRO-88942-BD',
  licenseStatus: 'PRO LICENSE - ACTIVE',
  licenseExpiry: '2028-12-31'
});

class BroadcastSyncService {
  private state: PlayoutState;
  private listeners: Array<(state: PlayoutState) => void> = [];
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_UPDATE') {
            this.state = event.data.state;
            this.notifyListeners();
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available or restricted:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const newState = JSON.parse(event.newValue);
            this.state = newState;
            this.notifyListeners();
          } catch (e) {
            console.error('Failed to parse storage event state', e);
          }
        }
      });
    }
  }

  private loadInitialState(): PlayoutState {
    if (typeof window === 'undefined') return getDefaultState();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let playlist = parsed.playlist;
        if (!playlist || playlist.length === 0) {
          playlist = INITIAL_PLAYLIST;
        }
        let currentId = parsed.currentMediaId;
        if (!playlist.some((m: MediaItem) => m.id === currentId)) {
          currentId = playlist.length > 0 ? playlist[0].id : null;
        }
        return {
          ...getDefaultState(),
          ...parsed,
          playlist,
          currentMediaId: currentId,
          lastUpdated: Date.now()
        };
      }
    } catch (e) {
      console.warn('Failed to load local storage state, using default:', e);
    }
    return getDefaultState();
  }

  public getState(): PlayoutState {
    return { ...this.state };
  }

  public subscribe(listener: (state: PlayoutState) => void): () => void {
    this.listeners.push(listener);
    // Notify immediately on subscribe
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }

  public updateState(partialState: Partial<PlayoutState>): PlayoutState {
    // Derive phase if current media item changed
    let phase = this.state.phase;
    if (partialState.currentMediaId) {
      const activeMedia = (partialState.playlist || this.state.playlist).find(m => m.id === partialState.currentMediaId);
      if (activeMedia) {
        if (activeMedia.category === 'Movies') phase = 'Movie';
        else if (activeMedia.category === 'Songs') phase = 'Songs';
        else if (activeMedia.category === 'Advertisements') phase = 'Ads';
      }
    }
    if (partialState.liveInput && partialState.liveInput !== 'Main Stream') {
      phase = 'Live Input';
    }

    this.state = {
      ...this.state,
      ...partialState,
      phase,
      lastUpdated: Date.now()
    };

    // Update status flags on playlist items
    if (this.state.currentMediaId) {
      const activeId = this.state.currentMediaId;
      this.state.playlist = this.state.playlist.map(item => ({
        ...item,
        status: item.id === activeId ? 'LIVE' : 'QUEUED'
      }));
    }

    this.persistAndBroadcast();
    return this.getState();
  }

  private persistAndBroadcast() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save state to localStorage:', e);
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          state: this.state
        });
      } catch (e) {
        console.warn('Failed to postMessage on BroadcastChannel:', e);
      }
    }

    this.notifyListeners();
  }

  // --- Quick Actions ---

  public setBroadcastState(bState: BroadcastState) {
    this.updateState({
      state: bState,
      isBroadcasting: bState === 'Broadcasting',
      isPaused: bState === 'Paused'
    });
  }

  public setLiveInput(source: LiveInputSource) {
    this.updateState({
      liveInput: source,
      phase: source === 'Main Stream' ? 'Movie' : 'Live Input'
    });
  }

  public toggleAutomation() {
    this.updateState({
      automationMode: !this.state.automationMode
    });
  }

  public selectMediaItem(mediaId: string) {
    const item = this.state.playlist.find(m => m.id === mediaId);
    if (!item) return;

    this.updateState({
      currentMediaId: mediaId,
      currentTime: 0,
      duration: item.duration,
      isPaused: false,
      state: 'Broadcasting',
      isBroadcasting: true
    });
  }

  public playNext() {
    const playlist = this.state.playlist;
    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(m => m.id === this.state.currentMediaId);
    const nextIndex = (currentIndex + 1) % playlist.length;
    this.selectMediaItem(playlist[nextIndex].id);
  }

  public playPrevious() {
    const playlist = this.state.playlist;
    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(m => m.id === this.state.currentMediaId);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    this.selectMediaItem(playlist[prevIndex].id);
  }

  public seekTime(timeInSeconds: number) {
    this.updateState({
      currentTime: Math.max(0, Math.min(timeInSeconds, this.state.duration))
    });
  }

  public updatePlaybackProgress(currentTimeInSeconds: number) {
    const validTime = Math.max(0, currentTimeInSeconds);
    // Persist and broadcast if shifted significantly or every few seconds
    if (Math.abs(this.state.currentTime - validTime) > 2) {
      this.updateState({
        currentTime: validTime,
        lastUpdated: Date.now()
      });
    } else {
      this.state.currentTime = validTime;
      this.state.lastUpdated = Date.now();
      // Periodically update local storage silently for live tab sync
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
          // ignore storage error
        }
      }
    }
  }

  public toggleTicker(tickerId: string) {
    const updatedTickers = this.state.tickers.map(t =>
      t.id === tickerId ? { ...t, visible: !t.visible } : t
    );
    this.updateState({ tickers: updatedTickers });
  }

  public updateTicker(tickerId: string, updates: Partial<TickerConfig>) {
    const updatedTickers = this.state.tickers.map(t =>
      t.id === tickerId ? { ...t, ...updates } : t
    );
    this.updateState({ tickers: updatedTickers });
  }

  public toggleNewsFlash(active?: boolean, title?: string, content?: string) {
    const news = { ...this.state.newsFlash };
    if (active !== undefined) news.active = active;
    else news.active = !news.active;

    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;

    this.updateState({ newsFlash: news });
  }

  public toggleBanner(bannerId: string) {
    const updatedBanners = this.state.banners.map(b =>
      b.id === bannerId ? { ...b, active: !b.active } : b
    );
    this.updateState({ banners: updatedBanners });
  }

  public addBanner(banner: Omit<BannerAdConfig, 'id'>) {
    const newBanner: BannerAdConfig = {
      ...banner,
      id: `banner-${Date.now()}`
    };
    const updatedBanners = [...this.state.banners, newBanner];
    this.updateState({ banners: updatedBanners });
  }

  public updateBanner(bannerId: string, updates: Partial<BannerAdConfig>) {
    const updatedBanners = this.state.banners.map(b =>
      b.id === bannerId ? { ...b, ...updates } : b
    );
    this.updateState({ banners: updatedBanners });
  }

  public deleteBanner(bannerId: string) {
    const updatedBanners = this.state.banners.filter(b => b.id !== bannerId);
    this.updateState({ banners: updatedBanners });
  }

  public addMediaItem(item: Omit<MediaItem, 'id' | 'status' | 'addedAt'>) {
    const newMedia: MediaItem = {
      ...item,
      id: `media-${Date.now()}`,
      status: 'QUEUED',
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedPlaylist = [...this.state.playlist, newMedia];
    this.updateState({ playlist: updatedPlaylist });
  }

  public updateMediaItem(id: string, updates: Partial<MediaItem>) {
    const updatedPlaylist = this.state.playlist.map(m =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.updateState({ playlist: updatedPlaylist });
  }

  public clearCategory(category: MediaCategory) {
    const updatedPlaylist = this.state.playlist.filter(m => m.category !== category);
    let nextCurrentId = this.state.currentMediaId;
    if (!updatedPlaylist.some(m => m.id === nextCurrentId)) {
      nextCurrentId = updatedPlaylist.length > 0 ? updatedPlaylist[0].id : null;
    }
    this.updateState({
      playlist: updatedPlaylist,
      currentMediaId: nextCurrentId
    });
  }

  public clearAllMedia() {
    this.updateState({
      playlist: [],
      currentMediaId: null,
      currentTime: 0,
      duration: 0
    });
  }

  public restoreDefaultPlaylist() {
    this.updateState({
      playlist: INITIAL_PLAYLIST,
      currentMediaId: INITIAL_PLAYLIST.length > 0 ? INITIAL_PLAYLIST[0].id : null,
      currentTime: 0,
      duration: INITIAL_PLAYLIST.length > 0 ? INITIAL_PLAYLIST[0].duration : 0
    });
  }

  public deleteMediaItem(id: string) {
    const updatedPlaylist = this.state.playlist.filter(m => m.id !== id);
    let nextCurrentId = this.state.currentMediaId;
    if (this.state.currentMediaId === id) {
      nextCurrentId = updatedPlaylist.length > 0 ? updatedPlaylist[0].id : null;
    }
    this.updateState({
      playlist: updatedPlaylist,
      currentMediaId: nextCurrentId
    });
  }

  public reorderMedia(fromIndex: number, toIndex: number) {
    const playlist = [...this.state.playlist];
    const [removed] = playlist.splice(fromIndex, 1);
    playlist.splice(toIndex, 0, removed);
    this.updateState({ playlist });
  }

  public updateDisplaySettings(settings: Partial<DisplaySettings>) {
    this.updateState({
      displaySettings: {
        ...this.state.displaySettings,
        ...settings
      }
    });
  }

  public updateLogoConfig(updates: Partial<ChannelLogoConfig>) {
    this.updateState({
      logoConfig: {
        ...this.state.logoConfig,
        ...updates
      }
    });
  }

  public resetToDefault() {
    this.state = getDefaultState();
    this.persistAndBroadcast();
  }
}

export const syncService = new BroadcastSyncService();
