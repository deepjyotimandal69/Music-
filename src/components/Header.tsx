import React from 'react';
import { Search, Sparkles, Settings, Disc3, Filter, X } from 'lucide-react';
import { MusicGenre } from '../types/music';
import { GENRE_PRESETS } from '../data/presets';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedGenreFilter: string;
  onSelectGenreFilter: (genre: string) => void;
  onOpenCreate: () => void;
  onOpenSettings: () => void;
  totalSongs: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenreFilter,
  onSelectGenreFilter,
  onOpenCreate,
  onOpenSettings,
  totalSongs,
}) => {
  const quickFilters = [
    'All',
    'Hindi Sad Song',
    'Romantic Song',
    'DJ Music',
    'Rap',
    'Punjabi Song',
    'Assamese Song',
    'Devotional Song',
    'Instrumental Music',
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#090a10]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile Brand */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
            <Disc3 className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-white">My AI Music Studio</h1>
            <p className="text-[9px] text-purple-400 font-medium">Suno AI Inspired</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, lyrics, genre, or mood..."
            className="w-full bg-[#12141c] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold shadow-md shadow-purple-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Genre Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {quickFilters.map((filter) => {
          const isActive = selectedGenreFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => onSelectGenreFilter(filter)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-xs transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </header>
  );
};
