import { MediaItem, TickerConfig, NewsFlashConfig, BannerAdConfig, DisplaySettings, ChannelLogoConfig } from '../types';

export const INITIAL_LOGO_CONFIG: ChannelLogoConfig = {
  channelName: 'CHANNEL 3',
  badgeText: 'HD',
  animation: 'pulse',
  stylePreset: 'blue-gradient',
  position: 'top-right',
  visible: true,
  opacity: 0.95
};

export const INITIAL_PLAYLIST: MediaItem[] = [
  {
    id: 'media-1',
    title: 'Big Buck Bunny - Animated 1080p Feature Movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    category: 'Movies',
    status: 'LIVE',
    resolution: '1080p',
    fps: 60,
    fileSize: '158 MB',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80',
    addedAt: '10:00 AM'
  },
  {
    id: 'media-2',
    title: 'Sintel 4K Cinema Release - Fantasy Short Film',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 888,
    category: 'Movies',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 30,
    fileSize: '240 MB',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&auto=format&fit=crop&q=80',
    addedAt: '10:15 AM'
  },
  {
    id: 'media-3',
    title: 'Tears of Steel - Sci-Fi Action Master Clip',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
    category: 'Movies',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 60,
    fileSize: '310 MB',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    addedAt: '10:30 AM'
  },
  {
    id: 'media-4',
    title: 'For Bigger Blazes - Visual Acoustic Music Video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
    category: 'Songs',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 30,
    fileSize: '18 MB',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    addedAt: '10:45 AM'
  },
  {
    id: 'media-5',
    title: 'For Bigger Escape - Pop Beats & Dance Release',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15,
    category: 'Songs',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 30,
    fileSize: '22 MB',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    addedAt: '11:00 AM'
  },
  {
    id: 'media-6',
    title: 'For Bigger Joyrides - Electronic Beats Concert',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: 15,
    category: 'Songs',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 30,
    fileSize: '19 MB',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80',
    addedAt: '11:15 AM'
  },
  {
    id: 'media-7',
    title: 'Commercial Spot: Fiber Optic High-Speed Internet Promo',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: 15,
    category: 'Advertisements',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 60,
    fileSize: '12 MB',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80',
    addedAt: '11:30 AM'
  },
  {
    id: 'media-8',
    title: 'Commercial Spot: Smart IPTV Set-Top Box Promo',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    duration: 60,
    category: 'Advertisements',
    status: 'QUEUED',
    resolution: '1080p',
    fps: 30,
    fileSize: '35 MB',
    thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&auto=format&fit=crop&q=80',
    addedAt: '11:45 AM'
  }
];

export const INITIAL_TICKERS: TickerConfig[] = [
  {
    id: 'ticker-1',
    label: 'Ticker 1 (Announcements)',
    badgeText: 'শুভ উদ্বোধন',
    badgeBg: 'bg-purple-600',
    text: 'কেবল স্ট্রিম স্টুডিও ৩.০ চ্যানেল ৩ লাইভ সম্প্রচারে আপনাকে স্বাগতম। আল্ট্রা এইচডি ডিজিটাল প্রযুক্তিতে আপনার প্রিয় টিভি চ্যানেল।',
    speed: 'normal',
    visible: true,
  },
  {
    id: 'ticker-2',
    label: 'Ticker 2 (Notice / Breaking)',
    badgeText: 'বিশেষ বিজ্ঞপ্তি',
    badgeBg: 'bg-red-600',
    text: 'আজ সন্ধ্যা ৭টায় দেখুন সরাসরি বাংলা সিনেমার বিশেষ প্রিমিয়ার। আপনার ক্যাবল সংযোগ সচল রাখতে নিয়মিত বিল পরিশোধ করুন।',
    speed: 'normal',
    visible: true,
  },
  {
    id: 'ticker-3',
    label: 'Ticker 3 (Sports & Weather)',
    badgeText: 'খেলাধুলা ও আবহাওয়া',
    badgeBg: 'bg-blue-600',
    text: 'লাইভ আপডেট: ঢাকা প্রিমিয়ার লিগ জমজমাট ম্যাচ চলছে। তাপমাত্রা আজ সর্বোচ্চ ৩৩°C, আকাশ আংশিক মেঘলা থাকতে পারে।',
    speed: 'fast',
    visible: false,
  }
];

export const INITIAL_NEWS_FLASH: NewsFlashConfig = {
  active: false,
  id: 'news-1',
  title: 'জরুরি খবর',
  content: 'চ্যানেল ৩ এইচডি সম্প্রচারে যুক্ত হলো নতুন ফাইবার অপটিক নেটওয়ার্ক সার্ভার। নির্বিঘ্ন সেবা উপভোগ করুন।',
  style: 'red'
};

export const INITIAL_BANNERS: BannerAdConfig[] = [
  {
    id: 'banner-1',
    active: false,
    title: 'স্পন্সরড অ্যাডভারটাইজমেন্ট',
    subtitle: 'আপনার ব্যবসায়ের বিজ্ঞাপনের জন্য যোগাযোগ করুন: ০১৭০০-০০০০০০',
    position: 'top-left',
    badge: 'SPONSORED',
    theme: 'emerald',
    animation: 'slide'
  },
  {
    id: 'banner-2',
    active: false,
    title: 'চ্যানেল ৩ এইচডি প্রমোশন',
    subtitle: 'নতুন ফাইবার অপটিক কানেকশনে ৫০% মূল্যছাড়! বুকিং খোলা আছে।',
    position: 'bottom-left',
    badge: 'PROMO',
    theme: 'indigo',
    animation: 'bounce'
  },
  {
    id: 'banner-3',
    active: false,
    title: 'স্পেশাল ব্র্যান্ড ব্যানার',
    subtitle: 'আকর্ষণীয় ব্র্যান্ডিং ও এইচডি গ্রাফিক্স ভিজ্যুয়াল',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a317272018a?auto=format&fit=crop&w=600&q=80',
    position: 'middle-right',
    badge: 'LIVE AD',
    theme: 'gold',
    animation: 'pulse'
  }
];

export const INITIAL_DISPLAY_SETTINGS: DisplaySettings = {
  aspectRatio: '16:9',
  resolution: '1080p',
  fps: 60,
  audioGain: 100,
  showCanvasOverlay: true
};
