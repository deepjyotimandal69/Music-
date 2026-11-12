import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Download,
  FileText,
  Heart,
  Maximize2,
} from 'lucide-react';
import { Song } from '../types/music';
import { AudioVisualizer } from './AudioVisualizer';

interface MusicPlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenLyrics: (song: Song) => void;
  autoPlayNext?: boolean;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onToggleFavorite,
  onOpenLyrics,
  autoPlayNext = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Sync isPlaying state with HTML audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play request interrupted:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // When song changes, reset audio element source
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.currentTime = 0;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentSong?.id]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || currentSong?.duration || 0);
  };

  const handleEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (autoPlayNext) {
      onNext();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleDownload = () => {
    if (!currentSong) return;
    const link = document.createElement('a');
    link.href = currentSong.audioUrl;
    const cleanTitle = currentSong.title.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-');
    link.download = `[MyAI-Studio]-${cleanTitle}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f17]/95 backdrop-blur-xl border-t border-slate-800/90 px-4 sm:px-6 py-3 shadow-2xl transition-all">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* Left: Track Info & Thumbnail */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700 shadow-md"
          />

          <div className="min-w-0 flex-1">
            <h5 className="text-sm font-semibold text-slate-100 truncate">
              {currentSong.title}
            </h5>
            <p className="text-xs text-slate-400 truncate">
              <span className="text-violet-400 font-medium">{currentSong.genre}</span> •{' '}
              {currentSong.language}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            title={currentSong.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
          >
            <Heart className={`w-4 h-4 ${currentSong.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              title="Shuffle"
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-purple-400 bg-purple-950/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrev}
              title="Previous Track"
              className="p-1.5 text-slate-300 hover:text-white hover:scale-110 transition-transform"
            >
              <SkipBack className="w-4 h-4 fill-slate-300" />
            </button>

            <button
              onClick={onPlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              title="Next Track"
              className="p-1.5 text-slate-300 hover:text-white hover:scale-110 transition-transform"
            >
              <SkipForward className="w-4 h-4 fill-slate-300" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              title="Repeat"
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping ? 'text-purple-400 bg-purple-950/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Scrubber & Visualizer */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono text-slate-400 w-9 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || currentSong.duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-400 w-9">
              {formatTime(duration || currentSong.duration)}
            </span>

            {/* Embedded Visualizer */}
            <div className="hidden lg:block shrink-0">
              <AudioVisualizer isPlaying={isPlaying} />
            </div>
          </div>
        </div>

        {/* Right: Volume & Utilities */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          {/* Lyrics Button */}
          <button
            onClick={() => onOpenLyrics(currentSong)}
            title="Open Lyrics Drawer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lyrics</span>
          </button>

          {/* Download Audio */}
          <button
            onClick={handleDownload}
            title="Download MP3/WAV"
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
