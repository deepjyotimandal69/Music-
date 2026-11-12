import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Database,
  Volume2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AppSettings, Song, MusicGenre, VoiceGender, VoiceStyle, Language } from '../types/music';
import { GENRE_PRESETS, VOICE_STYLES, LANGUAGES } from '../data/presets';
import { testKieApi, testSupabase } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  songs: Song[];
  onClearLibrary: () => void;
  onImportSongs: (imported: Song[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  songs,
  onClearLibrary,
  onImportSongs,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [kieTestStatus, setKieTestStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({
    loading: false,
  });
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ loading: boolean; msg?: string; success?: boolean }>({
    loading: false,
  });
  const [saveFeedback, setSaveFeedback] = useState(false);

  if (!isOpen) return null;

  const handleTestKie = async () => {
    if (!form.kieApiKey) {
      setKieTestStatus({ loading: false, success: false, msg: 'Please enter a KIE API key first.' });
      return;
    }
    setKieTestStatus({ loading: true });
    try {
      const res = await testKieApi(form.kieApiKey, form.kieApiEndpoint);
      setKieTestStatus({ loading: false, success: res.success, msg: res.message });
    } catch (e: any) {
      setKieTestStatus({ loading: false, success: false, msg: e.message || 'Connection failed' });
    }
  };

  const handleTestSupabase = async () => {
    if (!form.supabaseUrl || !form.supabaseAnonKey) {
      setSupabaseTestStatus({
        loading: false,
        success: false,
        msg: 'Please provide both Supabase URL and Anon Key.',
      });
      return;
    }
    setSupabaseTestStatus({ loading: true });
    try {
      const res = await testSupabase(form.supabaseUrl, form.supabaseAnonKey);
      setSupabaseTestStatus({ loading: false, success: res.success, msg: res.message });
    } catch (e: any) {
      setSupabaseTestStatus({ loading: false, success: false, msg: e.message || 'Connection failed' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      onClose();
    }, 800);
  };

  // Export all songs as JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(songs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai_music_studio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportSongs(parsed);
          alert(`Successfully imported ${parsed.length} songs into your personal library!`);
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#10121a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#141622]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Personal Settings</h3>
              <p className="text-xs text-slate-400">
                Configure your AI generation engine, API keys, defaults, and storage
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

        {/* Settings Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. AI MUSIC GENERATOR API CONFIGURATION */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> AI Music API Configuration
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                Personal Use Only
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                KIE AI / Suno API Key (Optional)
              </label>
              <input
                type="password"
                value={form.kieApiKey || ''}
                onChange={(e) => setForm({ ...form, kieApiKey: e.target.value })}
                placeholder="Enter KIE API Key if using external Suno API..."
                className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If left blank, the app uses the built-in high-fidelity Harmonic Studio Synthesizer engine with vocal formants.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom API Endpoint (Optional)
              </label>
              <input
                type="text"
                value={form.kieApiEndpoint || ''}
                onChange={(e) => setForm({ ...form, kieApiEndpoint: e.target.value })}
                placeholder="https://api.kie.ai/api/v1/generate"
                className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestKie}
                disabled={kieTestStatus.loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 flex items-center gap-1.5 transition-colors"
              >
                {kieTestStatus.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Test KIE API Key
              </button>

              {kieTestStatus.msg && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    kieTestStatus.success ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {kieTestStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {kieTestStatus.msg}
                </span>
              )}
            </div>
          </div>

          {/* 2. SUPABASE DATABASE & CLOUD STORAGE */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Supabase Database & Cloud Storage
            </h4>
            <p className="text-xs text-slate-400">
              Connect your personal Supabase project to sync song metadata, lyrics, and audio history.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={form.supabaseUrl || ''}
                  onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={form.supabaseAnonKey || ''}
                  onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={supabaseTestStatus.loading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5 transition-colors"
              >
                {supabaseTestStatus.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                Test Supabase
              </button>

              {supabaseTestStatus.msg && (
                <span
                  className={`text-xs flex items-center gap-1 ${
                    supabaseTestStatus.success ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {supabaseTestStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {supabaseTestStatus.msg}
                </span>
              )}
            </div>
          </div>

          {/* 3. DEFAULT PREFERENCES */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Studio Defaults
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Language
                </label>
                <select
                  value={form.defaultLanguage}
                  onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value as Language })}
                  className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Voice
                </label>
                <select
                  value={form.defaultVoice}
                  onChange={(e) => setForm({ ...form, defaultVoice: e.target.value as VoiceGender })}
                  className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="male">Male Vocals</option>
                  <option value="female">Female Vocals</option>
                  <option value="duet">Duet Vocals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Audio Quality
                </label>
                <select
                  value={form.audioQuality}
                  onChange={(e) => setForm({ ...form, audioQuality: e.target.value as any })}
                  className="w-full bg-[#0a0c12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="320kbps">320 kbps (High Fidelity)</option>
                  <option value="192kbps">192 kbps (Standard MP3)</option>
                  <option value="lossless-wav">44.1kHz Lossless Master</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. STORAGE & BACKUP MANAGEMENT */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Storage & Song Library ({songs.length} Tracks)
            </h4>
            <p className="text-xs text-slate-400">
              Manage your local storage, export full backups with all metadata, or restore previous sessions.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON Backup
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import Backup
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all songs from your library? This cannot be undone.')) {
                    onClearLibrary();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Library
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              {saveFeedback ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <CheckCircle2 className="w-4 h-4" />}
              {saveFeedback ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
