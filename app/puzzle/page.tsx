'use client';

import { useState, useEffect, useCallback } from 'react';
import { puzzles, PuzzleSentence, PuzzleToken, typeStyle } from '../data/puzzles';
import { useUser } from '../context/UserContext';
import { speak } from '../lib/speech';
import { playCorrect, playWrong } from '../lib/sound';

const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const DARK   = '#4c1d95';
const MID    = '#c4b5fd';
const BG     = '#ede9fe';

// ── Token chip ────────────────────────────────────────────────────
interface TokenChipProps {
  token: PuzzleToken;
  solved: boolean;
  active: boolean;
  shake: boolean;
  onClick: () => void;
}

function TokenChip({ token, solved, active, shake, onClick }: TokenChipProps) {
  if (token.skip) {
    return (
      <span className="text-2xl font-medium self-end pb-1 select-none" style={{ color: '#c8b89a' }}>
        {token.text}
      </span>
    );
  }

  const style = typeStyle[token.type];
  const isInteractive = Boolean(token.question);

  // Pre-labeled tokens: always shown colored, not clickable
  if (!isInteractive) {
    return (
      <div className="flex flex-col items-center gap-0.5 select-none">
        <span className="font-pixel text-[7px] h-3 leading-none" style={{ color: '#7a6a55' }}>
          {token.reading}
        </span>
        <span className={`px-3 py-1.5 border text-base font-bold leading-tight ${style.chip}`}
              style={{ borderRadius: '2px' }}>
          {token.text}
        </span>
        <span className={`font-pixel text-[7px] h-3 leading-none ${style.chip.split(' ').find(c => c.startsWith('text-')) ?? ''}`}>
          {style.label}
        </span>
      </div>
    );
  }

  // Interactive tokens
  let chipStyle: React.CSSProperties = { borderRadius: '2px', transition: 'all 0.15s' };
  let chipClass = 'px-3 py-1.5 border-2 text-base font-bold leading-tight ';

  if (solved) {
    chipClass += style.solved;
  } else if (active) {
    chipClass += 'border-[#4c1d95] text-[#4c1d95]';
    chipStyle = { ...chipStyle, background: BG, boxShadow: `0 0 0 3px ${MID}` };
  } else {
    chipClass += 'border-[#c8b89a] text-[#1a0f00] cursor-pointer';
    chipStyle = { ...chipStyle, background: CARD };
  }

  return (
    <div
      className={`flex flex-col items-center gap-0.5 select-none ${shake ? 'animate-shake' : ''}`}
      onClick={solved ? undefined : onClick}
      title={solved ? style.label : '点击答题'}
    >
      <span className="font-pixel text-[7px] h-3 leading-none" style={{ color: '#7a6a55' }}>
        {token.reading}
      </span>
      <span className={chipClass} style={chipStyle}>
        {token.text}
      </span>
      <span className={`font-pixel text-[7px] h-3 leading-none transition-all ${
        solved
          ? style.solved.split(' ').find(c => c.startsWith('text-')) ?? ''
          : 'text-slate-300'
      }`}>
        {solved ? style.label : '？'}
      </span>
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────
interface QuestionCardProps {
  token: PuzzleToken;
  sentenceText: string;
  onCorrect: () => void;
  onWrong: () => void;
  onClose: () => void;
  onSaveNote: () => void;
}

function QuestionCard({ token, sentenceText, onCorrect, onWrong, onClose, onSaveNote }: QuestionCardProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChoice = (idx: number) => {
    if (chosen !== null) return;
    if (idx === token.correct) {
      setChosen(idx);
      playCorrect();
    } else {
      setWrongIdx(idx);
      playWrong();
      onWrong();
      setTimeout(() => setWrongIdx(null), 600);
    }
  };

  const style = typeStyle[token.type];

  return (
    <div className="bounce-in w-full max-w-sm mx-auto p-5"
         style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-2xl font-bold px-2 py-0.5 border ${style.chip}`}
                  style={{ borderRadius: '2px' }}>
              {token.text}
            </span>
            <button
              onClick={() => speak(token.text)}
              className="text-lg"
              style={{ color: '#c8b89a' }}
              title="播放发音"
            >
              ♪
            </button>
          </div>
          <p className="font-pixel text-[8px] pl-0.5 mt-1" style={{ color: '#7a6a55' }}>{token.reading}</p>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none mt-0.5"
          style={{ color: '#c8b89a' }}
        >
          ✕
        </button>
      </div>

      {/* Question */}
      <p className="text-sm font-bold mb-3 leading-snug" style={{ color: '#1a0f00' }}>{token.question}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {token.options?.map((opt, idx) => {
          const isCorrect = idx === token.correct;
          const isChosen  = chosen === idx;
          const isWrong   = wrongIdx === idx;

          let bg = '#fdf6e3', color = '#1a0f00', border = `2px solid ${BORDER}`, shadow = `2px 2px 0 ${BORDER}`;
          if (isChosen && isCorrect) {
            bg = '#d4edcc'; color = '#2d6e2a'; border = '2px solid #2d6e2a'; shadow = '2px 2px 0 #2d6e2a';
          } else if (isWrong) {
            bg = '#fde8e8'; color = '#7f1d1d'; border = '2px solid #7f1d1d'; shadow = '2px 2px 0 #7f1d1d';
          } else if (chosen !== null && isCorrect) {
            bg = '#d4edcc'; color = '#2d6e2a'; border = '2px solid #2d6e2a'; shadow = '2px 2px 0 #2d6e2a';
          }

          return (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${isWrong ? 'animate-shake' : ''}`}
              style={{ background: bg, color, border, boxShadow: shadow, borderRadius: '2px' }}
            >
              <span className="font-pixel text-[8px] mr-2" style={{ color: bg === '#fdf6e3' ? '#c8b89a' : color }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + actions — shown after correct answer */}
      {chosen !== null && (
        <div className="mt-4 pt-3 fade-up" style={{ borderTop: `2px solid ${BG}` }}>
          {token.explanation && (
            <>
              <p className="font-pixel text-[7px] mb-1.5" style={{ color: DARK }}>解析</p>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#7a6a55' }}>{token.explanation}</p>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setSaved(true); onSaveNote(); }}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all"
              style={saved
                ? { background: BG, color: DARK, border: `2px solid ${MID}`, borderRadius: '2px', opacity: 0.7 }
                : { background: CARD, color: DARK, border: `2px solid ${DARK}`, boxShadow: `2px 2px 0 ${DARK}`, borderRadius: '2px' }}
            >
              {saved ? '✓ 已记录' : '+ 记笔记'}
            </button>
            <button
              onClick={onCorrect}
              className="flex-1 py-2 text-sm font-bold active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{ background: '#2d6e2a', color: '#fff', border: `2px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              继续 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Completion screen ─────────────────────────────────────────────
function CompletionScreen({ sentence, onNext, hasNext }: {
  sentence: PuzzleSentence;
  onNext: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="bounce-in max-w-sm mx-auto p-8 text-center"
         style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `5px 5px 0 ${BORDER}`, borderRadius: '2px' }}>
      <div className="font-pixel text-[10px] mb-4" style={{ color: DARK }}>PUZZLE CLEAR!</div>
      <div className="font-pixel text-2xl mb-4" style={{ color: DARK }}>★★★</div>
      <p className="text-xs mb-5" style={{ color: '#7a6a55' }}>你掌握了这句话的关键语法点</p>

      <div className="p-4 mb-5 text-left"
           style={{ background: BG, border: `2px solid ${DARK}`, borderRadius: '2px' }}>
        <p className="font-pixel text-[7px] mb-2" style={{ color: DARK }}>完整翻译</p>
        <p className="text-sm font-medium leading-relaxed" style={{ color: '#1a0f00' }}>{sentence.fullTranslation}</p>
      </div>

      {hasNext ? (
        <button
          onClick={onNext}
          className="w-full py-3 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          style={{ background: DARK, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
        >
          ▶ 下一句
        </button>
      ) : (
        <div className="font-pixel text-[9px]" style={{ color: '#7a6a55' }}>ALL CLEAR! 所有例句已完成</div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function PuzzlePage() {
  const { updateUser, addNote } = useUser();
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [solved, setSolved]           = useState<Set<number>>(new Set());
  const [activeIdx, setActiveIdx]     = useState<number | null>(null);
  const [shakeIdx, setShakeIdx]       = useState<number | null>(null);
  const [completed, setCompleted]     = useState(false);

  const sentence  = puzzles[sentenceIdx];
  const quizTokens = sentence.tokens
    .map((t, i) => ({ token: t, idx: i }))
    .filter(({ token }) => !token.skip && Boolean(token.question));
  const totalCount  = quizTokens.length;
  const solvedCount = quizTokens.filter(({ idx }) => solved.has(idx)).length;
  const progress    = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  useEffect(() => { updateUser({ lastModule: 'flashcards' }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const text = sentence.tokens.map((t) => t.text).join('');
    speak(text);
    setSolved(new Set());
    setActiveIdx(null);
    setShakeIdx(null);
    setCompleted(false);
  }, [sentenceIdx]);

  const handleTokenClick = useCallback((idx: number) => {
    if (solved.has(idx)) return;
    setActiveIdx((prev) => (prev === idx ? null : idx));
  }, [solved]);

  const handleCorrect = useCallback(() => {
    if (activeIdx === null) return;
    const next = new Set([...solved, activeIdx]);
    setSolved(next);
    setActiveIdx(null);
    const solvedQuizCount = quizTokens.filter(({ idx }) => next.has(idx)).length;
    if (solvedQuizCount === totalCount) {
      setTimeout(() => setCompleted(true), 400);
    }
  }, [activeIdx, solved, quizTokens, totalCount]);

  const handleWrongShake = useCallback(() => {
    if (activeIdx === null) return;
    setShakeIdx(activeIdx);
    setTimeout(() => setShakeIdx(null), 600);
  }, [activeIdx]);

  const goToSentence = (idx: number) => {
    setSentenceIdx(idx);
  };

  const activeToken = activeIdx !== null ? sentence.tokens[activeIdx] : null;

  return (
    <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">

      {/* Zone header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3"
             style={{ background: DARK, borderRadius: '2px' }}>
          <span className="font-pixel text-[7px] text-white opacity-80">ZONE 3</span>
          <span className="text-white text-xs font-bold">謎の神殿</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DARK }}>
          <span className="inline-flex items-center justify-center w-9 h-9 text-lg font-bold"
                style={{ border: `3px solid ${DARK}`, background: MID, borderRadius: '2px', boxShadow: `3px 3px 0 ${DARK}` }}>？</span>
          句子解謎
        </h1>
        <p className="text-sm mt-1.5" style={{ color: '#7a6a55' }}>
          点击<span className="font-medium" style={{ color: '#1a0f00' }}>灰色词语</span>答题 · 彩色词语已标注词性
        </p>
      </div>

      {/* Sentence selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {puzzles.map((s, i) => {
          const active = i === sentenceIdx;
          const lvlBg = s.level === 'N5' ? '#d4edcc' : s.level === 'N4' ? '#d0e8fd' : '#fdd8b0';
          const lvlColor = s.level === 'N5' ? '#2d6e2a' : s.level === 'N4' ? '#1e4d7a' : '#7a3800';
          return (
            <button
              key={s.id}
              onClick={() => goToSentence(i)}
              className="px-3 py-1.5 text-xs font-bold active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={active
                ? { background: DARK, color: '#fff', border: `2px solid ${DARK}`, boxShadow: `3px 3px 0 ${DARK}`, borderRadius: '2px' }
                : { background: CARD, color: '#7a6a55', border: `2px solid ${BORDER}`, boxShadow: `2px 2px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              <span className="font-pixel text-[7px] mr-1.5 px-1.5 py-0.5"
                    style={{ background: active ? 'rgba(255,255,255,0.2)' : lvlBg, color: active ? '#fff' : lvlColor, borderRadius: '2px' }}>
                {s.level}
              </span>
              {s.theme}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-pixel text-[9px]" style={{ color: '#7a6a55' }}>
            已解答 {solvedCount} / {totalCount} 个关键词
          </span>
          <button
            onClick={() => { const text = sentence.tokens.map((t) => t.text).join(''); speak(text); }}
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: '#7a6a55' }}
            title="朗读整句"
          >
            ♪ 朗读全句
          </button>
        </div>
        <div className="h-4 relative" style={{ border: `2px solid ${BORDER}`, background: '#e8dcc8', borderRadius: '2px', boxShadow: `2px 2px 0 ${BORDER}` }}>
          <div className="h-full transition-all duration-500"
               style={{ width: `${progress}%`, background: DARK, borderRadius: '1px' }} />
        </div>
      </div>

      {completed ? (
        <CompletionScreen
          sentence={sentence}
          onNext={() => goToSentence(sentenceIdx + 1)}
          hasNext={sentenceIdx + 1 < puzzles.length}
        />
      ) : (
        <>
          {/* Sentence display */}
          <div className="p-6 mb-6"
               style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `4px 4px 0 ${BORDER}`, borderRadius: '2px' }}>
            <div className="flex flex-wrap gap-x-3 gap-y-5 items-end justify-center">
              {sentence.tokens.map((token, idx) => (
                <TokenChip
                  key={idx}
                  token={token}
                  solved={solved.has(idx)}
                  active={activeIdx === idx}
                  shake={shakeIdx === idx}
                  onClick={() => handleTokenClick(idx)}
                />
              ))}
            </div>

            {solvedCount === 0 && (
              <p className="text-center font-pixel text-[8px] mt-5" style={{ color: '#c8b89a' }}>
                点击带 ？ 的词语开始答题
              </p>
            )}
          </div>

          {/* Question card */}
          {activeToken && (
            <QuestionCard
              key={activeIdx}
              token={activeToken}
              sentenceText={sentence.tokens.map((t) => t.text).join('')}
              onCorrect={handleCorrect}
              onWrong={handleWrongShake}
              onClose={() => setActiveIdx(null)}
              onSaveNote={() => {
                if (!activeToken.question || !activeToken.explanation || activeToken.correct === undefined) return;
                addNote({
                  source: 'puzzle',
                  word: activeToken.text,
                  reading: activeToken.reading,
                  sentence: sentence.tokens.map((t) => t.text).join(''),
                  type: activeToken.type,
                  question: activeToken.question,
                  answer: activeToken.options![activeToken.correct],
                  explanation: activeToken.explanation,
                });
              }}
            />
          )}

          {/* Color legend */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {(Object.entries(typeStyle) as [string, typeof typeStyle[keyof typeof typeStyle]][])
              .filter(([k]) => k !== 'skip')
              .map(([, v]) => (
                <span
                  key={v.label}
                  className={`font-pixel text-[7px] font-semibold px-2.5 py-1 border ${v.chip}`}
                  style={{ borderRadius: '2px' }}
                >
                  {v.label}
                </span>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
