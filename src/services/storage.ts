import { AppSettings } from '../types/music';

const SETTINGS_KEY = 'ai_music_studio_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultLanguage: 'Hindi',
  defaultVoice: 'male',
  defaultVoiceStyle: 'Deep emotional voice',
  defaultGenre: 'Hindi Sad Song',
  audioQuality: '320kbps',
  activeProvider: 'auto',
  autoPlayNext: true,
  showVisualizer: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
