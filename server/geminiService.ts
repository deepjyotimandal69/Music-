import { GoogleGenAI, Type } from '@google/genai';

// Initialize server-side Gemini client per skill instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface GeneratedLyricsResult {
  title: string;
  lyrics: string;
  styleDescription: string;
  suggestedGenre: string;
  suggestedBpm: number;
  tags: string[];
}

/**
 * Generate original song lyrics with structured musical tags like [Intro], [Verse 1], [Chorus]
 * tailored specifically for Hindi, Urdu, Punjabi, Bengali, Assamese, or English songs.
 */
export async function generateSongLyricsWithAI(params: {
  topic: string;
  genre: string;
  language: string;
  mood: string;
  voiceGender: string;
  voiceStyle: string;
  isInstrumental: boolean;
}): Promise<GeneratedLyricsResult> {
  const { topic, genre, language, mood, voiceGender, voiceStyle, isInstrumental } = params;

  if (isInstrumental) {
    return {
      title: `${topic || genre} (Instrumental Theme)`,
      lyrics: `[Intro]\n(Melodic acoustic buildup)\n\n[Theme 1 - Main Riff]\n(Emotive instruments take lead)\n\n[Theme 2 - Crescendo]\n(Full orchestration, rhythm swells)\n\n[Guitar / Bansuri Solo]\n(Improvisation with dynamic reverb)\n\n[Outro]\n(Gentle fading harmonics)`,
      styleDescription: `${genre}, ${mood}, pure instrumental composition with rich melodic instruments, ambient reverb, 82 bpm`,
      suggestedGenre: genre,
      suggestedBpm: 82,
      tags: ['instrumental', genre.toLowerCase(), mood.toLowerCase()],
    };
  }

  const prompt = `You are a legendary Suno AI song producer and Bollywood/Indian music lyricist.
Task: Write authentic, deeply poetic, rhyming lyrics for a new song.

Parameters:
- Topic / Concept: ${topic || 'Love, longing and rain'}
- Music Genre: ${genre} (e.g. Hindi Sad Song, Romantic Song, DJ Music, Desi Rap, Punjabi Song, Assamese Song, etc.)
- Language: ${language} (Write authentic lyrics in this language. If Hindi, write in Roman Hindi / Hinglish and Devanagari mix so it is easy to read and sing, e.g. "Tum bin jiya jaye kaise...").
- Mood: ${mood}
- Voice: ${voiceGender} (${voiceStyle})

Requirements:
1. Provide a catchy, memorable Song Title.
2. Structure the lyrics with clear Suno-style song section headers:
   [Intro]
   [Verse 1]
   [Pre-Chorus]
   [Chorus]
   [Verse 2]
   [Chorus]
   [Bridge]
   [Outro]
3. Make sure the rhyming meter and emotional cadence match the genre (e.g., if Hindi Sad Song, make it deeply emotional like Arijit Singh / Mithoon / Pritam; if DJ/Rap, make it punchy and rhythmic; if Punjabi, use energetic infectious phrases; if Devotional, make it serene and spiritual).
4. Provide a rich Suno-style music style prompt (e.g., "Deep acoustic guitar, warm cello, melancholic strings, soft reverb male vocals, 72 bpm, heartbreak feel").
5. Provide suggested BPM and 3-5 tags.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The title of the song',
            },
            lyrics: {
              type: Type.STRING,
              description: 'The complete song lyrics formatted with section tags like [Verse 1], [Chorus], etc.',
            },
            styleDescription: {
              type: Type.STRING,
              description: 'Detailed music production style prompt, instruments, tempo and vocal character',
            },
            suggestedBpm: {
              type: Type.INTEGER,
              description: 'Suggested beats per minute (e.g. 70 to 135)',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tags for music style and mood',
            },
          },
          required: ['title', 'lyrics', 'styleDescription'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    return {
      title: parsed.title || `${genre} Anthem`,
      lyrics: parsed.lyrics || `[Verse 1]\nTere bina jeena mushkil hai yahan...\n\n[Chorus]\nTu hi mera jahaan, tu hi meri subah...`,
      styleDescription: parsed.styleDescription || `${genre}, ${mood}, ${voiceStyle}, 80 bpm`,
      suggestedGenre: genre,
      suggestedBpm: parsed.suggestedBpm || 80,
      tags: parsed.tags || [genre, mood, language],
    };
  } catch (error: any) {
    console.error('Error generating lyrics with Gemini:', error);
    // Fallback poetic lyrics if offline/quota
    return {
      title: `${language} ${genre} - Suno Vibes`,
      lyrics: `[Intro]\n(Acoustic guitar strums softly with ambient rain...)\n\n[Verse 1]\nRaatein adhuri si hain, baatein adhuri si\nTere bina har khushi lagti hai dhoori si\nKyun chhod gaye humein is mod par tanha\nDil ro raha hai, yaadein hain gehri si...\n\n[Chorus]\nO mere humsafar, tu kahan chala gaya\nYeh dard-e-dil mera tu kyun na samajh saka\nO mere humsafar, tu kahan chala gaya...\n\n[Bridge]\nAb toh hawaayein bhi tera naam leti hain\nHar aah meri bas tera paigaam leti hai\n\n[Outro]\nTu laut aa... bas ek dafa...\n(Gentle fading outro)`,
      styleDescription: `${genre}, ${mood}, ${voiceStyle}, emotive strings and grand piano, 74 bpm`,
      suggestedGenre: genre,
      suggestedBpm: 74,
      tags: [genre, mood, language, 'suno-style'],
    };
  }
}

/**
 * Enhance or rewrite music style prompt to Suno AI standard tags
 */
export async function enhanceMusicStylePrompt(params: {
  genre: string;
  mood: string;
  instruments?: string;
  voiceStyle: string;
}): Promise<string> {
  try {
    const prompt = `Write a high-precision, comma-separated Suno AI style prompt for a ${params.genre} with mood '${params.mood}' and voice '${params.voiceStyle}'. Include instruments, production texture, tempo (BPM), and vocal mix characteristics. Max 120 words. No explanations, just the prompt string.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text?.trim() || `${params.genre}, ${params.mood}, ${params.voiceStyle}, high fidelity studio mastering`;
  } catch (e) {
    return `${params.genre}, ${params.mood}, ${params.voiceStyle}, rich acoustic accompaniment, 80 bpm`;
  }
}
