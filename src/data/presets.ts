import { MusicGenre, VoiceGender, VoiceStyle, SongMood, Language } from '../types/music';

export const GENRE_PRESETS: {
  id: MusicGenre;
  name: string;
  tagline: string;
  defaultMood: SongMood;
  defaultStyle: string;
  color: string;
  iconName: string;
}[] = [
  {
    id: 'Hindi Sad Song',
    name: 'Hindi Sad Song',
    tagline: 'Heart-touching melancholic strings & soulful vocals',
    defaultMood: 'Melancholic / Sad',
    defaultStyle: 'Deep emotional acoustic guitar, soft piano, melancholic strings, slow tabla beat, reverb male vocals, 72 bpm, heartbreak feel',
    color: 'from-blue-600/30 to-indigo-900/40 border-blue-500/40',
    iconName: 'HeartCrack',
  },
  {
    id: 'Romantic Song',
    name: 'Romantic Song',
    tagline: 'Sweet melodies, acoustic chords & tender love ballads',
    defaultMood: 'Romantic & Warm',
    defaultStyle: 'Gentle acoustic strumming, grand piano, warm bassline, lush pads, romantic soft male-female duet vocals, 84 bpm',
    color: 'from-pink-600/30 to-rose-900/40 border-rose-500/40',
    iconName: 'Heart',
  },
  {
    id: 'Love Song',
    name: 'Love Song',
    tagline: 'Soulful Bollywood romance with violin and flute',
    defaultMood: 'Romantic & Warm',
    defaultStyle: 'Indian bansuri flute, nylon strings, emotive violin section, mid-tempo dholak rhythm, passionate clean vocals',
    color: 'from-red-600/30 to-amber-900/40 border-red-500/40',
    iconName: 'Sparkles',
  },
  {
    id: 'Heartbreak Song',
    name: 'Heartbreak Song',
    tagline: 'Raw tears, echoing piano & haunting vocal delivery',
    defaultMood: 'Melancholic / Sad',
    defaultStyle: 'Minimalist solo grand piano, cello bass, ambient rain atmosphere, weeping electric guitar solos, deep emotional voice',
    color: 'from-slate-700/30 to-violet-950/40 border-violet-500/40',
    iconName: 'CloudRain',
  },
  {
    id: 'DJ Music',
    name: 'DJ Music / EDM',
    tagline: 'Club bangers, fat 808 drops & festival dance beats',
    defaultMood: 'High-Energy Party / DJ',
    defaultStyle: 'Heavy synth leads, hard-hitting kick drum, sidechained bass, EDM buildup and drop, vocoder hooks, 128 bpm',
    color: 'from-cyan-600/30 to-teal-900/40 border-cyan-500/40',
    iconName: 'Disc',
  },
  {
    id: 'Rap',
    name: 'Desi Rap',
    tagline: 'Hard street bars, punchy 808s & fast rhythmic flow',
    defaultMood: 'Gully / Street Vibe',
    defaultStyle: 'Boom-bap punchy kicks, trap snare rolls, dark minor piano loop, fast aggressive Hindi rap verses, 90 bpm',
    color: 'from-amber-600/30 to-orange-950/40 border-amber-500/40',
    iconName: 'Mic',
  },
  {
    id: 'Hip-Hop',
    name: 'Hip-Hop',
    tagline: 'Smooth melodic hooks, crisp beats & underground vibe',
    defaultMood: 'Gully / Street Vibe',
    defaultStyle: 'Chill trap beat, 808 sub, soulful electric piano sample, autotuned vocal ad-libs, crisp modern flow',
    color: 'from-purple-600/30 to-zinc-900/40 border-purple-500/40',
    iconName: 'Radio',
  },
  {
    id: 'Pop',
    name: 'Pop',
    tagline: 'Catchy radio choruses, upbeat groove & bright synths',
    defaultMood: 'Romantic & Warm',
    defaultStyle: 'Bright synth-pop, groovy bassline, four-on-the-floor kick, polished vocal production, earworm melody, 115 bpm',
    color: 'from-fuchsia-600/30 to-pink-900/40 border-fuchsia-500/40',
    iconName: 'Music',
  },
  {
    id: 'Classical',
    name: 'Indian Classical',
    tagline: 'Raga-based melodies, sitar, sarangi & pure taals',
    defaultMood: 'Spiritual & Uplifting',
    defaultStyle: 'Traditional sitar alap, intricate tabla teental, tanpura drone, alaap and sargam vocal flourishes, classical acoustic',
    color: 'from-amber-700/30 to-yellow-950/40 border-amber-500/40',
    iconName: 'Flame',
  },
  {
    id: 'Lo-Fi',
    name: 'Lo-Fi Chill',
    tagline: 'Vinyl crackle, warm rhodes & mellow midnight vibes',
    defaultMood: 'Chill & Atmospheric',
    defaultStyle: 'Vintage Rhodes electric piano, vinyl tape hiss, relaxed jazz chords, lazy boom-bap drum groove, whispery vocals, 75 bpm',
    color: 'from-indigo-600/30 to-sky-950/40 border-indigo-500/40',
    iconName: 'Coffee',
  },
  {
    id: 'Assamese Song',
    name: 'Assamese Song',
    tagline: 'Bihu rhythms, pepa, dhol & serene Brahmaputra melodies',
    defaultMood: 'Romantic & Warm',
    defaultStyle: 'Authentic Assamese pepa and gogona tones, joyous Bihu dhol rhythm, acoustic bamboo flute, melodious regional folk vocals, 105 bpm',
    color: 'from-emerald-600/30 to-teal-950/40 border-emerald-500/40',
    iconName: 'Wind',
  },
  {
    id: 'Bengali Song',
    name: 'Bengali Song',
    tagline: 'Poetic Rabindra-style melodies, acoustic guitars & nostalgia',
    defaultMood: 'Romantic & Warm',
    defaultStyle: 'Lyrical Bengali romantic melody, sweet acoustic guitar chords, dotara flourishes, mild tabla, soulful emotive singing, 80 bpm',
    color: 'from-sky-600/30 to-blue-950/40 border-sky-500/40',
    iconName: 'Feather',
  },
  {
    id: 'Punjabi Song',
    name: 'Punjabi Song',
    tagline: 'Bhangra dhol beats, energetic tumbi & powerhouse vocals',
    defaultMood: 'High-Energy Party / DJ',
    defaultStyle: 'Heavy Punjabi dholak and dhol, infectious tumbi riff, modern trap synths, powerful high-pitch Punjabi vocal hook, 98 bpm',
    color: 'from-yellow-600/30 to-amber-950/40 border-yellow-500/40',
    iconName: 'Zap',
  },
  {
    id: 'Devotional Song',
    name: 'Devotional Song / Bhakti',
    tagline: 'Harmonium, kartal, divine peaceful chanting & mantras',
    defaultMood: 'Spiritual & Uplifting',
    defaultStyle: 'Traditional harmonium melodies, dholak and manjira, sacred temple bells, peaceful choir chanting, pure devotional soulful voice',
    color: 'from-orange-600/30 to-red-950/40 border-orange-500/40',
    iconName: 'Sun',
  },
  {
    id: 'Instrumental Music',
    name: 'Instrumental Music',
    tagline: 'Pure melody, rich orchestration, no vocals',
    defaultMood: 'Epic & Dramatic',
    defaultStyle: 'Harmonic guitar solo, lush ambient pads, grand symphonic strings, subtle cinematic percussion, progressive build',
    color: 'from-violet-600/30 to-purple-950/40 border-violet-500/40',
    iconName: 'Sliders',
  },
  {
    id: 'Cinematic Music',
    name: 'Cinematic Music',
    tagline: 'Blockbuster orchestral swells, dramatic brass & epic climax',
    defaultMood: 'Epic & Dramatic',
    defaultStyle: 'Huge orchestral brass, cinematic taiko drums, rising string ostinatos, choir pads, Hans Zimmer style trailer climax',
    color: 'from-red-600/30 to-zinc-950/40 border-red-500/40',
    iconName: 'Film',
  },
];

export const VOICE_STYLES: VoiceStyle[] = [
  'Deep emotional voice',
  'Soft romantic voice',
  'Powerful singing voice',
  'Melodic auto-tune',
  'Soulful acoustic',
  'Classical devotional',
];

export const MOODS: SongMood[] = [
  'Melancholic / Sad',
  'Romantic & Warm',
  'High-Energy Party / DJ',
  'Chill & Atmospheric',
  'Spiritual & Uplifting',
  'Epic & Dramatic',
  'Gully / Street Vibe',
];

export const LANGUAGES: Language[] = [
  'Hindi',
  'Punjabi',
  'Bengali',
  'Assamese',
  'English',
  'Urdu',
  'Bhojpuri',
  'Tamil',
];

export const LYRICS_TAG_TEMPLATES = [
  '[Intro]',
  '[Verse 1]',
  '[Pre-Chorus]',
  '[Chorus]',
  '[Verse 2]',
  '[Drop]',
  '[Bridge]',
  '[Guitar Solo]',
  '[Outro]',
];
