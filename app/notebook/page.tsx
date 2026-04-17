'use client';

import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { typeStyle, TokenType } from '../data/puzzles';
import { speak } from '../lib/speech';
import { NoteEntry } from '../data/users';

type Tab = '全部' | '生字本' | '语法笔记';

const BORDER = '#2d1810';
const CARD   = '#fffdf7';
const DARK   = '#7f1d1d';
const MID    = '#f4a7a0';
const BG     = '#fde8e8';

const levelColors: Record<string, { dark: string; bg: string }> = {
  N5: { dark: '#2d6e2a', bg: '#d4edcc' },
  N4: { dark: '#1e4d7a', bg: '#d0e8fd' },
  N3: { dark: '#7a3800', bg: '#fdd8b0' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// ── Vocab note card ───────────────────────────────────────────────
function VocabNoteCard({ note, onDelete }: { note: NoteEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const lv = levelColors[note.level ?? ''] ?? { dark: '#7a6a55', bg: '#f0ebe0' };

  return (
    <div style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-3"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Word badge */}
        <span className="shrink-0 px-2.5 py-1 text-base font-bold leading-tight"
              style={{ background: lv.bg, color: lv.dark, border: `2px solid ${lv.dark}`, borderRadius: '2px' }}>
          {note.word}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7a6a55' }}>{note.reading}</span>
            {note.level && (
              <span className="font-pixel text-[7px] px-1.5 py-0.5"
                    style={{ background: lv.bg, color: lv.dark, border: `1px solid ${lv.dark}`, borderRadius: '2px' }}>
                {note.level}
              </span>
            )}
            {note.category && (
              <span className="text-[10px]" style={{ color: '#c8b89a' }}>{note.category}</span>
            )}
          </div>
          <p className="text-sm font-bold mt-0.5" style={{ color: '#1a0f00' }}>{note.meaning}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-pixel text-[7px]" style={{ color: '#c8b89a' }}>{formatDate(note.savedAt)}</span>
          <span className="text-xs transition-transform" style={{ color: '#c8b89a', display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 fade-up" style={{ borderTop: `2px solid ${BG}` }}>
          <div className="mt-3 mb-2">
            <span className="text-xs italic" style={{ color: '#7a6a55' }}>{note.romaji}</span>
          </div>

          {note.sentence && (
            <div className="mb-4">
              <p className="font-pixel text-[7px] mb-1.5" style={{ color: '#7a6a55' }}>例句</p>
              <div className="flex items-start gap-2">
                <div>
                  <button onClick={() => speak(note.sentence)} className="text-left">
                    <p className="text-sm font-medium" style={{ color: '#1a0f00' }}>{note.sentence}</p>
                  </button>
                  {note.sentenceReading && <p className="text-[11px] mt-0.5" style={{ color: '#7a6a55' }}>{note.sentenceReading}</p>}
                  {note.sentenceMeaning && <p className="text-xs mt-0.5" style={{ color: '#7a6a55' }}>{note.sentenceMeaning}</p>}
                </div>
                <button onClick={() => speak(note.sentence)} className="shrink-0 mt-0.5 text-lg" style={{ color: '#c8b89a' }}>♪</button>
              </div>
            </div>
          )}

          <button onClick={onDelete} className="text-xs font-bold" style={{ color: '#c8b89a' }}>
            删除此笔记
          </button>
        </div>
      )}
    </div>
  );
}

// ── Puzzle note card ──────────────────────────────────────────────
function PuzzleNoteCard({ note, onDelete }: { note: NoteEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const style = typeStyle[note.type as TokenType] ?? typeStyle.noun;

  return (
    <div style={{ background: CARD, border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-3"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className={`shrink-0 px-2.5 py-1 border text-base font-bold leading-tight ${style.chip}`}
              style={{ borderRadius: '2px' }}>
          {note.word}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7a6a55' }}>{note.reading}</span>
            <span className={`font-pixel text-[7px] px-1.5 py-0.5 border ${style.chip}`}
                  style={{ borderRadius: '2px' }}>
              {style.label}
            </span>
          </div>
          <p className="text-sm mt-0.5 truncate" style={{ color: '#1a0f00' }}>{note.question}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-pixel text-[7px]" style={{ color: '#c8b89a' }}>{formatDate(note.savedAt)}</span>
          <span className="text-xs" style={{ color: '#c8b89a', display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 fade-up" style={{ borderTop: `2px solid ${BG}` }}>
          {note.sentence && (
            <div className="mt-3 mb-3">
              <p className="font-pixel text-[7px] mb-1" style={{ color: '#7a6a55' }}>例句</p>
              <div className="flex items-center gap-2">
                <p className="text-sm" style={{ color: '#1a0f00' }}>{note.sentence}</p>
                <button onClick={() => speak(note.sentence)} className="text-lg shrink-0" style={{ color: '#c8b89a' }}>♪</button>
              </div>
            </div>
          )}

          {note.answer && (
            <div className="mb-3">
              <p className="font-pixel text-[7px] mb-1" style={{ color: '#7a6a55' }}>正确答案</p>
              <p className="text-sm font-bold" style={{ color: '#2d6e2a' }}>✓ {note.answer}</p>
            </div>
          )}

          {note.explanation && (
            <div className="mb-4">
              <p className="font-pixel text-[7px] mb-1" style={{ color: '#4c1d95' }}>解析</p>
              <p className="text-xs leading-relaxed" style={{ color: '#7a6a55' }}>{note.explanation}</p>
            </div>
          )}

          <button onClick={onDelete} className="text-xs font-bold" style={{ color: '#c8b89a' }}>
            删除此笔记
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function NotebookPage() {
  const { user, deleteNote } = useUser();
  const [tab, setTab] = useState<Tab>('全部');

  if (!user) return null;

  const notes = user.notes ?? [];
  const vocabNotes  = notes.filter((n) => n.source === 'vocab');
  const puzzleNotes = notes.filter((n) => n.source === 'puzzle');

  const displayed = tab === '全部' ? notes : tab === '生字本' ? vocabNotes : puzzleNotes;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: '全部',   label: '全部',   count: notes.length },
    { key: '生字本', label: '生字本', count: vocabNotes.length },
    { key: '语法笔记', label: '语法笔记', count: puzzleNotes.length },
  ];

  return (
    <div className="min-h-screen px-5 py-10 max-w-4xl mx-auto">

      {/* Zone header */}
      <div className="mb-7">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3"
             style={{ background: DARK, borderRadius: '2px' }}>
          <span className="font-pixel text-[7px] text-white opacity-80">LOG</span>
          <span className="text-white text-xs font-bold">冒険日誌</span>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DARK }}>
          <span className="inline-flex items-center justify-center w-9 h-9 text-lg font-bold"
                style={{ border: `3px solid ${DARK}`, background: MID, borderRadius: '2px', boxShadow: `3px 3px 0 ${DARK}` }}>日</span>
          冒険日誌
        </h1>
        <p className="text-sm mt-1.5" style={{ color: '#7a6a55' }}>翻牌或解谜时点「记录」，随时复习</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center mt-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-sm" style={{ color: '#7a6a55' }}>还没有笔记</p>
          <p className="text-xs mt-1" style={{ color: '#c8b89a' }}>
            在单词闪卡翻转后、或句子解谜答对后，点击「记录」保存
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex mb-6 w-fit"
               style={{ border: `3px solid ${BORDER}`, boxShadow: `3px 3px 0 ${BORDER}`, borderRadius: '2px' }}>
            {tabs.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 text-sm font-bold flex items-center gap-1.5"
                style={tab === t.key
                  ? { background: DARK, color: '#fff' }
                  : { background: CARD, color: '#7a6a55', borderRight: i < tabs.length - 1 ? `2px solid ${BORDER}` : undefined }}
              >
                {t.label}
                <span className="font-pixel text-[8px] px-1.5 py-0.5"
                      style={tab === t.key
                        ? { background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '2px' }
                        : { background: '#f0ebe0', color: '#7a6a55', borderRadius: '2px' }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div className="text-center mt-16 font-pixel text-[9px]" style={{ color: '#c8b89a' }}>该分类暂无笔记</div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayed.map((note) =>
                note.source === 'vocab' ? (
                  <VocabNoteCard key={note.id} note={note} onDelete={() => deleteNote(note.id)} />
                ) : (
                  <PuzzleNoteCard key={note.id} note={note} onDelete={() => deleteNote(note.id)} />
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
