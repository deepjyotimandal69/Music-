import React from 'react';
import {
  Sparkles,
  Music,
  Compass,
  Library,
  Heart,
  History,
  Settings,
  Disc3,
  Sliders,
  Plus,
} from 'lucide-react';
import { Song } from '../types/music';

export type NavTab = 'studio' | 'discover' | 'library' | 'favorites' | 'history';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCreate: () => void;
  onOpenSettings: () => void;
  songsCount: number;
  favoritesCount: number;
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenCreate,
  onOpenSettings,
  songsCount,
  favoritesCount,
  currentSong,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <aside className="w-64 bg-[#0a0c14] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 hidden md:flex">
      {/* Top: Logo & Navigation */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Disc3 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              My AI Music Studio
            </h1>
            <p className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
              Suno AI Inspired
            </p>
          </div>
        </div>

        {/* Primary Create Button */}
        <button
          onClick={onOpenCreate}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-white/80" />
          <span>Create Music</span>
        </button>

        {/* Nav Links */}
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('studio')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Sparkles className={`w-4 h-4 ${activeTab === 'studio' ? 'text-purple-400' : ''}`} />
              Studio / Create
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </button>

          <button
            onClick={() => onTabChange('discover')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'discover'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Compass className={`w-4 h-4 ${activeTab === 'discover' ? 'text-purple-400' : ''}`} />
              Discover & Feed
            </span>
          </button>

          <button
            onClick={() => onTabChange('library')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Library className={`w-4 h-4 ${activeTab === 'library' ? 'text-purple-400' : ''}`} />
              My Library
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {songsCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('favorites')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-rose-400 fill-rose-500' : ''}`} />
              Favorites
            </span>
            {favoritesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-950/60 text-rose-300 border border-rose-900/40">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-purple-950/70 text-purple-200 border border-purple-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-purple-400' : ''}`} />
              Generation History
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom: Settings & Status */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Personal Settings
        </button>

        {/* Engine Status pill */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-200">Personal AI Engine</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Real 44.1kHz audio with custom Hindi & regional vocals. No subscriptions or payments.
          </p>
        </div>
      </div>
    </aside>
  );
};
