'use client';

import { useState, useMemo, useEffect } from 'react';
import { allKana, KanaItem } from '../data/kana';
import { vocabulary, VocabItem } from '../data/vocabulary';
import { playCorrect, playWrong } from '../lib/sound';
import { speak } from '../lib/speech';

interface WarmUpProps {
  kanaCorrect: string[];
  vocabKnown: string[];
  lastModule: 'gojuuon' | 'flashcards' | 'grammar' | null;
  onFinish: (goTo: 'continue' | 'home') => void;
}

type Question =
  | { type: 'kana'; prompt: string; answer: string; options: string[] }
  | { type: 'vocab'; prompt: string; answer: string; options: string[] };

const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const DARK   = '#7a4800';
const MID    = '#f5c860';
const BG     = '#fde8b0';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(kanaCorrect: string[], vocabKnown: string[]): Question[] {
  const questions: Question[] = [];

  const knownKana: KanaItem[] = allKana.filter((k) => kanaCorrect.includes(k.romaji));
  if (knownKana.length >= 2) {
    const picks = shuffle(knownKana).slice(0, 2);
    picks.forEach((k) => {
      const wrongs = shuffle(allKana.filter((x) => x.romaji !== k.romaji))
        .slice(0, 3)
        .map((x) => x.romaji);
      questions.push({
        type: 'kana',
        prompt: k.hiragana,
        answer: k.romaji,
        options: shuffle([k.romaji, ...wrongs]),
      });
    });
  }

  const knownVocab: VocabItem[] = vocabulary.filter((v) => vocabKnown.includes(v.word));
  if (knownVocab.length >= 2) {
    const picks = shuffle(knownVocab).slice(0, 2);
    picks.forEach((v) => {
      const wrongs = shuffle(vocabulary.filter((x) => x.word !== v.word))
        .slice(0, 3)
        .map((x) => x.meaning);
      questions.push({
        type: 'vocab',
        prompt: v.word,
        answer: v.meaning,
        options: shuffle([v.meaning, ...wrongs]),
      });
    });
  }

  return shuffle(questions).slice(0, 3);
}

const moduleLabel: Record<string, string> = {
  gojuuon: '五十音测验',
  flashcards: '单词闪卡',
  grammar: '语法辨义',
};

export default function WarmUp({ kanaCorrect, vocabKnown, lastModule, onFinish }: WarmUpProps) {
  const questions = useMemo(
    () => buildQuestions(kanaCorrect, vocabKnown),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (questions.length === 0) return;
    const q = questions[index];
    if (q?.type === 'kana') speak(q.prompt);
  }, [index, questions]);

  if (questions.length === 0) return null;

  const q = questions[index];

  const handleAnswer = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === q.answer) {
      playCorrect();
      setCorrect((c) => c + 1);
    } else {
      playWrong();
    }
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
      }
    }, 800);
  };

  if (done) {
    return (
      <div className="p-5"
           style={{ background: BG, border: `3px solid ${DARK}`, boxShadow: `4px 4px 0 ${DARK}`, borderRadius: '2px' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center text-xl font-bold shrink-0"
               style={{ border: `2px solid ${DARK}`, background: MID, borderRadius: '2px' }}>✓</div>
          <div>
            <p className="font-bold text-sm" style={{ color: DARK }}>热身完成！</p>
            <p className="font-pixel text-[8px] mt-0.5" style={{ color: DARK }}>
              答对 {correct} / {questions.length} 题
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          {lastModule && (
            <button
              onClick={() => onFinish('continue')}
              className="flex-1 py-2.5 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ background: DARK, color: '#fff', border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
            >
              继续{moduleLabel[lastModule]} →
            </button>
          )}
          <button
            onClick={() => onFinish('home')}
            className={`py-2.5 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all ${lastModule ? 'px-4' : 'flex-1'}`}
            style={{ background: CARD, color: DARK, border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}
          >
            回到首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bounce-in"
         style={{ background: BG, border: `3px solid ${DARK}`, boxShadow: `4px 4px 0 ${DARK}`, borderRadius: '2px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="font-bold text-sm" style={{ color: DARK }}>热身一下</span>
          <span className="font-pixel text-[8px]" style={{ color: DARK, opacity: 0.6 }}>
            {index + 1}/{questions.length}
          </span>
        </div>
        {/* Pixel progress squares */}
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: 20, height: 8,
                borderRadius: '2px',
                border: `2px solid ${DARK}`,
                background: i <= index ? DARK : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-5 py-4 px-3"
           style={{ background: CARD, border: `2px solid ${DARK}`, borderRadius: '2px' }}>
        <p className="font-pixel text-[8px] mb-3" style={{ color: '#7a6a55' }}>
          {q.type === 'kana' ? '这个假名的罗马字是？' : '这个词的意思是？'}
        </p>
        <div className="text-5xl font-bold" style={{ color: '#1a0f00' }}>{q.prompt}</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((opt) => {
          let bg = CARD, color = '#1a0f00', border = `3px solid ${BORDER}`, shadow = `3px 3px 0 ${BORDER}`;
          if (selected !== null) {
            if (opt === q.answer) {
              bg = '#d4edcc'; color = '#2d6e2a'; border = '3px solid #2d6e2a'; shadow = '3px 3px 0 #2d6e2a';
            } else if (opt === selected) {
              bg = '#fde8e8'; color = '#7f1d1d'; border = '3px solid #7f1d1d'; shadow = '3px 3px 0 #7f1d1d';
            } else {
              bg = '#f0ebe0'; color = '#c8b89a'; shadow = 'none';
            }
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="py-2.5 text-sm font-bold active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ background: bg, color, border, boxShadow: shadow, borderRadius: '2px' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
