'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { vocabulary, VocabItem } from '../data/vocabulary';
import { useUser } from '../context/UserContext';
import { isDue, nextDueDate } from '../lib/srs';
import { speak } from '../lib/speech';
import { playFlip, playCorrect, playWrong } from '../lib/sound';

const BATCH_SIZE = 20;
const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const DARK   = '#4c1d95';
const MID    = '#c4b5fd';
const BG     = '#ede9fe';

const levelPx = {
  N5: { dark: '#2d6e2a', mid: '#a8d8a0', bg: '#d4edcc' },
  N4: { dark: '#1e4d7a', mid: '#90c4f0', bg: '#d0e8fd' },
  N3: { dark: '#7a3800', mid: '#f5b060', bg: '#fdd8b0' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Header() {
  return (
    <div className="mb-7">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3"
           style={{ background: DARK, borderRadius: '2px' }}>
        <span className="font-pixel text-[7px] text-white opacity-80">REVIEW</span>
        <span className="text-white text-xs font-bold">記憶の庭</span>
      </div>
      <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DARK }}>
        <span className="inline-flex items-center justify-center w-9 h-9 text-lg font-bold"
              style={{ border: `3px solid ${DARK}`, background: MID, borderRadius: '2px', boxShadow: `3px 3px 0 ${DARK}` }}>
          復
        </span>
        复习
      </h1>
      <p className="text-sm mt-1.5" style={{ color: '#7a6a55' }}>艾宾浩斯遗忘曲线 · 每组 {BATCH_SIZE} 张</p>
    </div>
  );
}

export default function ReviewPage() {
  const { user, updateSRS } = useUser();

  // Snapshot of all due vocab items at session start
  const [allDue, setAllDue]       = useState<VocabItem[]>([]);
  const [batch, setBatch]         = useState<VocabItem[]>([]);
  const [batchStart, setBatchStart] = useState(0);
  const [loaded, setLoaded]       = useState(false);

  const [index, setIndex]         = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [results, setResults]     = useState<boolean[]>([]);
  const [batchDone, setBatchDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dueWords = new Set(user.srsCards.filter(isDue).map((c) => c.word));
    const items = shuffle(vocabulary.filter((v) => dueWords.has(v.word)));
    setAllDue(items);
    setBatch(items.slice(0, BATCH_SIZE));
    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = batch[index];
  const lv  = levelPx[(cur?.level as keyof typeof levelPx) ?? 'N5'];
  const progress = batch.length > 0 ? (index / batch.length) * 100 : 0;
  const correctCount = results.filter(Boolean).length;
  const remaining = allDue.length - batchStart - batch.length;

  const handleFlip = () => {
    playFlip();
    setFlipped((f) => !f);
    if (!flipped && cur) speak(cur.reading);
  };

  const handleAnswer = (wasCorrect: boolean) => {
    if (!cur) return;
    wasCorrect ? playCorrect() : playWrong();
    updateSRS(cur.word, wasCorrect);
    setResults((r) => [...r, wasCorrect]);
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 >= batch.length) setBatchDone(true);
      else setIndex((i) => i + 1);
    }, 150);
  };

  const loadNextBatch = () => {
    const nextStart = batchStart + batch.length;
    setBatchStart(nextStart);
    setBatch(allDue.slice(nextStart, nextStart + BATCH_SIZE));
    setIndex(0);
    setFlipped(false);
    setResults([]);
    setBatchDone(false);
  };

  if (!loaded) return null;

  // ── Empty state ─────────────────────────────────────────────────
  if (allDue.length === 0) {
    const next = user ? nextDueDate(user.srsCards) : null;
    return (
      <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">
        <Header />
        <div className="max-w-sm mx-auto text-center p-10 fade-up"
             style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
          <div className="font-pixel text-[10px] mb-4" style={{ color: DARK }}>TODAY CLEAR!</div>
          <div className="text-5xl mb-5">🌿</div>
          <p className="text-sm font-bold mb-2" style={{ color: '#1a0f00' }}>今日复习已全部完成</p>
          {next ? (
            <p className="text-xs mb-6" style={{ color: '#7a6a55' }}>
              下次复习：{next.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </p>
          ) : (
            <p className="text-xs mb-6" style={{ color: '#7a6a55' }}>
              还没有单词加入复习队列
            </p>
          )}
          {user && user.srsCards.length === 0 && (
            <p className="text-xs mb-5 px-2 leading-relaxed" style={{ color: '#c8b89a' }}>
              先去「単語」页翻几张卡片，单词就会自动加入这里 ✓
            </p>
          )}
          <Link
            href="/flashcards"
            className="block w-full py-2.5 text-sm font-bold text-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            style={{ background: DARK, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
          >
            ▶ 去学新单词
          </Link>
        </div>
      </div>
    );
  }

  // ── Batch done screen ────────────────────────────────────────────
  if (batchDone) {
    return (
      <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">
        <Header />
        <div className="max-w-xs mx-auto text-center p-8 fade-up"
             style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
          <div className="font-pixel text-[10px] mb-5" style={{ color: DARK }}>BATCH CLEAR!</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3"
                 style={{ background: '#d4edcc', border: '2px solid #2d6e2a', boxShadow: '3px 3px 0 #2d6e2a', borderRadius: '2px' }}>
              <div className="font-pixel text-lg" style={{ color: '#2d6e2a' }}>{correctCount}</div>
              <div className="text-xs mt-1" style={{ color: '#2d6e2a' }}>记住了 ✓</div>
            </div>
            <div className="p-3"
                 style={{ background: '#fde8e8', border: '2px solid #7f1d1d', boxShadow: '3px 3px 0 #7f1d1d', borderRadius: '2px' }}>
              <div className="font-pixel text-lg" style={{ color: '#7f1d1d' }}>{results.length - correctCount}</div>
              <div className="text-xs mt-1" style={{ color: '#7f1d1d' }}>忘了 ✗</div>
            </div>
          </div>

          {remaining > 0 ? (
            <button
              onClick={loadNextBatch}
              className="w-full py-2.5 mb-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ background: DARK, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              ▶ 继续（剩余 {remaining} 张）
            </button>
          ) : (
            <div className="mb-3 py-1 font-pixel text-[8px]" style={{ color: '#7a6a55' }}>
              全部复习完毕！
            </div>
          )}

          <Link
            href="/"
            className="block w-full py-2.5 text-sm font-bold text-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            style={{ background: CARD, color: '#7a6a55', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // ── Active review ────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">
      <Header />

      {cur && (
        <div className="max-w-sm mx-auto">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="font-pixel text-[9px]" style={{ color: '#7a6a55' }}>
                {index + 1} / {batch.length}
                {remaining > 0 && ` · 还有 ${remaining} 张`}
              </span>
              <span className="text-xs" style={{ color: '#7a6a55' }}>
                ✓ {correctCount}　✗ {results.length - correctCount}
              </span>
            </div>
            <div className="h-4 relative"
                 style={{ border: `2px solid ${BORDER}`, background: '#e8dcc8', borderRadius: '2px', boxShadow: `2px 2px 0 ${BORDER}` }}>
              <div className="h-full transition-all duration-300"
                   style={{ width: `${progress}%`, background: DARK, borderRadius: '1px' }} />
            </div>
          </div>

          {/* Flip card */}
          <div className="flip-card w-full mb-5 cursor-pointer" style={{ height: '300px' }}
               onClick={handleFlip}>
            <div className={`flip-card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

              {/* Front */}
              <div className="flip-card-front w-full h-full flex flex-col items-center justify-center p-6 relative"
                   style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
                <span className="absolute top-3 right-3 font-pixel text-[8px] px-2 py-1"
                      style={{ background: levelPx[cur.level as keyof typeof levelPx].dark, color: '#fff', borderRadius: '2px' }}>
                  {cur.level}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(cur.word); }}
                  className="absolute top-3 left-3 text-lg"
                  style={{ color: '#c8b89a' }}
                >♪</button>
                {cur.emoji && <div className="text-5xl mb-3">{cur.emoji}</div>}
                <div className="text-5xl font-bold mb-3" style={{ color: '#1a0f00' }}>{cur.word}</div>
                <div className="font-pixel text-[8px]" style={{ color: '#c8b89a' }}>CLICK TO FLIP</div>
              </div>

              {/* Back */}
              <div className="flip-card-back w-full h-full flex flex-col p-5 overflow-hidden"
                   style={{ background: lv.bg, border: `3px solid ${lv.dark}`, boxShadow: `5px 5px 0 ${lv.dark}`, borderRadius: '2px' }}>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(cur.reading); }}
                    className="text-xl mb-1" style={{ color: lv.dark }}
                  >♪</button>
                  <div className="text-sm mb-0.5 font-medium" style={{ color: lv.dark }}>{cur.reading}</div>
                  <div className="text-xs italic mb-3" style={{ color: lv.dark, opacity: 0.7 }}>{cur.romaji}</div>
                  <div className="text-2xl font-bold" style={{ color: '#1a0f00' }}>{cur.meaning}</div>
                </div>

                {cur.sentence && (
                  <div className="pt-3 mt-2" style={{ borderTop: `2px solid ${lv.dark}`, opacity: 0.9 }}>
                    <div className="font-pixel text-[7px] mb-2" style={{ color: lv.dark }}>EXAMPLE</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(cur.sentence!); }}
                      className="text-left w-full"
                    >
                      <p className="text-sm font-medium leading-snug" style={{ color: '#1a0f00' }}>{cur.sentence}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: lv.dark, opacity: 0.7 }}>{cur.sentenceReading}</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answer buttons — only visible after flip */}
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(false)}
                className="py-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{ background: CARD, color: '#7f1d1d', border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}
              >
                ✗ 忘了
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="py-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{ background: '#2d6e2a', color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}
              >
                ✓ 记住了！
              </button>
            </div>
          ) : (
            <p className="text-center font-pixel text-[7px]" style={{ color: '#c8b89a' }}>
              FLIP CARD TO ANSWER
            </p>
          )}
        </div>
      )}
    </div>
  );
}
