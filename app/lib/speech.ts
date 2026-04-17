// Web Speech API — Japanese TTS helper

const PREFERRED_VOICES = [
  'Kyoko',                    // macOS 女声
  'Otoya',                    // macOS 男声
  'Google 日本語',            // Chrome 内置网络语音
  'Microsoft Haruka Desktop', // Windows
  'Microsoft Ayumi Desktop',  // Windows
  'O-Ren',                    // Safari
];

let cachedVoice: SpeechSynthesisVoice | null = null;

// Re-run voice selection whenever the browser finishes loading voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null; // invalidate cache so next speak() picks up new voices
  });
}

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not ready yet

  const ja = voices.filter((v) => v.lang.startsWith('ja'));
  if (ja.length === 0) return null; // no Japanese voice installed

  for (const name of PREFERRED_VOICES) {
    const hit = ja.find((v) => v.name.includes(name));
    if (hit) { cachedVoice = hit; return hit; }
  }
  cachedVoice = ja[0];
  return cachedVoice;
}

export function speak(text: string, rate = 0.82): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

  const ss = window.speechSynthesis;

  // Chrome bug: synthesis can silently enter a paused state
  if (ss.paused) ss.resume();
  ss.cancel();

  const fire = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = 'ja-JP';
    utt.rate  = rate;
    utt.pitch = 1;
    const voice = getJapaneseVoice();
    if (voice) utt.voice = voice;
    ss.speak(utt);
  };

  if (ss.getVoices().length > 0) {
    fire();
  } else {
    ss.addEventListener('voiceschanged', fire, { once: true });
  }
}
