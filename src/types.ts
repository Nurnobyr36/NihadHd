export type MediaCategory = 'Movies' | 'Songs' | 'Advertisements';

export type BroadcastState = 'Broadcasting' | 'Paused' | 'Offline';

export type BroadcastPhase = 'Movie' | 'Songs' | 'Ads' | 'Live Input';

export type LiveInputSource = 'Main Stream' | 'Studio Cam' | 'Emergency Feed' | 'External HLS';

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  duration: number; // in seconds
  category: MediaCategory;
  status: 'LIVE' | 'QUEUED' | 'PLAYED';
  fileSize?: string;
  resolution?: string;
  fps?: number;
  addedAt?: string;
  thumbnail?: string;
}

export interface TickerConfig {
  id: string;
  label: string;
  text: string;
  speed: 'slow' | 'normal' | 'fast';
  visible: boolean;
  badgeText: string;
  badgeBg: string; // CSS color or tailwind class
}

export interface NewsFlashConfig {
  active: boolean;
  id: string;
  title: string;
  content: string;
  style: 'purple' | 'red' | 'blue' | 'amber';
}

export interface BannerAdConfig {
  id: string;
  active: boolean;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  position: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right' | 'middle-left' | 'middle-right';
  badge: string;
  theme?: 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'gold';
  animation?: 'fade' | 'slide' | 'bounce' | 'pulse';
}

export type LogoAnimation = 
  | 'none'
  | 'spin' 
  | 'pulse' 
  | 'bounce' 
  | 'flip' 
  | 'zoom' 
  | 'floating' 
  | 'fade' 
  | 'glow' 
  | 'shimmer';

export interface ChannelLogoConfig {
  channelName: string; // e.g. "CHANNEL 3" or custom title
  badgeText: string;   // e.g. "HD", "LIVE", "4K"
  animation: LogoAnimation;
  stylePreset: 'blue-gradient' | 'rose-gold' | 'emerald-teal' | 'purple-pink' | 'gold-shine' | 'neon-cyan';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  visible: boolean;
  opacity: number; // 0.1 to 1.0
}

export interface DisplaySettings {
  aspectRatio: '16:9' | '4:3';
  resolution: '1080p' | '720p' | '4K';
  fps: 30 | 60;
  audioGain: number; // 0 to 100
  showCanvasOverlay: boolean;
}

export interface PlayoutState {
  isBroadcasting: boolean;
  state: BroadcastState;
  phase: BroadcastPhase;
  automationMode: boolean; // true = Auto advance, false = Manual
  currentMediaId: string | null;
  currentTime: number; // current video position in seconds
  duration: number;
  isPaused: boolean;
  volume: number; // 0 to 1
  liveInput: LiveInputSource;
  activeTab: MediaCategory;
  playlist: MediaItem[];
  tickers: TickerConfig[];
  newsFlash: NewsFlashConfig;
  banners: BannerAdConfig[];
  logoConfig: ChannelLogoConfig;
  displaySettings: DisplaySettings;
  lastUpdated: number;
  licenseKey: string;
  licenseStatus: 'PRO LICENSE - ACTIVE' | 'DEMO';
  licenseExpiry: string;
}
