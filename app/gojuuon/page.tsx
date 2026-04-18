'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { kanaRows, allKana, KanaItem } from '../data/kana';
import { useUser } from '../context/UserContext';
import { playCorrect, playWrong } from '../lib/sound';
import { speak } from '../lib/speech';

type Mode = 'table' | 'quiz';
type KanaType = 'hiragana' | 'katakana';
type QuizDir = 'kana2romaji' | 'romaji2kana';

const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const DARK   = '#2d6e2a';
const MID    = '#a8d8a0';
const BG     = '#d4edcc';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getOptions(correct: KanaItem, all: KanaItem[], type: KanaType, dir: QuizDir): string[] {
  const wrongs = shuffle(all.filter((k) => k.romaji !== correct.romaji)).slice(0, 3);
  const correctAns = dir === 'kana2romaji' ? correct.romaji : correct[type];
  return shuffle([correctAns, ...wrongs.map((k) => dir === 'kana2romaji' ? k.romaji : k[type])]);
}

export default function GojuuonPage() {
  const { user, updateUser } = useUser();
  const [mode, setMode]         = useState<Mode>('table');
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [quizDir, setQuizDir]   = useState<QuizDir>('kana2romaji');

  useEffect(() => { updateUser({ lastModule: 'gojuuon' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [quizList, setQuizList]   = useState<KanaItem[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [options, setOptions]     = useState<string[]>([]);
  const [selected, setSelected]   = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [score, setScore]         = useState(0);
  const [streak, setStreak]       = useState(0);
  const [total, setTotal]         = useState(0);
  const [finished, setFinished]   = useState(false);

  const startQuiz = useCallback((overrideDir?: QuizDir) => {
    // cancel any pending answer-advance timer so it can't overwrite new quiz state
    if (advanceTimer.current) { clearTimeout(advanceTimer.current); advanceTimer.current = null; }
    const dir = overrideDir ?? quizDir;
    const list = shuffle(allKana);
    setQuizList(list);
    setQuizIndex(0);
    setOptions(getOptions(list[0], allKana, kanaType, dir));
    setSelected(null);
    setScore(0); setStreak(0); setTotal(0);
    setFinished(false);
    setMode('quiz');
  }, [kanaType, quizDir]);

  const handleAnswer = (ans: string) => {
    if (selected !== null) return;
    const cur = quizList[quizIndex];
    const correct = quizDir === 'kana2romaji' ? cur.romaji : cur[kanaType];
    setSelected(ans);
    setTotal((t) => t + 1);
    if (ans === correct) {
      playCorrect();
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
      if (user) {
        const existing = new Set(user.kanaCorrect);
        existing.add(cur.romaji);
        updateUser({ kanaCorrect: [...existing] });
      }
    } else {
      playWrong();
      setStreak(0);
    }
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      const next = quizIndex + 1;
      if (next >= quizList.length) { setFinished(true); return; }
      setQuizIndex(next);
      setOptions(getOptions(quizList[next], allKana, kanaType, quizDir));
      setSelected(null);
    }, 850);
  };

  const cur = quizList[quizIndex];
  const correctAns = cur ? (quizDir === 'kana2romaji' ? cur.romaji : cur[kanaType]) : '';
  const progress = quizList.length > 0 ? (quizIndex / quizList.length) * 100 : 0;

  useEffect(() => {
    if (cur && quizDir === 'kana2romaji') speak(cur.hiragana);
  }, [quizIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">

      {/* Zone header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3"
             style={{ background: DARK, borderRadius: '2px' }}>
          <span className="font-pixel text-[7px] text-white opacity-80">ZONE 1</span>
          <span className="text-white text-xs font-bold">入門村</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DARK }}>
          <span className="inline-flex items-center justify-center w-9 h-9 text-lg font-bold"
                style={{ border: `3px solid ${DARK}`, background: MID, borderRadius: '2px', boxShadow: `3px 3px 0 ${DARK}` }}>あ</span>
          五十音図
        </h1>
        <p className="text-sm mt-1.5" style={{ color: '#7a6a55' }}>平假名 & 片假名 · 46 个基本假名</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">

        {/* Mode tabs */}
        <div className="flex" style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
          <button
            onClick={() => setMode('table')}
            className="px-4 py-2 text-sm font-bold"
            style={mode === 'table'
              ? { background: BORDER, color: CARD }
              : { background: CARD, color: '#7a6a55', borderRight: `2px solid ${BORDER}` }}
          >
            表格
          </button>
          <button
            onClick={() => startQuiz()}
            className="px-4 py-2 text-sm font-bold"
            style={mode === 'quiz'
              ? { background: BORDER, color: CARD }
              : { background: CARD, color: '#7a6a55' }}
          >
            测验
          </button>
        </div>

        {/* Kana type tabs */}
        <div className="flex" style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
          {([['hiragana', '平假名'], ['katakana', '片假名']] as [KanaType, string][]).map(([k, label], i) => (
            <button
              key={k}
              onClick={() => setKanaType(k)}
              className="px-4 py-2 text-sm font-bold"
              style={kanaType === k
                ? { background: DARK, color: '#fff' }
                : { background: CARD, color: '#7a6a55', borderRight: i === 0 ? `2px solid ${BORDER}` : undefined }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Quiz direction tabs */}
        {mode === 'quiz' && (
          <div className="flex" style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
            {([['kana2romaji', '假名→罗马字'], ['romaji2kana', '罗马字→假名']] as [QuizDir, string][]).map(([d, label], i) => (
              <button
                key={d}
                onClick={() => { setQuizDir(d); startQuiz(d); }}
                className="px-4 py-2 text-sm font-bold"
                style={quizDir === d
                  ? { background: DARK, color: '#fff' }
                  : { background: CARD, color: '#7a6a55', borderRight: i === 0 ? `2px solid ${BORDER}` : undefined }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      {mode === 'table' && (
        <div className="fade-up overflow-x-auto"
             style={{ border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px', background: CARD }}>
          <table className="w-full text-center">
            <thead>
              <tr style={{ borderBottom: `3px solid ${BORDER}`, background: DARK }}>
                <th className="px-3 py-3 w-14" />
                {['a', 'i', 'u', 'e', 'o'].map((v) => (
                  <th key={v} className="px-3 py-3 font-pixel text-[10px] text-white">{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kanaRows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: `2px solid ${BG}` }}>
                  <td className="px-3 py-2 font-pixel text-[8px]" style={{ color: '#7a6a55' }}>{row.label}</td>
                  {row.cells.map((cell, ci) =>
                    cell ? (
                      <td key={ci} className="px-2 py-3">
                        <div className="inline-flex flex-col items-center gap-0.5 cursor-default group">
                          <span className="text-2xl font-bold transition-colors" style={{ color: '#1a0f00' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = DARK)}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#1a0f00')}>
                            {kanaType === 'hiragana' ? cell.hiragana : cell.katakana}
                          </span>
                          <span className="font-pixel text-[8px]" style={{ color: '#7a6a55' }}>
                            {cell.romaji}
                          </span>
                        </div>
                      </td>
                    ) : <td key={ci} />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── QUIZ ── */}
      {mode === 'quiz' && (
        <div className="fade-up max-w-md mx-auto">
          {finished ? (
            /* Finished screen */
            <div className="text-center p-8"
                 style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
              <div className="font-pixel text-[10px] mb-4" style={{ color: DARK }}>STAGE CLEAR!</div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3" style={{ background: BG, border: `2px solid ${DARK}`, boxShadow: `3px 3px 0 ${DARK}`, borderRadius: '2px' }}>
                  <div className="font-pixel text-lg" style={{ color: DARK }}>{score / 10}</div>
                  <div className="text-xs mt-1" style={{ color: DARK }}>答对 ✓</div>
                </div>
                <div className="p-3" style={{ background: '#fde8e8', border: '2px solid #7f1d1d', boxShadow: '3px 3px 0 #7f1d1d', borderRadius: '2px' }}>
                  <div className="font-pixel text-lg" style={{ color: '#7f1d1d' }}>{total - score / 10}</div>
                  <div className="text-xs mt-1" style={{ color: '#7f1d1d' }}>答错 ✗</div>
                </div>
              </div>
              <div className="font-pixel text-2xl mb-5" style={{ color: DARK }}>
                {score / total >= 0.8 ? '★★★' : score / total >= 0.5 ? '★★☆' : '★☆☆'}
              </div>
              <button
                onClick={() => startQuiz()}
                className="w-full py-2.5 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{ background: DARK, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
              >
                ▶ 再来一次
              </button>
            </div>
          ) : cur ? (
            <>
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className="font-pixel text-[9px]" style={{ color: '#7a6a55' }}>{quizIndex + 1} / {quizList.length}</span>
                  <span className="text-xs" style={{ color: '#7a6a55' }}>🔥 {streak} 连击 · {score} 分</span>
                </div>
                <div className="h-4 relative" style={{ border: `2px solid ${BORDER}`, background: '#e8dcc8', borderRadius: '2px', boxShadow: `2px 2px 0 ${BORDER}` }}>
                  <div className="h-full transition-all duration-300"
                       style={{ width: `${progress}%`, background: DARK, borderRadius: '1px' }} />
                </div>
              </div>

              {/* Question card */}
              <div className="text-center mb-5 p-8 relative"
                   style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
                <p className="font-pixel text-[8px] mb-4" style={{ color: '#7a6a55' }}>
                  {quizDir === 'kana2romaji' ? '这个假名的罗马字是？' : '这个罗马字对应哪个假名？'}
                </p>
                <div className="text-7xl font-bold" style={{ color: '#1a0f00' }}>
                  {quizDir === 'kana2romaji'
                    ? (kanaType === 'hiragana' ? cur.hiragana : cur.katakana)
                    : cur.romaji}
                </div>
                {quizDir === 'kana2romaji' && (
                  <button
                    onClick={() => speak(kanaType === 'hiragana' ? cur.hiragana : cur.katakana)}
                    className="absolute bottom-3 right-4 text-lg"
                    style={{ color: '#c8b89a' }}
                    title="播放发音"
                  >
                    ♪
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => {
                  let bg = CARD, color = '#1a0f00', border = `3px solid ${BORDER}`, shadow = `4px 4px 0 ${BORDER}`;
                  if (selected !== null) {
                    if (opt === correctAns) {
                      bg = BG; color = DARK; border = `3px solid ${DARK}`; shadow = `4px 4px 0 ${DARK}`;
                    } else if (opt === selected) {
                      bg = '#fde8e8'; color = '#7f1d1d'; border = '3px solid #7f1d1d'; shadow = '4px 4px 0 #7f1d1d';
                    } else {
                      bg = '#f0ebe0'; color = '#c8b89a'; shadow = 'none';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="py-4 text-xl font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                      style={{ background: bg, color, border, boxShadow: shadow, borderRadius: '2px' }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
