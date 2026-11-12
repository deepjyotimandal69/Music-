import React, { useState } from 'react';
import { X, Copy, Check, Download, FastForward, Music, Mic2, Sparkles } from 'lucide-react';
import { Song } from '../types/music';

interface LyricsModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExtend: (song: Song) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  song,
  isOpen,
  onClose,
  onOpenExtend,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !song) return null;

  const handleCopy = () => {
    if (!song.lyrics) return;
    navigator.clipboard.writeText(song.lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = song.audioUrl;
    const cleanTitle = song.title.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-');
    link.download = `[MyAI-Studio]-${cleanTitle}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format lyrics with highlighted section tags
  const renderFormattedLyrics = (text: string) => {
    if (!text) {
      return (
        <div className="text-center py-12 text-slate-500">
          <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Instrumental track. Pure audio performance without vocals.</p>
        </div>
      );
    }

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return (
          <div key={idx} className="pt-4 pb-1">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider text-purple-300 bg-purple-950/80 border border-purple-800/50 shadow-sm">
              {trimmed}
            </span>
          </div>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-slate-200 text-sm sm:text-base leading-relaxed tracking-wide font-sans">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#10121a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#141622]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={song.coverUrl}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-700 shadow shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                {song.title}
              </h3>
              <p className="text-xs text-slate-400">
                {song.genre} • {song.language} • {song.voiceGender} ({song.voiceStyle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Prompt Pill */}
        <div className="px-5 py-3 bg-[#0d0e15] border-b border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-300">Style:</strong> {song.styleDescription}
          </span>
        </div>

        {/* Lyrics Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 select-text">
          {renderFormattedLyrics(song.lyrics)}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#141622] flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-slate-400">
            Provider: <strong className="text-slate-300">{song.provider}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenExtend(song);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              Extend Song
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
