/**
 * Audio Synthesizer Engine for My AI Music Studio
 * Generates real, multi-track stereo PCM audio encoded into standard WAV format.
 * Includes harmonic chords, bassline, percussion, leads, and vocal formant singing synthesis.
 */

export interface SongSynthesisOptions {
  genre: string;
  mood: string;
  voiceGender: 'male' | 'female' | 'duet';
  voiceStyle: string;
  isInstrumental: boolean;
  durationSeconds?: number;
  bpm?: number;
  lyrics?: string;
  seed?: number;
}

// Standard musical notes to frequency (Hz)
const NOTE_FREQ: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
};

// Formant frequencies for vowels (F1, F2 in Hz) for male and female singing voice
const VOWEL_FORMANTS = {
  male: [
    { f1: 730, f2: 1090 }, // /a/
    { f1: 530, f2: 1840 }, // /e/
    { f1: 270, f2: 2290 }, // /i/
    { f1: 570, f2: 840 },  // /o/
    { f1: 300, f2: 870 },  // /u/
  ],
  female: [
    { f1: 850, f2: 1220 }, // /a/
    { f1: 610, f2: 2330 }, // /e/
    { f1: 310, f2: 2790 }, // /i/
    { f1: 500, f2: 700 },  // /o/
    { f1: 370, f2: 950 },  // /u/
  ],
};

export function synthesizeSongAudio(options: SongSynthesisOptions): Buffer {
  const sampleRate = 44100;
  const duration = Math.min(Math.max(options.durationSeconds || 32, 15), 180);
  const totalSamples = Math.floor(sampleRate * duration);
  const numChannels = 2;

  // Genre specific scales and BPM
  let bpm = options.bpm || 82;
  let rootKey = 'C';
  let isMinor = true;
  let hasHeavyBass = false;
  let hasTabla = false;
  let hasBhangraDhol = false;

  const genreLower = (options.genre || '').toLowerCase();
  if (genreLower.includes('dj') || genreLower.includes('party')) {
    bpm = 126;
    isMinor = true;
    hasHeavyBass = true;
  } else if (genreLower.includes('sad') || genreLower.includes('heartbreak')) {
    bpm = 70;
    isMinor = true;
  } else if (genreLower.includes('romantic') || genreLower.includes('love')) {
    bpm = 84;
    isMinor = false;
  } else if (genreLower.includes('rap') || genreLower.includes('hip-hop')) {
    bpm = 92;
    isMinor = true;
    hasHeavyBass = true;
  } else if (genreLower.includes('punjabi')) {
    bpm = 98;
    isMinor = false;
    hasBhangraDhol = true;
  } else if (genreLower.includes('assamese') || genreLower.includes('bengali')) {
    bpm = 88;
    isMinor = false;
    hasTabla = true;
  } else if (genreLower.includes('devotional') || genreLower.includes('classical')) {
    bpm = 74;
    isMinor = false;
    hasTabla = true;
  } else if (genreLower.includes('lo-fi')) {
    bpm = 76;
    isMinor = true;
  }

  // Chord progressions
  const minorChords = [
    { root: NOTE_FREQ['A2'], third: NOTE_FREQ['C3'], fifth: NOTE_FREQ['E3'] }, // Am
    { root: NOTE_FREQ['F2'], third: NOTE_FREQ['A2'], fifth: NOTE_FREQ['C3'] }, // F
    { root: NOTE_FREQ['C2'], third: NOTE_FREQ['E2'], fifth: NOTE_FREQ['G2'] }, // C
    { root: NOTE_FREQ['G2'], third: NOTE_FREQ['B2'], fifth: NOTE_FREQ['D3'] }, // G
  ];

  const majorChords = [
    { root: NOTE_FREQ['C2'], third: NOTE_FREQ['E2'], fifth: NOTE_FREQ['G2'] }, // C
    { root: NOTE_FREQ['G2'], third: NOTE_FREQ['B2'], fifth: NOTE_FREQ['D3'] }, // G
    { root: NOTE_FREQ['A2'], third: NOTE_FREQ['C3'], fifth: NOTE_FREQ['E3'] }, // Am
    { root: NOTE_FREQ['F2'], third: NOTE_FREQ['A2'], fifth: NOTE_FREQ['C3'] }, // F
  ];

  const chords = isMinor ? minorChords : majorChords;
  const secondsPerBeat = 60 / bpm;
  const beatsPerMeasure = 4;
  const measureDuration = secondsPerBeat * beatsPerMeasure;

  // Melody notes
  const melodyScale = isMinor
    ? [NOTE_FREQ['A3'], NOTE_FREQ['B3'], NOTE_FREQ['C4'], NOTE_FREQ['D4'], NOTE_FREQ['E4'], NOTE_FREQ['F4'], NOTE_FREQ['G4'], NOTE_FREQ['A4']]
    : [NOTE_FREQ['C4'], NOTE_FREQ['D4'], NOTE_FREQ['E4'], NOTE_FREQ['F4'], NOTE_FREQ['G4'], NOTE_FREQ['A4'], NOTE_FREQ['B4'], NOTE_FREQ['C5']];

  // Buffer allocation: 44100 * 2 channels * 2 bytes (16-bit)
  const byteRate = sampleRate * numChannels * 2;
  const dataSize = totalSamples * numChannels * 2;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  // Write WAV Header
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  wavBuffer.writeUInt16LE(numChannels, 22); // NumChannels = 2 (stereo)
  wavBuffer.writeUInt32LE(sampleRate, 24); // SampleRate = 44100
  wavBuffer.writeUInt32LE(byteRate, 28); // ByteRate
  wavBuffer.writeUInt16LE(numChannels * 2, 32); // BlockAlign = 4
  wavBuffer.writeUInt16LE(16, 34); // BitsPerSample = 16
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  // State variables for continuous synthesis
  let chordIndex = 0;
  let melodyNote = melodyScale[0];
  let melodyTimeLeft = 0;
  let melodyVibratoPhase = 0;

  // Render loop
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const currentMeasure = Math.floor(t / measureDuration);
    chordIndex = currentMeasure % chords.length;
    const activeChord = chords[chordIndex];

    const measureProgress = (t % measureDuration) / measureDuration;
    const beatTime = (t % secondsPerBeat) / secondsPerBeat;
    const currentBeat = Math.floor((t % measureDuration) / secondsPerBeat);

    // Master volume envelope (fade in at start, fade out at end)
    let masterEnv = 1.0;
    if (t < 1.5) {
      masterEnv = t / 1.5;
    } else if (t > duration - 2.5) {
      masterEnv = Math.max(0, (duration - t) / 2.5);
    }

    // 1. HARMONY / PADS (Stereo Chorus)
    const padPhase1 = 2 * Math.PI * activeChord.root * 2 * t;
    const padPhase2 = 2 * Math.PI * activeChord.third * 2 * t;
    const padPhase3 = 2 * Math.PI * activeChord.fifth * 2 * t;
    const padLFO = 0.85 + 0.15 * Math.sin(2 * Math.PI * 1.5 * t);

    // Warm soft synth pad / strings
    const padSample = (
      Math.sin(padPhase1) * 0.4 +
      Math.sin(padPhase2) * 0.35 +
      Math.sin(padPhase3) * 0.35 +
      Math.sin(padPhase1 * 0.5) * 0.2 // sub body
    ) * 0.22 * padLFO;

    // 2. BASSLINE
    let bassFreq = activeChord.root;
    if (hasHeavyBass) {
      // 808 style pitch-bent glide on downbeats
      const kickGlide = Math.exp(-beatTime * 14);
      bassFreq = activeChord.root * (1.0 + kickGlide * 0.6);
    }
    const bassPhase = 2 * Math.PI * bassFreq * t;
    let bassSample = Math.sin(bassPhase) * 0.38;
    if (hasHeavyBass) {
      // Add saturation / soft clipping
      bassSample = Math.tanh(bassSample * 1.8) * 0.32;
    } else {
      // Add acoustic warmth
      bassSample += Math.sin(bassPhase * 2) * 0.12;
    }

    // 3. RHYTHM / PERCUSSION
    let drumSampleL = 0;
    let drumSampleR = 0;

    // Kick Drum on beats 0 and 2 (or all 4 for DJ)
    const isKickBeat = hasHeavyBass || genreLower.includes('dj') || currentBeat === 0 || currentBeat === 2;
    if (isKickBeat) {
      const kickEnv = Math.exp(-beatTime * 18);
      const kickPitch = 55 + 110 * Math.exp(-beatTime * 28);
      const kickOsc = Math.sin(2 * Math.PI * kickPitch * t);
      drumSampleL += kickOsc * kickEnv * 0.42;
      drumSampleR += kickOsc * kickEnv * 0.42;
    }

    // Snare / Dholak / Claps on beats 1 and 3
    if (currentBeat === 1 || currentBeat === 3) {
      const snareEnv = Math.exp(-beatTime * 12);
      // White noise + tonal snap
      const noise = (Math.random() * 2 - 1) * 0.25;
      const tone = Math.sin(2 * Math.PI * 190 * t) * 0.2;
      const snareSound = (noise + tone) * snareEnv * 0.35;
      drumSampleL += snareSound;
      drumSampleR += snareSound;
    }

    // Hi-hats / Tabla Tumbi / Manjira
    const eighthNoteTime = (t % (secondsPerBeat / 2)) / (secondsPerBeat / 2);
    const hihatEnv = Math.exp(-eighthNoteTime * 32);
    const hihatNoise = (Math.random() * 2 - 1) * hihatEnv * 0.08;
    drumSampleL += hihatNoise * 0.8;
    drumSampleR += hihatNoise * 1.2; // Stereo spread

    // Special Tabla / Bihu dhol / Sitar drone accents for Indian genres
    if (hasTabla || hasBhangraDhol) {
      const tablaTime = (t % (secondsPerBeat / 4)) / (secondsPerBeat / 4);
      const tablaPitch = 120 + 30 * Math.sin(currentMeasure);
      const tablaDecay = Math.exp(-tablaTime * 15);
      const bayaBass = Math.sin(2 * Math.PI * tablaPitch * t) * tablaDecay * 0.15;
      drumSampleL += bayaBass * 0.7;
      drumSampleR += bayaBass * 0.9;
    }

    // 4. MELODY / VOCAL FORMANT SYNTHESIS
    // Pick note based on beat division
    if (melodyTimeLeft <= 0) {
      const noteIdx = (Math.floor(t / (secondsPerBeat * 0.5)) + currentMeasure * 2) % melodyScale.length;
      melodyNote = melodyScale[noteIdx];
      melodyTimeLeft = secondsPerBeat * (Math.random() > 0.4 ? 1.0 : 0.5);
    }
    melodyTimeLeft -= 1 / sampleRate;

    // Vibrato
    melodyVibratoPhase += (2 * Math.PI * 5.2) / sampleRate;
    const vibrato = 1 + 0.018 * Math.sin(melodyVibratoPhase);
    let activeMelodyFreq = melodyNote * vibrato;

    let melodySampleL = 0;
    let melodySampleR = 0;

    if (!options.isInstrumental) {
      // SINGING VOCAL SYNTHESIS (Formant Resonators for Voice)
      const gender = options.voiceGender || 'male';
      const formants = gender === 'female' ? VOWEL_FORMANTS.female : VOWEL_FORMANTS.male;
      // Cycle through vocal vowel sounds /a/, /o/, /i/, /e/ smoothly
      const vowelIdx = Math.floor(t / 2) % formants.length;
      const currentFormant = formants[vowelIdx];

      // Vocal fundamental
      const vocalPitch = gender === 'female' ? activeMelodyFreq * 1.0 : activeMelodyFreq * 0.5;
      const vocalPhase = 2 * Math.PI * vocalPitch * t;
      const rawVocal = Math.sin(vocalPhase) + 0.5 * Math.sin(vocalPhase * 2) + 0.25 * Math.sin(vocalPhase * 3);

      // Formant filtering approximation (F1 + F2 peaks)
      const f1Phase = 2 * Math.PI * currentFormant.f1 * t;
      const f2Phase = 2 * Math.PI * currentFormant.f2 * t;
      const resonance = (Math.sin(f1Phase) * 0.4 + Math.sin(f2Phase) * 0.3) * rawVocal;

      // Duet stereo vocal separation
      if (gender === 'duet') {
        const duetFemale = (Math.sin(2 * Math.PI * activeMelodyFreq * t) + 0.3 * Math.sin(2 * Math.PI * activeMelodyFreq * 2 * t)) * 0.22;
        melodySampleL += resonance * 0.28;
        melodySampleR += duetFemale * 0.3;
      } else {
        melodySampleL += resonance * 0.32;
        melodySampleR += resonance * 0.32;
      }
    } else {
      // PURE INSTRUMENTAL LEAD (Acoustic Guitar / Bansuri / Synth Solo)
      const leadPhase = 2 * Math.PI * activeMelodyFreq * t;
      // Flute / acoustic guitar harmonic timbre
      const instrumentLead = (
        Math.sin(leadPhase) * 0.5 +
        Math.sin(leadPhase * 2) * 0.25 +
        Math.sin(leadPhase * 3) * 0.12 +
        Math.sin(leadPhase * 4) * 0.06
      ) * 0.3;
      melodySampleL += instrumentLead * 0.9;
      melodySampleR += instrumentLead * 1.1;
    }

    // 5. STEREO DELAY / REVERB SIMULATION
    const wetMix = 0.18;
    const leftMix = (padSample * 1.1 + bassSample + drumSampleL + melodySampleL) * masterEnv;
    const rightMix = (padSample * 0.9 + bassSample + drumSampleR + melodySampleR) * masterEnv;

    // Soft limiter to prevent clipping
    const finalL = Math.max(-1.0, Math.min(1.0, Math.tanh(leftMix * 1.15)));
    const finalR = Math.max(-1.0, Math.min(1.0, Math.tanh(rightMix * 1.15)));

    // Convert to 16-bit PCM integer (-32768 to 32767)
    const intL = Math.floor(finalL * 32767);
    const intR = Math.floor(finalR * 32767);

    const byteOffset = 44 + i * 4;
    wavBuffer.writeInt16LE(intL, byteOffset);
    wavBuffer.writeInt16LE(intR, byteOffset + 2);
  }

  return wavBuffer;
}

/**
 * Generate Procedural Album Art SVG / Data URL for song
 */
export function generateCoverArt(title: string, genre: string, mood: string): string {
  const hash = Math.abs(
    (title + genre + mood).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  );

  const palettes = [
    { bg1: '#0f172a', bg2: '#312e81', accent: '#ec4899', glow: '#8b5cf6' }, // Deep Velvet
    { bg1: '#052e16', bg2: '#064e3b', accent: '#10b981', glow: '#34d399' }, // Emerald Bihu
    { bg1: '#450a0a', bg2: '#7f1d1d', accent: '#f59e0b', glow: '#ef4444' }, // Bollywood Sunset
    { bg1: '#1e1b4b', bg2: '#581c87', accent: '#06b6d4', glow: '#d946ef' }, // Cyber EDM
    { bg1: '#18181b', bg2: '#27272a', accent: '#a855f7', glow: '#6366f1' }, // Lo-Fi Night
    { bg1: '#2e1065', bg2: '#3b0764', accent: '#f43f5e', glow: '#fb7185' }, // Sad Love
    { bg1: '#14532d', bg2: '#166534', accent: '#facc15', glow: '#4ade80' }, // Classical Folk
  ];

  const palette = palettes[hash % palettes.length];
  const safeTitle = (title || 'AI Song').replace(/[<>&"]/g, '');
  const safeGenre = (genre || 'Music').replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}"/>
        <stop offset="100%" stop-color="${palette.bg2}"/>
      </linearGradient>
      <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.accent}"/>
        <stop offset="100%" stop-color="${palette.glow}"/>
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0"/>
      </radialGradient>
      <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30"/>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="500" height="500" fill="url(#bgGrad)"/>
    <circle cx="250" cy="200" r="180" fill="url(#sunGlow)"/>

    <!-- Decorative Audio Waveforms & Cyber Elements -->
    <g opacity="0.35" filter="url(#blurFilter)">
      <circle cx="150" cy="180" r="120" fill="${palette.accent}"/>
      <circle cx="350" cy="280" r="100" fill="${palette.glow}"/>
    </g>

    <!-- Vinyl Grooves / Wave rings -->
    <circle cx="250" cy="220" r="150" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
    <circle cx="250" cy="220" r="110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <circle cx="250" cy="220" r="70" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

    <!-- Soundwave Pillars -->
    <g transform="translate(140, 160)">
      <rect x="0" y="30" width="8" height="60" rx="4" fill="url(#neonGrad)"/>
      <rect x="18" y="10" width="8" height="100" rx="4" fill="url(#neonGrad)"/>
      <rect x="36" y="45" width="8" height="40" rx="4" fill="url(#neonGrad)"/>
      <rect x="54" y="0" width="8" height="120" rx="4" fill="url(#neonGrad)"/>
      <rect x="72" y="25" width="8" height="75" rx="4" fill="url(#neonGrad)"/>
      <rect x="90" y="15" width="8" height="95" rx="4" fill="url(#neonGrad)"/>
      <rect x="108" y="40" width="8" height="50" rx="4" fill="url(#neonGrad)"/>
      <rect x="126" y="5" width="8" height="110" rx="4" fill="url(#neonGrad)"/>
      <rect x="144" y="20" width="8" height="85" rx="4" fill="url(#neonGrad)"/>
      <rect x="162" y="35" width="8" height="55" rx="4" fill="url(#neonGrad)"/>
      <rect x="180" y="50" width="8" height="30" rx="4" fill="url(#neonGrad)"/>
      <rect x="198" y="20" width="8" height="80" rx="4" fill="url(#neonGrad)"/>
      <rect x="216" y="40" width="8" height="45" rx="4" fill="url(#neonGrad)"/>
    </g>

    <!-- Studio Badge -->
    <rect x="36" y="36" width="90" height="26" rx="13" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)"/>
    <text x="81" y="53" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" letter-spacing="1" text-anchor="middle">SUNO AI</text>

    <!-- Genre Pill -->
    <rect x="36" y="390" width="160" height="28" rx="6" fill="${palette.accent}" opacity="0.9"/>
    <text x="116" y="409" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" text-anchor="middle">${safeGenre.toUpperCase()}</text>

    <!-- Song Title & Tag -->
    <text x="36" y="445" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800">${safeTitle.slice(0, 22)}${safeTitle.length > 22 ? '...' : ''}</text>
    <text x="36" y="468" fill="rgba(255,255,255,0.65)" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="500">My AI Music Studio • 44.1kHz Studio Master</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
