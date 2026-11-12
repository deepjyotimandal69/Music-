import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Mic,
  Sliders,
  Wand2,
  Volume2,
  Languages,
  Layers,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  MusicGenre,
  VoiceGender,
  VoiceStyle,
  SongMood,
  Language,
  GenerationParams,
  AppSettings,
} from '../types/music';
import {
  GENRE_PRESETS,
  VOICE_STYLES,
  MOODS,
  LANGUAGES,
  LYRICS_TAG_TEMPLATES,
} from '../data/presets';
import { generateLyrics, enhancePrompt } from '../services/api';

interface CreateMusicPanelProps {
  onGenerate: (params: GenerationParams) => Promise<void>;
  isGenerating: boolean;
  settings: AppSettings;
}

export const CreateMusicPanel: React.FC<CreateMusicPanelProps> = ({
  onGenerate,
  isGenerating,
  settings,
}) => {
  const [mode, setMode] = useState<'custom' | 'ai'>('ai');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>(settings.defaultGenre || 'Hindi Sad Song');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(settings.defaultLanguage || 'Hindi');
  const [selectedVoice, setSelectedVoice] = useState<VoiceGender>(settings.defaultVoice || 'male');
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>(settings.defaultVoiceStyle || 'Deep emotional voice');
  const [selectedMood, setSelectedMood] = useState<SongMood>('Melancholic / Sad');
  const [styleDescription, setStyleDescription] = useState(
    'Deep emotional acoustic guitar, soft piano, melancholic strings, slow tabla beat, reverb male vocals, 72 bpm, heartbreak feel'
  );
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [variationsCount, setVariationsCount] = useState<number>(2); // Default 2 tracks like Suno!
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [lyricsGeneratedSuccess, setLyricsGeneratedSuccess] = useState(false);

  // When genre changes, update default style and mood
  const handleGenreChange = (genre: MusicGenre) => {
    setSelectedGenre(genre);
    const preset = GENRE_PRESETS.find((p) => p.id === genre);
    if (preset) {
      setStyleDescription(preset.defaultStyle);
      setSelectedMood(preset.defaultMood);
    }
  };

  // Insert lyrics tag e.g. [Chorus], [Verse 1]
  const insertTag = (tag: string) => {
    setLyrics((prev) => (prev ? `${prev}\n\n${tag}\n` : `${tag}\n`));
  };

  // Generate Lyrics via Gemini API
  const handleAILyricsGenerate = async () => {
    setIsGeneratingLyrics(true);
    setLyricsGeneratedSuccess(false);
    try {
      const res = await generateLyrics({
        topic: topic.trim() || `${selectedGenre} about love and yearning`,
        genre: selectedGenre,
        language: selectedLanguage,
        mood: selectedMood,
        voiceGender: selectedVoice,
        voiceStyle: selectedVoiceStyle,
        isInstrumental,
      });

      setTitle(res.title);
      setLyrics(res.lyrics);
      if (res.styleDescription) {
        setStyleDescription(res.styleDescription);
      }
      setLyricsGeneratedSuccess(true);
      setTimeout(() => setLyricsGeneratedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to generate AI lyrics. Please check your network.');
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    setIsEnhancingPrompt(true);
    try {
      const enhanced = await enhancePrompt({
        genre: selectedGenre,
        mood: selectedMood,
        voiceStyle: selectedVoiceStyle,
      });
      setStyleDescription(enhanced);
    } catch (err) {
      console.warn('Enhance prompt error:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    if (mode === 'custom' && !lyrics.trim() && !isInstrumental) {
      alert('Please enter your song lyrics or toggle Instrumental mode!');
      return;
    }

    await onGenerate({
      mode,
      title: title.trim() || `${selectedGenre} ${selectedLanguage}`,
      topic,
      lyrics: isInstrumental ? '' : lyrics,
      genre: selectedGenre,
      language: selectedLanguage,
      voiceGender: selectedVoice,
      voiceStyle: selectedVoiceStyle,
      mood: selectedMood,
      styleDescription,
      isInstrumental,
      variationsCount,
    });
  };

  return (
    <div className="bg-[#0f1118] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/10 via-fuchsia-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Mode Switcher Tabs (Suno AI style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            AI Song Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create complete studio songs with AI vocals, melodies, and lyrics inspired by Suno AI.
          </p>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Mode B: AI Lyrics
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Mode A: Custom Lyrics
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MODE B: AI LYRICS TOPIC PROMPT */}
        {mode === 'ai' && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                Song Topic / Concept Idea
              </label>
              <button
                type="button"
                onClick={handleAILyricsGenerate}
                disabled={isGeneratingLyrics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                {isGeneratingLyrics ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing Lyrics...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Write Original Lyrics with AI
                  </>
                )}
              </button>
            </div>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Heartbroken lover walking in the Mumbai rain remembering promises, emotional sad Hindi song..."
              rows={2}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            {lyricsGeneratedSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Lyrics and title generated successfully! You can review or edit below, or hit "Generate Song".
              </div>
            )}
          </div>
        )}

        {/* SONG TITLE (Optional / Auto) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Song Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. ${selectedGenre} (Studio Track)`}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-violet-400" />
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LYRICS EDITOR (CUSTOM OR AI GENERATED) */}
        {!isInstrumental && (
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                {mode === 'custom' ? 'Your Song Lyrics' : 'Generated Lyrics (Editable)'}
              </label>

              {/* Tag template helper chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Insert tag:</span>
                {LYRICS_TAG_TEMPLATES.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 border border-slate-700 text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[Verse 1]&#10;Type or paste Hindi, English, Punjabi, or regional lyrics here...&#10;&#10;[Chorus]&#10;Tu hi mera jahaan, tu hi meri subah..."
              rows={mode === 'ai' && !lyrics ? 3 : 6}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}

        {/* MUSIC GENRE PRESETS (16 Required Genres) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-fuchsia-400" />
            Music Genre ({GENRE_PRESETS.length} Genres available)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2">
            {GENRE_PRESETS.map((genre) => {
              const isSelected = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreChange(genre.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? `bg-gradient-to-r ${genre.color} text-white shadow-lg`
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <p className="font-semibold text-xs truncate">{genre.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{genre.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* VOICE SETTINGS & MOOD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Voice Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Vocals Gender
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as VoiceGender)}
              disabled={isInstrumental}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 disabled:opacity-40 transition-colors"
            >
              <option value="male">Male Vocals</option>
              <option value="female">Female Vocals</option>
              <option value="duet">Duet Vocals (Male + Female)</option>
            </select>
          </div>

          {/* Voice Style / Timbre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Voice Style & Timbre
            </label>
            <select
              value={selectedVoiceStyle}
              onChange={(e) => setSelectedVoiceStyle(e.target.value as VoiceStyle)}
              disabled={isInstrumental}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 disabled:opacity-40 transition-colors"
            >
              {VOICE_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Song Mood
            </label>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as SongMood)}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            >
              {MOODS.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MUSIC STYLE DESCRIPTION & AI ENHANCE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Music Style & Instrumentation Prompt
            </label>
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isEnhancingPrompt}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              {isEnhancingPrompt ? 'Enhancing...' : 'AI Enhance Style'}
            </button>
          </div>
          <input
            type="text"
            value={styleDescription}
            onChange={(e) => setStyleDescription(e.target.value)}
            placeholder="e.g. Deep acoustic guitar, soft piano, melancholic strings, slow tabla beat, reverb male vocals, 72 bpm"
            className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* ADVANCED TOGGLES: INSTRUMENTAL & VARIATIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          {/* Instrumental Switch */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isInstrumental}
              onChange={(e) => setIsInstrumental(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 bg-slate-800 border-slate-700"
            />
            <div>
              <span className="text-xs font-semibold text-slate-200">Instrumental Only</span>
              <p className="text-[11px] text-slate-400">Generate pure music composition without vocals</p>
            </div>
          </label>

          {/* Variations Count (Suno 2 variations style) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Variations:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setVariationsCount(1)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  variationsCount === 1 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Track
              </button>
              <button
                type="button"
                onClick={() => setVariationsCount(2)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  variationsCount === 2 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Tracks (Suno)
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY GENERATE BUTTON */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-amber-400 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Studio Song ({variationsCount} variation{variationsCount > 1 ? 's' : ''})...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-white/80" />
              <span>Generate Music Now</span>
            </>
          )}
        </button>

        {/* Generation Progress Indicator */}
        {isGenerating && (
          <div className="space-y-2 animate-pulse pt-2">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 rounded-full w-3/4 animate-pulse" />
            </div>
            <p className="text-center text-xs text-slate-400">
              Synthesizing vocal formants, bass groove, acoustic layers, and mastering 44.1kHz audio...
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
