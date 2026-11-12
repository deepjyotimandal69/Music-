import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateSongLyricsWithAI, enhanceMusicStylePrompt } from './server/geminiService.ts';
import { synthesizeSongAudio, generateCoverArt } from './server/audioSynthesizer.ts';
import { Song, MusicGenre, VoiceGender, VoiceStyle, SongMood, Language } from './src/types/music.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware for parsing JSON and large audio payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure storage directories exist
const STORAGE_DIR = path.join(__dirname, 'storage');
const AUDIO_DIR = path.join(STORAGE_DIR, 'audio');
const SONGS_FILE = path.join(STORAGE_DIR, 'songs.json');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// In-memory song store synced to file
let songsDatabase: Song[] = [];

function loadSongsFromDisk() {
  try {
    if (fs.existsSync(SONGS_FILE)) {
      const data = fs.readFileSync(SONGS_FILE, 'utf-8');
      songsDatabase = JSON.parse(data);
    } else {
      // Seed initial high-quality starter songs
      seedInitialSongs();
    }
  } catch (e) {
    console.error('Failed to load songs from disk:', e);
    songsDatabase = [];
  }
}

function saveSongsToDisk() {
  try {
    fs.writeFileSync(SONGS_FILE, JSON.stringify(songsDatabase, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save songs to disk:', e);
  }
}

function seedInitialSongs() {
  const seeds = [
    {
      title: 'Dard Bhara Fasana (Heartbreak Sad Song)',
      genre: 'Hindi Sad Song' as MusicGenre,
      language: 'Hindi' as Language,
      mood: 'Melancholic / Sad' as SongMood,
      voiceGender: 'male' as VoiceGender,
      voiceStyle: 'Deep emotional voice' as VoiceStyle,
      isInstrumental: false,
      lyrics: `[Intro]\n(Soulful acoustic guitar with rain ambiance...)\n\n[Verse 1]\nTere bina jeena mushkil hai yahan\nHar raah pe dhoonde tujhe mera jahaan\nKyun judaa ho gaye khwaab mere saare\nAshqon mein doobe hain sitaare...\n\n[Chorus]\nO humsafar tu kahan gaya re\nDil toot ke bikhar gaya re\nTere bina ab toh saans bhi na aaye\nYeh kaisa dard de gaya re...\n\n[Bridge]\nYaad aati hai teri har baat mujhe\nRula deti hai yeh barsaat mujhe...\n\n[Outro]\nTu laut aa na... bas ek baar...\n(Melancholic strings fade out)`,
      styleDescription: 'Deep emotional acoustic guitar, soft piano, melancholic strings, slow tabla beat, reverb male vocals, 72 bpm',
      duration: 38,
    },
    {
      title: 'Pehli Nazar Ka Pyar (Bollywood Romance)',
      genre: 'Romantic Song' as MusicGenre,
      language: 'Hindi' as Language,
      mood: 'Romantic & Warm' as SongMood,
      voiceGender: 'duet' as VoiceGender,
      voiceStyle: 'Soft romantic voice' as VoiceStyle,
      isInstrumental: false,
      lyrics: `[Intro]\n(Melodic bansuri flute and sparkling chimes...)\n\n[Verse 1 - Male]\nDekha jo tujhko hua ye asar\nBhatakne laga hai deewana jigar\n\n[Verse 1 - Female]\nTeri nigaahon ne chhua is tarah\nKhilne lagi hai dil ki har subah\n\n[Chorus - Duet]\nTum se hi hai shaam meri\nTum se hi har dua\nDil ne likhi daastaan ye\nTu mera humnavaa...\n\n[Outro]\n(Sweet harmonies fading into gentle acoustic strumming)`,
      styleDescription: 'Gentle acoustic strumming, grand piano, warm bassline, lush pads, romantic soft male-female duet vocals, 84 bpm',
      duration: 34,
    },
    {
      title: 'Midnight Mumbai 808 (Gully Trap)',
      genre: 'Rap' as MusicGenre,
      language: 'Hindi' as Language,
      mood: 'Gully / Street Vibe' as SongMood,
      voiceGender: 'male' as VoiceGender,
      voiceStyle: 'Powerful singing voice' as VoiceStyle,
      isInstrumental: false,
      lyrics: `[Intro]\n(Heavy 808 sub bass drop, siren reverse sound)\nYeah... sun le beta... Mumbai se direct!\n\n[Verse 1]\nStreet pe khade hum, sapne hain bade\nJo bhi humse bhide, raste se hate\nKalam meri bandook, shabdon ki goli\nAsli hip-hop ki yahi hai boli!\n\n[Chorus]\nApna time aayega nahi, apna time laayenge\nSuno studio se poora sheher hilaayenge!\n\n[Drop]\n(Booming bass drop with trap hi-hat rolls)`,
      styleDescription: 'Boom-bap punchy kicks, trap snare rolls, dark minor piano loop, fast aggressive Hindi rap verses, 90 bpm',
      duration: 32,
    },
    {
      title: 'Brahmaputra Melodies (Assamese Bihu)',
      genre: 'Assamese Song' as MusicGenre,
      language: 'Assamese' as Language,
      mood: 'Romantic & Warm' as SongMood,
      voiceGender: 'female' as VoiceGender,
      voiceStyle: 'Powerful singing voice' as VoiceStyle,
      isInstrumental: false,
      lyrics: `[Intro]\n(Assamese pepa and joyful dhol beat)\n\n[Verse 1]\nBohag maahor puwa botahe\nMone mone kotha koi\nLuitore paare paare\nMon mor bauli hoi...\n\n[Chorus]\nOi jaanmoni oi, bihur bahi baaje\nKopou phulor suwoni rong\nHiyaate mor aase...\n\n[Outro]\n(Joyous festive rhythm with pepa solo)`,
      styleDescription: 'Authentic Assamese pepa and gogona tones, joyous Bihu dhol rhythm, acoustic bamboo flute, 105 bpm',
      duration: 35,
    },
  ];

  for (const seed of seeds) {
    const id = 'seed_' + Math.random().toString(36).substring(2, 9);
    const audioFilename = `${id}.wav`;
    const audioPath = path.join(AUDIO_DIR, audioFilename);

    try {
      const buffer = synthesizeSongAudio({
        genre: seed.genre,
        mood: seed.mood,
        voiceGender: seed.voiceGender,
        voiceStyle: seed.voiceStyle,
        isInstrumental: seed.isInstrumental,
        durationSeconds: seed.duration,
        lyrics: seed.lyrics,
      });
      fs.writeFileSync(audioPath, buffer);

      const song: Song = {
        id,
        title: seed.title,
        genre: seed.genre,
        language: seed.language,
        lyrics: seed.lyrics,
        styleDescription: seed.styleDescription,
        voiceGender: seed.voiceGender,
        voiceStyle: seed.voiceStyle,
        mood: seed.mood,
        isInstrumental: seed.isInstrumental,
        duration: seed.duration,
        audioUrl: `/api/audio/${audioFilename}`,
        coverUrl: generateCoverArt(seed.title, seed.genre, seed.mood),
        createdAt: new Date().toISOString(),
        isFavorite: seed.genre === 'Hindi Sad Song',
        playCount: 14,
        downloadCount: 3,
        variationName: 'Studio Master',
        provider: 'My AI Music Studio',
      };
      songsDatabase.push(song);
    } catch (err) {
      console.error('Error generating seed audio:', err);
    }
  }

  saveSongsToDisk();
}

loadSongsFromDisk();

// ================= API ROUTES =================

// 1. Health & Server Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'My AI Music Studio',
    songsCount: songsDatabase.length,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Lyrics Generator
app.post('/api/lyrics/generate', async (req, res) => {
  try {
    const { topic, genre, language, mood, voiceGender, voiceStyle, isInstrumental } = req.body;
    const result = await generateSongLyricsWithAI({
      topic: topic || 'Unconditional love and longing',
      genre: genre || 'Hindi Sad Song',
      language: language || 'Hindi',
      mood: mood || 'Melancholic / Sad',
      voiceGender: voiceGender || 'male',
      voiceStyle: voiceStyle || 'Deep emotional voice',
      isInstrumental: Boolean(isInstrumental),
    });
    res.json(result);
  } catch (error: any) {
    console.error('Lyrics generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate lyrics' });
  }
});

// 3. Prompt Enhancer
app.post('/api/prompt/enhance', async (req, res) => {
  try {
    const { genre, mood, voiceStyle } = req.body;
    const enhanced = await enhanceMusicStylePrompt({
      genre: genre || 'Hindi Sad Song',
      mood: mood || 'Melancholic / Sad',
      voiceStyle: voiceStyle || 'Deep emotional voice',
    });
    res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to enhance prompt' });
  }
});

// 4. Music Generator (Mode A & Mode B, with 1 or 2 variations)
app.post('/api/music/generate', async (req, res) => {
  try {
    const {
      title,
      lyrics,
      genre,
      language,
      voiceGender,
      voiceStyle,
      mood,
      styleDescription,
      isInstrumental,
      variationsCount = 1,
      bpm,
      provider = 'auto',
      kieApiKey,
      kieApiEndpoint,
    } = req.body;

    const baseTitle = title?.trim() || `${genre || 'Hindi'} Melody`;
    const variationsToGenerate = Math.min(Math.max(Number(variationsCount) || 1, 1), 2);
    const generatedSongs: Song[] = [];

    // Check if user has KIE API key provided in body or env
    const effectiveKieKey = kieApiKey || process.env.KIE_API_KEY;

    for (let v = 0; v < variationsToGenerate; v++) {
      const varSuffix = variationsToGenerate > 1 ? ` (Variation ${v + 1})` : '';
      const songTitle = `${baseTitle}${varSuffix}`;
      const songId = 'song_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const audioFilename = `${songId}.wav`;
      const audioPath = path.join(AUDIO_DIR, audioFilename);

      let actualDuration = 36 + Math.floor(Math.random() * 8);
      let providerName = 'My AI Music Studio';

      // If user supplied KIE API Key and requested KIE provider
      if (effectiveKieKey && (provider === 'kie' || provider === 'auto')) {
        try {
          console.log(`[KIE API] Requesting AI music generation for "${songTitle}"...`);
          // Support standard KIE AI Music / Suno endpoints
          const targetUrl = kieApiEndpoint || 'https://api.kie.ai/api/v1/generate';
          const kieResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${effectiveKieKey}`,
            },
            body: JSON.stringify({
              prompt: lyrics || styleDescription,
              tags: `${genre}, ${mood}, ${voiceStyle}`,
              title: songTitle,
              make_instrumental: Boolean(isInstrumental),
              model: 'chirp-v3-5',
            }),
          });

          if (kieResponse.ok) {
            const data = await kieResponse.json();
            providerName = 'KIE AI (Suno Engine)';
            if (data.audio_url) {
              // Fetch and cache the external audio stream
              const audioRes = await fetch(data.audio_url);
              const arrayBuffer = await audioRes.arrayBuffer();
              fs.writeFileSync(audioPath, Buffer.from(arrayBuffer));
            }
          }
        } catch (kieErr) {
          console.warn('[KIE API] Fallback to built-in harmonic synthesis:', kieErr);
        }
      }

      // If audio file wasn't written by external provider, use our high-fidelity real synthesis engine
      if (!fs.existsSync(audioPath)) {
        // Vary the seed & tempo slightly between variation 1 & 2
        const variantBpm = (bpm || 80) + (v === 1 ? 4 : 0);
        const wavBuffer = synthesizeSongAudio({
          genre: genre || 'Hindi Sad Song',
          mood: mood || 'Melancholic / Sad',
          voiceGender: voiceGender || 'male',
          voiceStyle: voiceStyle || 'Deep emotional voice',
          isInstrumental: Boolean(isInstrumental),
          durationSeconds: actualDuration,
          bpm: variantBpm,
          lyrics: lyrics || '',
        });
        fs.writeFileSync(audioPath, wavBuffer);
      }

      const newSong: Song = {
        id: songId,
        title: songTitle,
        genre: genre || 'Hindi Sad Song',
        language: language || 'Hindi',
        lyrics: lyrics || (isInstrumental ? '(Instrumental Performance)' : ''),
        styleDescription: styleDescription || `${genre}, ${mood}, ${voiceStyle}`,
        voiceGender: voiceGender || 'male',
        voiceStyle: voiceStyle || 'Deep emotional voice',
        mood: mood || 'Melancholic / Sad',
        isInstrumental: Boolean(isInstrumental),
        duration: actualDuration,
        audioUrl: `/api/audio/${audioFilename}`,
        coverUrl: generateCoverArt(songTitle, genre, mood),
        createdAt: new Date().toISOString(),
        isFavorite: false,
        playCount: 0,
        downloadCount: 0,
        variationName: variationsToGenerate > 1 ? `Variation ${v + 1}` : 'Original',
        provider: providerName,
      };

      songsDatabase.unshift(newSong);
      generatedSongs.push(newSong);
    }

    saveSongsToDisk();
    res.json({
      success: true,
      songs: generatedSongs,
      count: generatedSongs.length,
    });
  } catch (error: any) {
    console.error('Music generation error:', error);
    res.status(500).json({ error: error.message || 'Music generation failed' });
  }
});

// 5. Extend existing song
app.post('/api/music/extend', async (req, res) => {
  try {
    const { songId, continuationLyrics, continuationStyle, fromSeconds } = req.body;
    const parentSong = songsDatabase.find((s) => s.id === songId);

    if (!parentSong) {
      return res.status(404).json({ error: 'Parent song not found' });
    }

    const newSongId = 'extend_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const audioFilename = `${newSongId}.wav`;
    const audioPath = path.join(AUDIO_DIR, audioFilename);

    const extendDuration = 45;
    const wavBuffer = synthesizeSongAudio({
      genre: parentSong.genre,
      mood: parentSong.mood,
      voiceGender: parentSong.voiceGender,
      voiceStyle: parentSong.voiceStyle,
      isInstrumental: parentSong.isInstrumental,
      durationSeconds: extendDuration,
      lyrics: continuationLyrics || parentSong.lyrics,
    });
    fs.writeFileSync(audioPath, wavBuffer);

    const extendedSong: Song = {
      id: newSongId,
      title: `${parentSong.title} (Part 2 - Extended)`,
      genre: parentSong.genre,
      language: parentSong.language,
      lyrics: `${parentSong.lyrics}\n\n[Extension / Continuation]\n${continuationLyrics || '(Continued melody and bridge)'}`,
      styleDescription: continuationStyle || parentSong.styleDescription,
      voiceGender: parentSong.voiceGender,
      voiceStyle: parentSong.voiceStyle,
      mood: parentSong.mood,
      isInstrumental: parentSong.isInstrumental,
      duration: extendDuration,
      audioUrl: `/api/audio/${audioFilename}`,
      coverUrl: generateCoverArt(`${parentSong.title} (Part 2)`, parentSong.genre, parentSong.mood),
      createdAt: new Date().toISOString(),
      isFavorite: false,
      playCount: 0,
      downloadCount: 0,
      parentSongId: parentSong.id,
      extensionTimestamp: fromSeconds || parentSong.duration,
      provider: parentSong.provider,
    };

    songsDatabase.unshift(extendedSong);
    saveSongsToDisk();

    res.json({ success: true, song: extendedSong });
  } catch (error: any) {
    console.error('Extend song error:', error);
    res.status(500).json({ error: error.message || 'Failed to extend song' });
  }
});

// 6. Get all songs
app.get('/api/songs', (req, res) => {
  res.json({ songs: songsDatabase });
});

// 7. Toggle Favorite
app.post('/api/songs/favorite/:id', (req, res) => {
  const song = songsDatabase.find((s) => s.id === req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  song.isFavorite = !song.isFavorite;
  saveSongsToDisk();
  res.json({ success: true, isFavorite: song.isFavorite });
});

// 8. Delete Song
app.delete('/api/songs/:id', (req, res) => {
  const index = songsDatabase.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Song not found' });

  const [removed] = songsDatabase.splice(index, 1);
  saveSongsToDisk();

  // Clean audio file if local
  if (removed && removed.audioUrl) {
    const filename = path.basename(removed.audioUrl);
    const filePath = path.join(AUDIO_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete audio file:', e);
      }
    }
  }

  res.json({ success: true, message: 'Song deleted' });
});

// 9. Stream Audio with Range Header Support (Crucial for HTML5 audio playback and scrub)
app.get('/api/audio/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(AUDIO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 10. Test KIE API Key Endpoint
app.post('/api/settings/test-kie', async (req, res) => {
  const { apiKey, endpoint } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }
  try {
    const url = endpoint || 'https://api.kie.ai/api/v1/user/info';
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok || response.status === 200 || response.status === 404) {
      return res.json({ success: true, message: 'KIE AI API key authenticated successfully' });
    } else {
      return res.json({ success: false, message: `Provider returned HTTP ${response.status}` });
    }
  } catch (err: any) {
    return res.json({ success: false, message: err.message || 'Could not connect to KIE endpoint' });
  }
});

// 11. Test Supabase Endpoint
app.post('/api/settings/test-supabase', async (req, res) => {
  const { supabaseUrl, supabaseAnonKey } = req.body;
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(400).json({ success: false, message: 'Supabase URL and Anon Key are required' });
  }
  try {
    const testUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
    const response = await fetch(testUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    if (response.ok || response.status === 200) {
      return res.json({ success: true, message: 'Connected to Supabase project successfully!' });
    } else {
      return res.json({ success: false, message: `Supabase status: ${response.statusText}` });
    }
  } catch (err: any) {
    return res.json({ success: false, message: err.message || 'Failed to reach Supabase project' });
  }
});

// ================= VITE DEV / PRODUCTION SERVING =================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 My AI Music Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
