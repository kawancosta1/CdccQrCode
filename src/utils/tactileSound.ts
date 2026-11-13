const SOUND_PREF_KEY = "cdcc_tactile_sound_v1";

let sharedAudioCtx: AudioContext | null = null;

export function isTactileSoundEnabled(): boolean {
  try {
    if (typeof localStorage === "undefined") return true;
    const raw = localStorage.getItem(SOUND_PREF_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

export function setTactileSoundEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(SOUND_PREF_KEY, String(enabled));
    }
  } catch {
    // ignore storage errors
  }
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Dispara um micro-som seco e sutil de papel/clique tátil (~40ms) via Web Audio API.
 * Nunca lança erro nem bloqueia a navegação caso o navegador bloqueie áudio automático.
 */
export function playPaperClickSound(reducedMotion = false): void {
  if (reducedMotion || !isTactileSoundEnabled()) return;
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const duration = 0.042;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const env = Math.pow(1 - i / bufferSize, 2.4);
      data[i] = (Math.random() * 2 - 1) * env * 0.28;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1650, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  } catch {
    // Silencioso caso o dispositivo/navegador não suporte Web Audio
  }
}
