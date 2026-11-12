import React from 'react';
import { Play, Pause, Heart, Download, Music2, MoreVertical, Sparkles, FastForward, Trash2, FileText } from 'lucide-react';
import { Song } from '../types/music';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (id: string) => void;
  onOpenLyrics: (song: Song) => void;
  onOpenExtend: (song: Song) => void;
  onDelete: (id: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isPlaying,
  isCurrent,
  onPlay,
  onToggleFavorite,
  onOpenLyrics,
  onOpenExtend,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = song.audioUrl;
    const cleanTitle = song.title.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-');
    link.download = `[MyAI-Studio]-${cleanTitle}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preview first couple of lines of lyrics
  const lyricsSnippet = song.lyrics
    ? song.lyrics
        .split('\n')
        .filter((l) => l.trim() && !l.startsWith('['))
        .slice(0, 2)
        .join(' • ')
    : song.styleDescription;

  return (
    <div
      onClick={() => onPlay(song)}
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-pointer border ${
        isCurrent
          ? 'bg-gradient-to-r from-violet-950/60 via-purple-900/30 to-slate-900/80 border-purple-500/50 shadow-lg shadow-purple-500/10'
          : 'bg-[#12141c]/90 hover:bg-[#181a26] border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Left: Thumbnail & Play Trigger */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 shadow-md bg-slate-900 border border-slate-800">
          <img
            src={song.coverUrl}
            alt={song.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isCurrent && isPlaying ? 'scale-105' : 'group-hover:scale-105'
            }`}
          />

          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(song);
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              {isCurrent && isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Equalizer animation badge when active */}
          {isCurrent && isPlaying && (
            <div className="absolute bottom-1 right-1 flex items-end gap-0.5 bg-black/60 px-1 py-0.5 rounded">
              <span className="w-0.5 h-3 bg-fuchsia-400 animate-pulse" />
              <span className="w-0.5 h-2 bg-purple-400 animate-bounce" />
              <span className="w-0.5 h-4 bg-cyan-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Title, genre and metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-semibold text-sm sm:text-base truncate ${
                isCurrent ? 'text-purple-300' : 'text-slate-100 group-hover:text-purple-200'
              }`}
            >
              {song.title}
            </h4>

            {song.variationName && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60">
                {song.variationName}
              </span>
            )}

            {song.parentSongId && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <FastForward className="w-2.5 h-2.5" /> Extended
              </span>
            )}
          </div>

          {/* Genre and Voice tags */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
            <span className="text-violet-400 font-medium">{song.genre}</span>
            <span>•</span>
            <span className="text-slate-300">{song.language}</span>
            <span>•</span>
            <span className="text-slate-400">
              {song.isInstrumental ? 'Instrumental' : `${song.voiceGender} • ${song.voiceStyle}`}
            </span>
          </div>

          {/* Lyrics preview line */}
          {lyricsSnippet && (
            <p className="text-xs text-slate-400/80 italic truncate mt-1 max-w-md sm:max-w-xl">
              "{lyricsSnippet}"
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions and duration */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
        <span className="text-xs font-mono text-slate-400">
          {formatDuration(song.duration)}
        </span>

        {/* Lyrics Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLyrics(song);
          }}
          title="View Full Lyrics"
          className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Extend Song */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenExtend(song);
          }}
          title="Extend / Continue Song"
          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FastForward className="w-4 h-4" />
        </button>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(song.id);
          }}
          title={song.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-1.5 rounded-lg transition-colors ${
            song.isFavorite
              ? 'text-rose-500 hover:text-rose-400 bg-rose-950/30'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Download MP3/WAV */}
        <button
          onClick={handleDownload}
          title="Download Audio File"
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${song.title}"?`)) {
              onDelete(song.id);
            }
          }}
          title="Delete song"
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
