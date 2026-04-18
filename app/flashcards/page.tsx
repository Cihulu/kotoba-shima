'use client';

import { useState, useEffect, useCallback } from 'react';
import { vocabulary, VocabItem } from '../data/vocabulary';
import { useUser } from '../context/UserContext';
import { speak } from '../lib/speech';
import { playFlip } from '../lib/sound';

type Level = 'N5' | 'N4' | 'N3' | 'ALL';

const BORDER = '#2d1810';
const CARD   = '#fffdf7';

const levelPx: Record<Level, { dark: string; mid: string; bg: string }> = {
  N5:  { dark: '#2d6e2a', mid: '#a8d8a0', bg: '#d4edcc' },
  N4:  { dark: '#1e4d7a', mid: '#90c4f0', bg: '#d0e8fd' },
  N3:  { dark: '#7a3800', mid: '#f5b060', bg: '#fdd8b0' },
  ALL: { dark: '#7a4800', mid: '#f5c860', bg: '#fde8b0' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const { user, updateUser, addNote, updateSRS } = useUser();
  const [level, setLevel]         = useState<Level>('N5');
  const [category, setCategory]   = useState('全部');
  const [deck, setDeck]           = useState<VocabItem[]>([]);
  const [index, setIndex]         = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [known, setKnown]         = useState<Set<string>>(new Set(user?.vocabKnown ?? []));
  const [unknown, setUnknown]     = useState<Set<string>>(new Set());
  const [finished, setFinished]   = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  useEffect(() => { updateUser({ lastModule: 'flashcards' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = vocabulary.filter((v) =>
    (level === 'ALL' || v.level === level) &&
    (category === '全部' || v.category === category)
  );

  const categories = ['全部', ...Array.from(new Set(
    vocabulary.filter((v) => level === 'ALL' || v.level === level).map((v) => v.category)
  ))];

  const buildDeck = useCallback(() => {
    setDeck(shuffle(filtered));
    setIndex(0); setFlipped(false);
    setUnknown(new Set()); setFinished(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, category]);

  useEffect(() => { buildDeck(); }, [buildDeck]);

  const cur = deck[index];
  const lv  = levelPx[level];
  const progress = deck.length > 0 ? (index / deck.length) * 100 : 0;

  useEffect(() => { if (cur) speak(cur.word); }, [index, cur]);

  const next = () => {
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 >= deck.length) setFinished(true);
      else setIndex((i) => i + 1);
    }, 150);
  };

  const handleFlip = () => {
    playFlip();
    setFlipped((f) => !f);
    if (!flipped && cur) speak(cur.reading);
  };

  return (
    <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">

      {/* Zone header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3"
             style={{ background: '#7a4800', borderRadius: '2px' }}>
          <span className="font-pixel text-[7px] text-white opacity-80">ZONE 2</span>
          <span className="text-white text-xs font-bold">単語の森</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#7a4800' }}>
          <span className="inline-flex items-center justify-center w-9 h-9 text-lg font-bold"
                style={{ border: '3px solid #7a4800', background: '#f5c860', borderRadius: '2px', boxShadow: '3px 3px 0 #7a4800' }}>語</span>
          単語フラッシュ
        </h1>
        <p className="text-sm mt-1.5" style={{ color: '#7a6a55' }}>点击卡片翻转 · 翻面后可记入生字本</p>
      </div>

      {/* Level tabs — pixel style */}
      <div className="flex mb-4 w-fit" style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
        {(['N5', 'N4', 'N3', 'ALL'] as Level[]).map((l) => {
          const active = level === l;
          return (
            <button
              key={l}
              onClick={() => { setLevel(l); setCategory('全部'); }}
              className="px-5 py-2 text-sm font-bold transition-colors"
              style={active
                ? { background: levelPx[l].dark, color: '#fff', borderRight: l !== 'ALL' ? `2px solid ${BORDER}` : undefined }
                : { background: CARD, color: '#7a6a55', borderRight: l !== 'ALL' ? `2px solid ${BORDER}` : undefined }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Category chips — pixel style */}
      <div className="flex flex-wrap gap-2 mb-7">
        {categories.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1 text-xs font-bold"
              style={active
                ? { background: lv.dark, color: '#fff', border: `2px solid ${lv.dark}`, boxShadow: `2px 2px 0 ${BORDER}`, borderRadius: '2px' }
                : { background: CARD, color: '#7a6a55', border: `2px solid ${BORDER}`, borderRadius: '2px' }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {finished ? (
        /* ── Finished screen ── */
        <div className="max-w-xs mx-auto text-center fade-up p-8"
             style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
          <div className="font-pixel text-[10px] mb-4" style={{ color: lv.dark }}>ROUND CLEAR!</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3" style={{ background: '#d4edcc', border: `2px solid #2d6e2a`, boxShadow: `3px 3px 0 #2d6e2a`, borderRadius: '2px' }}>
              <div className="font-pixel text-lg" style={{ color: '#2d6e2a' }}>{deck.length - unknown.size}</div>
              <div className="text-xs mt-1" style={{ color: '#2d6e2a' }}>认识 ✓</div>
            </div>
            <div className="p-3" style={{ background: '#fde8e8', border: `2px solid #7f1d1d`, boxShadow: `3px 3px 0 #7f1d1d`, borderRadius: '2px' }}>
              <div className="font-pixel text-lg" style={{ color: '#7f1d1d' }}>{unknown.size}</div>
              <div className="text-xs mt-1" style={{ color: '#7f1d1d' }}>待复习 ✗</div>
            </div>
          </div>
          {unknown.size > 0 && (
            <button
              onClick={() => {
                setDeck(shuffle(deck.filter((v) => unknown.has(v.word))));
                setIndex(0); setFlipped(false); setUnknown(new Set()); setFinished(false);
              }}
              className="w-full py-2.5 mb-3 text-sm font-bold"
              style={{ background: '#7f1d1d', color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              ▶ 只练不会的（{unknown.size}个）
            </button>
          )}
          <button
            onClick={buildDeck}
            className="w-full py-2.5 text-sm font-bold"
            style={{ background: lv.dark, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
          >
            ▶ 重新洗牌
          </button>
        </div>

      ) : cur ? (
        <div className="max-w-sm mx-auto">

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-2" style={{ color: '#7a6a55' }}>
              <span className="font-pixel text-[9px]">{index + 1} / {deck.length}</span>
              <span>已掌握 {deck.filter((v) => known.has(v.word)).length} ★</span>
            </div>
            {/* Pixel progress bar */}
            <div className="h-4 relative" style={{ border: `2px solid ${BORDER}`, background: '#e8dcc8', borderRadius: '2px', boxShadow: `2px 2px 0 ${BORDER}` }}>
              <div className="h-full transition-all duration-300"
                   style={{ width: `${progress}%`, background: lv.dark, borderRadius: '1px' }} />
            </div>
          </div>

          {/* Flip card */}
          <div className="flip-card w-full mb-5 cursor-pointer" style={{ height: '300px' }} onClick={handleFlip}>
            <div className={`flip-card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

              {/* ── Front ── */}
              <div className="flip-card-front w-full h-full flex flex-col items-center justify-center p-6 relative"
                   style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
                {/* Level badge */}
                <span className="absolute top-3 right-3 font-pixel text-[8px] px-2 py-1"
                      style={{ background: levelPx[cur.level as Level].dark, color: '#fff', borderRadius: '2px' }}>
                  {cur.level}
                </span>
                {/* Speaker */}
                <button
                  onClick={(e) => { e.stopPropagation(); speak(cur.word); }}
                  className="absolute top-3 left-3 text-lg"
                  style={{ color: '#c8b89a' }}
                  title="播放发音"
                >
                  ♪
                </button>
                {cur.emoji && <div className="text-5xl mb-3">{cur.emoji}</div>}
                <div className="text-5xl font-bold mb-3" style={{ color: '#1a0f00' }}>{cur.word}</div>
                <div className="font-pixel text-[8px]" style={{ color: '#c8b89a' }}>CLICK TO FLIP</div>
              </div>

              {/* ── Back ── */}
              <div className="flip-card-back w-full h-full flex flex-col p-5 overflow-hidden"
                   style={{ background: lv.bg, border: `3px solid ${lv.dark}`, boxShadow: `5px 5px 0 ${lv.dark}`, borderRadius: '2px' }}>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  {/* Save button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (savedWords.has(cur.word)) return;
                      setSavedWords((s) => new Set([...s, cur.word]));
                      addNote({
                        source: 'vocab',
                        word: cur.word, reading: cur.reading,
                        sentence: cur.sentence ?? '',
                        romaji: cur.romaji, meaning: cur.meaning,
                        level: cur.level, category: cur.category,
                        sentenceReading: cur.sentenceReading,
                        sentenceMeaning: cur.sentenceMeaning,
                      });
                    }}
                    className="absolute top-0 right-0 text-xs font-bold px-2 py-1"
                    style={savedWords.has(cur.word)
                      ? { background: lv.mid, color: lv.dark, border: `2px solid ${lv.dark}`, borderRadius: '2px', opacity: 0.7 }
                      : { background: CARD, color: lv.dark, border: `2px solid ${lv.dark}`, borderRadius: '2px', boxShadow: `2px 2px 0 ${lv.dark}` }}
                  >
                    {savedWords.has(cur.word) ? '✓ 已记录' : '+ 记录'}
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); speak(cur.reading); }}
                          className="text-xl mb-1" style={{ color: lv.dark }} title="播放读音">♪</button>
                  <div className="text-sm mb-0.5 font-medium" style={{ color: lv.dark }}>{cur.reading}</div>
                  <div className="text-xs italic mb-3" style={{ color: lv.dark, opacity: 0.7 }}>{cur.romaji}</div>
                  <div className="text-2xl font-bold" style={{ color: '#1a0f00' }}>{cur.meaning}</div>
                </div>

                {cur.sentence && (
                  <div className="pt-3 mt-2" style={{ borderTop: `2px solid ${lv.dark}`, opacity: 0.9 }}>
                    <div className="font-pixel text-[7px] mb-2" style={{ color: lv.dark }}>EXAMPLE</div>
                    <button onClick={(e) => { e.stopPropagation(); speak(cur.sentence!); }} className="text-left w-full">
                      <p className="text-sm font-medium leading-snug" style={{ color: '#1a0f00' }}>{cur.sentence}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: lv.dark, opacity: 0.7 }}>{cur.sentenceReading}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#7a6a55' }}>{cur.sentenceMeaning}</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons — pixel press style */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                updateSRS(cur.word, false);
                const next2 = new Set([...unknown, cur.word]);
                setUnknown(next2);
                updateUser({ vocabUnknown: [...next2] });
                next();
              }}
              className="py-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ background: CARD, color: '#7f1d1d', border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              ✗ 不认识
            </button>
            <button
              onClick={() => {
                updateSRS(cur.word, true);
                const next2 = new Set([...known, cur.word]);
                setKnown(next2);
                updateUser({ vocabKnown: [...next2], vocabUnknown: [...unknown] });
                next();
              }}
              className="py-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ background: '#2d6e2a', color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              ✓ 认识了！
            </button>
          </div>
          <p className="text-center text-xs mt-3 font-pixel text-[7px]" style={{ color: '#c8b89a' }}>
            FLIP CARD TO SEE MEANING
          </p>
        </div>
      ) : (
        <div className="text-center mt-20 font-pixel text-[10px]" style={{ color: '#c8b89a' }}>NO CARDS</div>
      )}
    </div>
  );
}
