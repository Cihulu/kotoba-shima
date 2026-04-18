// Web Speech API — Japanese TTS helper

const PREFERRED_VOICES = [
  'Kyoko',                    // macOS 女声
  'Otoya',                    // macOS 男声
  'Google 日本語',            // Chrome 内置
  'Microsoft Haruka Desktop', // Windows
  'Microsoft Ayumi Desktop',  // Windows
  'O-Ren',                    // Safari
];

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ja = voices.filter((v) => v.lang.startsWith('ja'));
  if (ja.length === 0) return null;
  for (const name of PREFERRED_VOICES) {
    const hit = ja.find((v) => v.name.includes(name));
    if (hit) return hit;
  }
  return ja[0];
}

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  cachedVoice = pickJapaneseVoice(voices);
  return cachedVoice;
}

// Pre-cache voice as soon as voices are available (before first user click)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const preload = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) cachedVoice = pickJapaneseVoice(voices);
  };
  preload();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null; // reset so preload() picks up fresh list
    preload();
  });
}

export function speak(text: string, rate = 0.82): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

  const ss = window.speechSynthesis;

  // Only cancel if something is actually playing — calling cancel() on an idle
  // synthesis in Chrome can corrupt the internal queue and silently drop the next speak()
  if (ss.speaking || ss.pending) {
    if (ss.paused) ss.resume();
    ss.cancel();
  }

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'ja-JP';
  utt.rate  = rate;
  utt.pitch = 1;
  utt.onerror = (e) => console.warn('[TTS]', e.error, '|', text);

  const voice = getJapaneseVoice();
  if (voice) utt.voice = voice;

  if (ss.getVoices().length > 0) {
    ss.speak(utt);
  } else {
    // Voices not ready yet — defer; note this loses user-gesture context in Chrome,
    // so it may be silent on very first interaction but will work on all subsequent ones
    ss.addEventListener('voiceschanged', () => {
      const v = getJapaneseVoice();
      if (v) utt.voice = v;
      ss.speak(utt);
    }, { once: true });
  }
}
