// Web Audio API — generates sounds in-browser, no files needed

let ctx: AudioContext | null = null;

// FIXED: properly await ctx.resume() before scheduling audio
async function getCtx(): Promise<AudioContext> {
  if (!ctx || ctx.state === 'closed') {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') {
    await ctx.resume(); // was missing await — caused silent failure
  }
  return ctx;
}

/** Correct — two ascending tones (Duolingo-style ding) */
export async function playCorrect(): Promise<void> {
  try {
    const ac = await getCtx();
    [523.25, 783.99].forEach((freq, i) => { // C5 → G5
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch {}
}

/** Wrong — descending buzz */
export async function playWrong(): Promise<void> {
  try {
    const ac  = await getCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.28);
    gain.gain.setValueAtTime(0.18, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.28);
  } catch {}
}

/** Soft click — card flip */
export async function playFlip(): Promise<void> {
  try {
    const ac  = await getCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.07, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.08);
  } catch {}
}
