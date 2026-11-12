import { Song, GenerationParams } from '../types/music';

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch('/api/songs');
  if (!res.ok) throw new Error('Failed to fetch songs from library');
  const data = await res.json();
  return data.songs || [];
}

export async function generateLyrics(params: {
  topic: string;
  genre: string;
  language: string;
  mood: string;
  voiceGender: string;
  voiceStyle: string;
  isInstrumental: boolean;
}): Promise<{
  title: string;
  lyrics: string;
  styleDescription: string;
  suggestedBpm: number;
  tags: string[];
}> {
  const res = await fetch('/api/lyrics/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate lyrics');
  }
  return res.json();
}

export async function enhancePrompt(params: {
  genre: string;
  mood: string;
  voiceStyle: string;
}): Promise<string> {
  const res = await fetch('/api/prompt/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to enhance prompt');
  const data = await res.json();
  return data.enhancedPrompt;
}

export async function generateMusic(
  params: GenerationParams,
  settings: {
    kieApiKey?: string;
    kieApiEndpoint?: string;
    activeProvider?: string;
  }
): Promise<Song[]> {
  const res = await fetch('/api/music/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      kieApiKey: settings.kieApiKey,
      kieApiEndpoint: settings.kieApiEndpoint,
      provider: settings.activeProvider || 'auto',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Music generation failed');
  }

  const data = await res.json();
  return data.songs || [];
}

export async function extendSong(params: {
  songId: string;
  continuationLyrics: string;
  continuationStyle: string;
  fromSeconds?: number;
}): Promise<Song> {
  const res = await fetch('/api/music/extend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to extend song');
  }
  const data = await res.json();
  return data.song;
}

export async function toggleSongFavorite(id: string): Promise<boolean> {
  const res = await fetch(`/api/songs/favorite/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to update favorite status');
  const data = await res.json();
  return data.isFavorite;
}

export async function deleteSong(id: string): Promise<void> {
  const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete song');
}

export async function testKieApi(apiKey: string, endpoint?: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/settings/test-kie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, endpoint }),
  });
  return res.json();
}

export async function testSupabase(supabaseUrl: string, supabaseAnonKey: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/settings/test-supabase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supabaseUrl, supabaseAnonKey }),
  });
  return res.json();
}
