export type MusicGenre =
  | 'Hindi Sad Song'
  | 'Romantic Song'
  | 'Love Song'
  | 'Heartbreak Song'
  | 'DJ Music'
  | 'Rap'
  | 'Hip-Hop'
  | 'Pop'
  | 'Classical'
  | 'Lo-Fi'
  | 'Assamese Song'
  | 'Bengali Song'
  | 'Punjabi Song'
  | 'Devotional Song'
  | 'Instrumental Music'
  | 'Cinematic Music';

export type VoiceGender = 'male' | 'female' | 'duet';

export type VoiceStyle =
  | 'Deep emotional voice'
  | 'Soft romantic voice'
  | 'Powerful singing voice'
  | 'Melodic auto-tune'
  | 'Soulful acoustic'
  | 'Classical devotional';

export type SongMood =
  | 'Melancholic / Sad'
  | 'Romantic & Warm'
  | 'High-Energy Party / DJ'
  | 'Chill & Atmospheric'
  | 'Spiritual & Uplifting'
  | 'Epic & Dramatic'
  | 'Gully / Street Vibe';

export type Language =
  | 'Hindi'
  | 'Punjabi'
  | 'Bengali'
  | 'Assamese'
  | 'English'
  | 'Urdu'
  | 'Bhojpuri'
  | 'Tamil';

export type GenerationMode = 'custom' | 'ai';

export interface GenerationParams {
  mode: GenerationMode;
  title?: string;
  topic?: string;
  lyrics: string;
  genre: MusicGenre;
  language: Language;
  voiceGender: VoiceGender;
  voiceStyle: VoiceStyle;
  mood: SongMood;
  styleDescription: string;
  isInstrumental: boolean;
  variationsCount: number; // 1 or 2
  bpm?: number;
  provider?: 'auto' | 'kie' | 'lyria' | 'studio-engine';
}

export interface Song {
  id: string;
  title: string;
  genre: MusicGenre;
  language: Language;
  lyrics: string;
  styleDescription: string;
  voiceGender: VoiceGender;
  voiceStyle: VoiceStyle;
  mood: SongMood;
  isInstrumental: boolean;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  createdAt: string;
  isFavorite: boolean;
  playCount: number;
  downloadCount: number;
  variationName?: string; // 'Variation 1' or 'Variation 2'
  parentSongId?: string; // If extended from another song
  extensionTimestamp?: number;
  provider: string; // 'KIE AI', 'Suno v3.5', 'Lyria', 'Studio AI Engine'
  audioQuality?: string;
}

export interface AppSettings {
  defaultLanguage: Language;
  defaultVoice: VoiceGender;
  defaultVoiceStyle: VoiceStyle;
  defaultGenre: MusicGenre;
  audioQuality: '192kbps' | '320kbps' | 'lossless-wav';
  activeProvider: 'auto' | 'kie' | 'lyria' | 'studio-engine';
  kieApiKey?: string;
  kieApiEndpoint?: string;
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  autoPlayNext: boolean;
  showVisualizer: boolean;
}
