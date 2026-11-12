import React, { useState } from 'react';
import { X, FastForward, Sparkles, Loader2 } from 'lucide-react';
import { Song } from '../types/music';

interface ExtendSongModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onExtend: (params: {
    songId: string;
    continuationLyrics: string;
    continuationStyle: string;
    fromSeconds: number;
  }) => Promise<void>;
  isExtending: boolean;
}

export const ExtendSongModal: React.FC<ExtendSongModalProps> = ({
  song,
  isOpen,
  onClose,
  onExtend,
  isExtending,
}) => {
  const [continuationLyrics, setContinuationLyrics] = useState(
    '[Bridge]\nYeh faasle mitne lage hain ab toh\nTere bina adhura har pal lagta hai...\n\n[Final Chorus]\nTu hi meri subah, tu hi meri shaam...'
  );
  const [continuationStyle, setContinuationStyle] = useState(
    song ? `${song.styleDescription}, rising emotional crescendo, key change, intense vocals` : ''
  );
  const [fromSeconds, setFromSeconds] = useState(song ? Math.floor(song.duration) : 30);

  if (!isOpen || !song) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onExtend({
      songId: song.id,
      continuationLyrics,
      continuationStyle: continuationStyle || song.styleDescription,
      fromSeconds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#10121a] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#141622]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FastForward className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Extend Song</h3>
              <p className="text-xs text-slate-400">
                Continue "{song.title}" with a new bridge, final chorus, or guitar solo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Continuation point */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Continue From (Seconds)
            </label>
            <input
              type="number"
              min={1}
              max={song.duration}
              value={fromSeconds}
              onChange={(e) => setFromSeconds(Number(e.target.value))}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Song duration is {Math.floor(song.duration)} seconds. Pick where the extension kicks in.
            </p>
          </div>

          {/* Continuation lyrics */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Continuation Lyrics / Musical Section
            </label>
            <textarea
              rows={4}
              value={continuationLyrics}
              onChange={(e) => setContinuationLyrics(e.target.value)}
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl p-3.5 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Continuation style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Style Changes / Progression
            </label>
            <input
              type="text"
              value={continuationStyle}
              onChange={(e) => setContinuationStyle(e.target.value)}
              placeholder="e.g. key change, higher vocal octave, soaring flute solo, heavier percussion"
              className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExtending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExtending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Extending Track...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Extended Version
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
