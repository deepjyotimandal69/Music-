/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Music,
  Compass,
  Library,
  Heart,
  History,
  Settings,
  Plus,
  Radio,
  Disc,
  Flame,
  Search,
} from 'lucide-react';
import { Song, GenerationParams, AppSettings } from './types/music';
import { GENRE_PRESETS } from './data/presets';
import { loadSettings, saveSettings } from './services/storage';
import {
  fetchSongs,
  generateMusic,
  extendSong,
  toggleSongFavorite,
  deleteSong,
} from './services/api';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { CreateMusicPanel } from './components/CreateMusicPanel';
import { SongCard } from './components/SongCard';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { LyricsModal } from './components/LyricsModal';
import { ExtendSongModal } from './components/ExtendSongModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('studio');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // Modals
  const [activeLyricsSong, setActiveLyricsSong] = useState<Song | null>(null);
  const [extendTargetSong, setExtendTargetSong] = useState<Song | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Load initial songs on mount
  useEffect(() => {
    fetchSongs()
      .then((loaded) => {
        setSongs(loaded);
        if (loaded.length > 0 && !currentSong) {
          setCurrentSong(loaded[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load songs:', err);
      });
  }, []);

  // Filtered Songs according to tab, search, and genre filter
  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      // Tab filter
      if (activeTab === 'favorites' && !s.isFavorite) return false;

      // Genre filter
      if (selectedGenreFilter !== 'All' && s.genre !== selectedGenreFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesGenre = s.genre.toLowerCase().includes(q);
        const matchesLyrics = s.lyrics.toLowerCase().includes(q);
        const matchesMood = s.mood.toLowerCase().includes(q);
        const matchesLanguage = s.language.toLowerCase().includes(q);
        const matchesStyle = s.styleDescription.toLowerCase().includes(q);
        return (
          matchesTitle ||
          matchesGenre ||
          matchesLyrics ||
          matchesMood ||
          matchesLanguage ||
          matchesStyle
        );
      }

      return true;
    });
  }, [songs, activeTab, selectedGenreFilter, searchQuery]);

  // Audio Player Controls
  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  // Music Generation
  const handleGenerate = async (params: GenerationParams) => {
    setIsGenerating(true);
    try {
      const generated = await generateMusic(params, {
        kieApiKey: settings.kieApiKey,
        kieApiEndpoint: settings.kieApiEndpoint,
        activeProvider: settings.activeProvider,
      });

      if (generated.length > 0) {
        setSongs((prev) => [...generated, ...prev]);
        setCurrentSong(generated[0]);
        setIsPlaying(true);
        // Switch to discover feed or library so user immediately sees and listens to the new tracks!
        setActiveTab('studio');
      }
    } catch (err: any) {
      alert(err.message || 'Music generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Song Extension
  const handleExtend = async (params: {
    songId: string;
    continuationLyrics: string;
    continuationStyle: string;
    fromSeconds: number;
  }) => {
    setIsExtending(true);
    try {
      const extended = await extendSong(params);
      setSongs((prev) => [extended, ...prev]);
      setCurrentSong(extended);
      setIsPlaying(true);
    } catch (err: any) {
      alert(err.message || 'Failed to extend song.');
    } finally {
      setIsExtending(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    // Optimistic UI update
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    try {
      await toggleSongFavorite(id);
    } catch (e) {
      console.warn('Favorite sync error:', e);
    }
  };

  // Delete Song
  const handleDeleteSong = async (id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    if (currentSong?.id === id) {
      const remaining = songs.filter((s) => s.id !== id);
      setCurrentSong(remaining[0] || null);
      if (remaining.length === 0) setIsPlaying(false);
    }
    try {
      await deleteSong(id);
    } catch (e) {
      console.warn('Delete sync error:', e);
    }
  };

  // Settings Save
  const handleSaveSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  const handleClearLibrary = () => {
    setSongs([]);
    setCurrentSong(null);
    setIsPlaying(false);
  };

  const handleImportSongs = (imported: Song[]) => {
    setSongs((prev) => [...imported, ...prev]);
  };

  const favoritesCount = useMemo(() => songs.filter((s) => s.isFavorite).length, [songs]);

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col md:flex-row pb-24 md:pb-28">
      {/* Suno AI Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreate={() => {
          setActiveTab('studio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        songsCount={songs.length}
        favoritesCount={favoritesCount}
        currentSong={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Universal Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenreFilter={selectedGenreFilter}
          onSelectGenreFilter={setSelectedGenreFilter}
          onOpenCreate={() => {
            setActiveTab('studio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          totalSongs={songs.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* STUDIO / CREATE TAB */}
          {activeTab === 'studio' && (
            <div className="space-y-8 animate-fade-in">
              {/* Creator Studio Component */}
              <CreateMusicPanel
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                settings={settings}
              />

              {/* Recently Created Songs in Studio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Recently Generated Tracks ({songs.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('library')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    View All in Library &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {songs.slice(0, 6).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrent={currentSong?.id === song.id}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenLyrics={(s) => setActiveLyricsSong(s)}
                      onOpenExtend={(s) => setExtendTargetSong(s)}
                      onDelete={handleDeleteSong}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DISCOVER & FEED TAB */}
          {activeTab === 'discover' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-violet-900/20 to-slate-900 border border-purple-800/40 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Suno AI Music Feed
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-2">
                    Studio Music Feed & Presets
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    Listen to full Hindi Sad Songs, Bollywood Romances, Punjabi Bhangra bangers, Desi Gully Rap, and Assamese Bihu melodies.
                  </p>
                </div>
              </div>

              {/* Feed Songs */}
              <div className="space-y-3">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrent={currentSong?.id === song.id}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenLyrics={(s) => setActiveLyricsSong(s)}
                      onOpenExtend={(s) => setExtendTargetSong(s)}
                      onDelete={handleDeleteSong}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-[#0f1118] rounded-2xl border border-slate-800">
                    <Music className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No songs found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY LIBRARY TAB */}
          {activeTab === 'library' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Library className="w-5 h-5 text-purple-400" />
                    My Personal Library
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {filteredSongs.length} songs saved in personal studio storage
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrent={currentSong?.id === song.id}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenLyrics={(s) => setActiveLyricsSong(s)}
                      onOpenExtend={(s) => setExtendTargetSong(s)}
                      onDelete={handleDeleteSong}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-[#0f1118] rounded-2xl border border-slate-800">
                    <Library className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Your library is empty.</p>
                    <button
                      onClick={() => setActiveTab('studio')}
                      className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                    >
                      Create Your First Song
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Favorite Songs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredSongs.length} favorite songs
                </p>
              </div>

              <div className="space-y-2.5">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isCurrent={currentSong?.id === song.id}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                      onPlay={handlePlaySong}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenLyrics={(s) => setActiveLyricsSong(s)}
                      onOpenExtend={(s) => setExtendTargetSong(s)}
                      onDelete={handleDeleteSong}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-[#0f1118] rounded-2xl border border-slate-800">
                    <Heart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No favorite songs yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click the heart icon on any song to save it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Generation History
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Timeline of all generated tracks, variations, and extensions
                </p>
              </div>

              <div className="space-y-2.5">
                {songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isCurrent={currentSong?.id === song.id}
                    isPlaying={currentSong?.id === song.id && isPlaying}
                    onPlay={handlePlaySong}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenLyrics={(s) => setActiveLyricsSong(s)}
                    onOpenExtend={(s) => setExtendTargetSong(s)}
                    onDelete={handleDeleteSong}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Persistent Bottom Floating Audio Player Bar */}
      <MusicPlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleFavorite={handleToggleFavorite}
        onOpenLyrics={(s) => setActiveLyricsSong(s)}
        autoPlayNext={settings.autoPlayNext}
      />

      {/* Full-Screen Lyrics & Inspector Modal */}
      <LyricsModal
        song={activeLyricsSong}
        isOpen={Boolean(activeLyricsSong)}
        onClose={() => setActiveLyricsSong(null)}
        onOpenExtend={(s) => setExtendTargetSong(s)}
      />

      {/* Extend Song Modal */}
      <ExtendSongModal
        song={extendTargetSong}
        isOpen={Boolean(extendTargetSong)}
        onClose={() => setExtendTargetSong(null)}
        onExtend={handleExtend}
        isExtending={isExtending}
      />

      {/* Personal Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        songs={songs}
        onClearLibrary={handleClearLibrary}
        onImportSongs={handleImportSongs}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d0f17]/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            activeTab === 'studio' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            activeTab === 'discover' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            activeTab === 'library' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Library</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            activeTab === 'favorites' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[10px] text-slate-400"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
